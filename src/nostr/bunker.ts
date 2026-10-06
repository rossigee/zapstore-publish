/**
 * NIP-46 remote signing client.
 *
 * The protocol is small: NIP-44 encrypted JSON-RPC carried in kind 24133 events
 * p-tagged to the client's ephemeral key. The client sends `connect`, learns the
 * signer's real identity with `get_public_key`, and then asks it to sign each
 * event. Requests and responses are correlated by id.
 *
 * Implemented directly on `nostr-tools` primitives rather than depending on a
 * separate NIP-46 package, which keeps the dependency surface of a release
 * pipeline small.
 *
 * The transport is an interface so the protocol and its NIP-44 handling can be
 * exercised against an in-process signer, with no relay and no network.
 */

import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip44,
  type EventTemplate,
  type NostrEvent,
  type VerifiedEvent,
} from "nostr-tools";

import type { BunkerPointer, Signer } from "./signer.ts";

/** NIP-46 request and response events. */
const RPC_KIND = 24133;

/** Requested when the caller does not narrow them. */
const DEFAULT_PERMS = ["sign_event", "get_public_key"];

/** A response as it arrives, before decryption. */
export interface RpcEnvelope {
  content: string;
  pubkey: string;
}

/**
 * Moves NIP-46 envelopes between this process and a remote signer.
 *
 * Knows nothing about encryption or JSON: it signs and publishes a request, and
 * reports whatever responses arrive. Authenticating and routing them by id is
 * the protocol layer's job.
 */
export interface RpcTransport {
  publish(request: EventTemplate): Promise<void>;
  /** Registers the response handler. Invoked once, immediately. */
  onResponse(handler: (envelope: RpcEnvelope) => void): void;
  close(): Promise<void>;
}

/** The ephemeral identity this client signs its own requests with. */
export interface ClientIdentity {
  secret: Uint8Array;
  pubkey: string;
}

export type TransportFactory = (pointer: BunkerPointer, identity: ClientIdentity) => Promise<RpcTransport>;

/** The real transport: kind 24133 events over the relays named in the bunker URL. */
export const relayTransport: TransportFactory = async (pointer, identity) => {
  const pool = new SimplePool();
  let handler: ((envelope: RpcEnvelope) => void) | undefined;

  const inbox = pool.subscribe(
    pointer.relays,
    { kinds: [RPC_KIND], "#p": [identity.pubkey] },
    {
      onevent: (event: NostrEvent) => {
        handler?.({ content: event.content, pubkey: event.pubkey });
      },
    },
  );

  return {
    async publish(request) {
      await Promise.all(pool.publish(pointer.relays, finalizeEvent(request, identity.secret)));
    },
    onResponse(next) {
      handler = next;
    },
    async close() {
      inbox.close();
      pool.close(pointer.relays);
    },
  };
};

export interface BunkerSignerOptions {
  /**
   * Milliseconds to wait for each response. Bunkers that queue requests for a
   * human to approve can be slow, so this is deliberately generous.
   */
  timeoutMs?: number;
  /** Overrides the permissions requested in the connect call. */
  perms?: string[];
  /** Identifies this client to the bunker operator. */
  clientName?: string;
  clientUrl?: string;
  /** Overrides the transport. Defaults to the bunker URL's relays. */
  transport?: TransportFactory;
  /**
   * Overrides the ephemeral client key.
   *
   * Only tests need this. Supplying it lets the caller derive the NIP-44
   * conversation key up front, so an in-process signer can decrypt what this
   * client sends and reply in kind.
   */
  clientSecret?: Uint8Array;
}

interface DecodedResponse {
  id?: string;
  result?: string;
  error?: string;
}

/**
 * A signer that delegates to a NIP-46 remote signer.
 *
 * Each call generates a fresh ephemeral keypair and its own subscription, so a
 * short-lived CI job needs no persisted session state.
 */
export async function createBunkerSigner(
  pointer: BunkerPointer,
  options: BunkerSignerOptions = {},
): Promise<Signer> {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const perms = options.perms ?? DEFAULT_PERMS;

  const secret = options.clientSecret ?? generateSecretKey();
  const pubkey = getPublicKey(secret);

  // NIP-44 derives a single conversation key per pair of identities, used for
  // both directions. Deriving a second one from the signer's side for inbound
  // traffic yields a different key and every response is silently discarded, so
  // this one key both encrypts requests and decrypts replies. Its AEAD is also
  // what proves a response came from the signer rather than a random peer.
  const conversationKey = nip44.getConversationKey(secret, pointer.remoteSignerPubkey);

  const transport = await (options.transport ?? relayTransport)(pointer, { secret, pubkey });
  const pending = new Map<string, {
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  transport.onResponse(({ content }) => {
    let response: DecodedResponse;
    try {
      // Decryption only succeeds for the signer, since only the two parties can
      // derive this key, so anything else is dropped before it reaches a waiter.
      response = JSON.parse(nip44.v2.decrypt(content, conversationKey)) as DecodedResponse;
    } catch {
      return;
    }
    if (typeof response.id !== "string") return;
    const waiter = pending.get(response.id);
    if (!waiter) return;
    pending.delete(response.id);
    // The timer is deliberately not unref'd, so it must be cleared on every
    // settle path. Leaving it armed would keep the event loop alive for the full
    // timeout after a successful publish.
    clearTimeout(waiter.timer);
    if (typeof response.error === "string") waiter.reject(new Error(response.error));
    else if (typeof response.result === "string") waiter.resolve(response.result);
    else waiter.reject(new Error(`remote signer returned no result for ${response.id}`));
  });

  let nextId = 0;

  const request = async (method: string, params: string[]): Promise<string> => {
    const id = String(++nextId);
    const envelope = JSON.stringify({ id, method, params });

    const answer = new Promise<string>((resolve, reject) => {
      // Deliberately not unref'd. If the relay connection drops, an unref'd timer
      // would let the process exit 0 and the step would report success without
      // ever having published anything. The timer has to be able to fail.
      const timer = setTimeout(() => {
        if (pending.delete(id)) {
          reject(new Error(`remote signer did not answer ${method} within ${timeoutMs}ms`));
        }
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
    });

    await transport.publish({
      kind: RPC_KIND,
      content: nip44.v2.encrypt(envelope, conversationKey),
      tags: [["p", pointer.remoteSignerPubkey]],
      created_at: Math.floor(Date.now() / 1000),
    });

    return answer;
  };

  const connectParams: string[] = [pointer.remoteSignerPubkey];
  if (pointer.secret) connectParams.push(pointer.secret);
  connectParams.push(perms.join(","));
  if (options.clientName) {
    connectParams.push(JSON.stringify({ name: options.clientName, url: options.clientUrl }));
  }

  try {
    await request("connect", connectParams);
  } catch (cause) {
    await transport.close();
    throw new Error(
      `could not connect to the remote signer: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  const publicKey = await request("get_public_key", []);
  if (!/^[0-9a-f]{64}$/i.test(publicKey)) {
    await transport.close();
    throw new Error(`remote signer returned an implausible public key: ${publicKey.slice(0, 16)}`);
  }

  return {
    publicKey,
    kind: "bunker",
    async signEvent(template: EventTemplate): Promise<VerifiedEvent> {
      const serialized = await request("sign_event", [JSON.stringify(template)]);
      const signed = JSON.parse(serialized) as VerifiedEvent;
      if (!signed.sig || !signed.id) {
        throw new Error("remote signer returned an event without a signature");
      }
      return signed;
    },
    async close(): Promise<void> {
      await transport.close();
      for (const waiter of pending.values()) {
        clearTimeout(waiter.timer);
        waiter.reject(new Error("signer closed before the request completed"));
      }
      pending.clear();
    },
  };
}
