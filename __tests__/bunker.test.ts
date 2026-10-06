import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { finalizeEvent, generateSecretKey, getPublicKey, nip44, verifyEvent } from "nostr-tools";

import { createBunkerSigner, type RpcTransport } from "../src/nostr/bunker.ts";
import type { BunkerPointer } from "../src/nostr/signer.ts";

/**
 * An in-process remote signer that speaks real NIP-46: it derives the same
 * NIP-44 conversation keys, decrypts the requests, and encrypts its replies.
 *
 * Deriving the key needs the client's ephemeral secret, which is why
 * `BunkerSignerOptions.clientSecret` exists. Holding the key fixed also makes the
 * test deterministic.
 */
/**
 * How a signer may misbehave when asked to sign.
 *
 * A NIP-46 signer is a third-party application reached over a relay, so what it
 * returns has to be checked rather than trusted. Each of these returns something
 * that carries a valid signature over *some* event, which is exactly the shape a
 * naive `sig && id` check accepts.
 */
type Misbehaviour =
  | "normal"
  | "unresponsive"
  | "error"
  /** Signs correctly, but for a key other than the one get_public_key reported. */
  | "wrong-pubkey"
  /** Returns a valid, correctly signed event with different content. */
  | "swapped-content"
  /** Corrupts the content after signing, so the id no longer matches. */
  | "tampered"
  /** Reports a different created_at than was asked for. */
  | "wrong-created-at"
  /** Reorders the tags, which is meaningful for a release's `e` tag. */
  | "reordered-tags"
  /** Omits the signature. */
  | "unsigned"
  /** Returns something that is not JSON. */
  | "not-json";

function createMockBunker(signerSecret: Uint8Array, behaviour: Misbehaviour = "normal") {
  const signerPubkey = getPublicKey(signerSecret);
  const seen: { method: string; params: string[] }[] = [];
  let handler: ((envelope: { content: string; pubkey: string }) => void) | undefined;
  let closed = false;

  const pointer: BunkerPointer = {
    remoteSignerPubkey: signerPubkey,
    relays: ["wss://mock.invalid"],
    secret: "pairing-secret",
  };

  const transport: RpcTransport = {
    async publish(request) {
      // Requests arrive as unsigned templates. Sign with the client's key so the
      // envelope looks like it came off a relay.
      const event = finalizeEvent(request, clientSecret);
      const clientConversation = nip44.getConversationKey(clientSecret, signerPubkey);
      const rpc = JSON.parse(nip44.v2.decrypt(event.content, clientConversation)) as {
        id: string;
        method: string;
        params: string[];
      };
      seen.push({ method: rpc.method, params: rpc.params });

      if (behaviour === "unresponsive") return;

      const reply = (payload: Record<string, unknown>) => {
        const signerConversation = nip44.getConversationKey(signerSecret, event.pubkey);
        handler?.({
          content: nip44.v2.encrypt(JSON.stringify(payload), signerConversation),
          pubkey: signerPubkey,
        });
      };

      // Reply asynchronously, as a real signer over a relay would.
      queueMicrotask(() => {
        if (rpc.method === "connect") reply({ id: rpc.id, result: "ack" });
        else if (rpc.method === "get_public_key") reply({ id: rpc.id, result: signerPubkey });
        else if (rpc.method === "sign_event") {
          // Refuse only at signing time, so the connection path stays intact and
          // the test exercises the sign_event error rather than the handshake.
          if (behaviour === "error") {
            reply({ id: rpc.id, error: "this bunker refuses to sign" });
            return;
          }
          const template = JSON.parse(rpc.params[0] ?? "{}") as Parameters<typeof finalizeEvent>[0];

          if (behaviour === "unsigned") {
            const { sig: _sig, ...rest } = finalizeEvent(template, signerSecret);
            reply({ id: rpc.id, result: JSON.stringify(rest) });
            return;
          }
          if (behaviour === "not-json") {
            reply({ id: rpc.id, result: "not json at all" });
            return;
          }
          if (behaviour === "wrong-pubkey") {
            // Honestly signed, by a key the client never asked about.
            reply({ id: rpc.id, result: JSON.stringify(finalizeEvent(template, generateSecretKey())) });
            return;
          }
          if (behaviour === "swapped-content") {
            // Correctly signed by the right key, for an event nobody asked for.
            reply({
              id: rpc.id,
              result: JSON.stringify(
                finalizeEvent({ ...template, content: "a different release entirely" }, signerSecret),
              ),
            });
            return;
          }
          if (behaviour === "wrong-created-at") {
            reply({
              id: rpc.id,
              result: JSON.stringify(
                finalizeEvent({ ...template, created_at: template.created_at + 1 }, signerSecret),
              ),
            });
            return;
          }
          if (behaviour === "reordered-tags") {
            reply({
              id: rpc.id,
              result: JSON.stringify(finalizeEvent({ ...template, tags: [...template.tags].reverse() }, signerSecret)),
            });
            return;
          }

          const signed = finalizeEvent(template, signerSecret);
          if (behaviour === "tampered") {
            // A valid signature over the original content, then the content is
            // rewritten. The id and the signature both stop matching.
            reply({
              id: rpc.id,
              result: JSON.stringify({ ...signed, content: "swapped after signing" }),
            });
            return;
          }
          reply({ id: rpc.id, result: JSON.stringify(signed) });
        } else {
          reply({ id: rpc.id, error: `unsupported method ${rpc.method}` });
        }
      });
    },
    onResponse(next) {
      handler = next;
    },
    async close() {
      closed = true;
    },
  };

  // The mock needs the client's secret to answer; capture it via the factory.
  let clientSecret!: Uint8Array;
  const factory = async (_p: BunkerPointer, identity: { secret: Uint8Array }) => {
    clientSecret = identity.secret;
    return transport;
  };

  return {
    pointer,
    factory,
    seen,
    signerPubkey,
    wasClosed: () => closed,
  };
}

describe("NIP-46 bunker signer", () => {
  const signerSecret = generateSecretKey();

  test("connects, learns the signer identity, and signs through it", async () => {
    const bunker = createMockBunker(signerSecret);
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
    });

    assert.equal(signer.kind, "bunker");
    assert.equal(signer.publicKey, bunker.signerPubkey);

    const event = await signer.signEvent({
      kind: 30063,
      content: "release notes",
      tags: [["d", "org.example@1.0.0"]],
      created_at: 1_700_000_000,
    });

    // The signature must be the bunker signer's, and nostr-tools must accept it.
    assert.ok(verifyEvent(event), "event should verify");
    assert.equal(event.pubkey, bunker.signerPubkey);
    assert.equal(event.kind, 30063);
  });

  test("sends connect with the pairing secret and requested permissions", async () => {
    const bunker = createMockBunker(signerSecret);
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
      perms: ["sign_event"],
    });
    await signer.close();

    const connect = bunker.seen.find((r) => r.method === "connect");
    assert.ok(connect, "expected a connect request");
    assert.equal(connect.params[0], bunker.signerPubkey);
    assert.equal(connect.params[1], "pairing-secret");
    assert.equal(connect.params[2], "sign_event");
  });

  test("handles several signings in sequence", async () => {
    const bunker = createMockBunker(signerSecret);
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
    });

    for (const version of ["1.0.0", "1.0.1", "1.0.2"]) {
      const event = await signer.signEvent({
        kind: 30063,
        content: `release ${version}`,
        tags: [["d", `org.example@${version}`]],
        created_at: 1_700_000_000,
      });
      assert.equal(event.content, `release ${version}`);
    }
    assert.equal(bunker.seen.filter((r) => r.method === "sign_event").length, 3);
  });

  test("surfaces a refusal from the bunker", async () => {
    const bunker = createMockBunker(signerSecret, "error");
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
    });
    await assert.rejects(() => signer.signEvent({ kind: 1, content: "", tags: [], created_at: 1 }), /refuses to sign/);
  });

  test("times out rather than hanging when the bunker never answers", async () => {
    const bunker = createMockBunker(signerSecret, "unresponsive");
    await assert.rejects(
      () =>
        createBunkerSigner(bunker.pointer, {
          transport: bunker.factory,
          clientSecret: generateSecretKey(),
          timeoutMs: 150,
        }),
      /could not connect to the remote signer/,
    );
  });

  test("closes the transport", async () => {
    const bunker = createMockBunker(signerSecret);
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
    });
    assert.equal(bunker.wasClosed(), false);
    await signer.close();
    assert.equal(bunker.wasClosed(), true);
  });
});

// The remote signer is a third-party application reached over a relay, and
// everything it returns is published under this publisher's identity. Checking
// that `sig` and `id` are present proved only that the JSON had those keys, so a
// signer could return an event for another pubkey, or for content that differs
// from what was asked for, and it would be published as the publisher's own.
// An event attributed to another identity is worse than a failed step: the relay
// whitelists whichever key actually signed it.
describe("bunker signer response verification", () => {
  const signerSecret = generateSecretKey();

  const template = {
    kind: 30063,
    content: "the real release notes",
    tags: [
      ["d", "org.example@1.0.0"],
      ["e", "b".repeat(64)],
    ],
    created_at: 1_700_000_000,
  };

  async function signing(behaviour: Misbehaviour): Promise<Promise<unknown>> {
    const bunker = createMockBunker(signerSecret, behaviour);
    const signer = await createBunkerSigner(bunker.pointer, {
      transport: bunker.factory,
      clientSecret: generateSecretKey(),
    });
    return signer.signEvent(template);
  }

  test("rejects an event signed by a key get_public_key did not report", async () => {
    // The signature is valid and nostr-tools verifies it. It is simply not the
    // publisher's event, and publishing it would attribute the release to
    // whatever identity actually signed.
    await assert.rejects(() => signing("wrong-pubkey"), /returned an event for .* but get_public_key reported/);
  });

  test("rejects a correctly signed event for different content", async () => {
    await assert.rejects(() => signing("swapped-content"), /altered the event content/);
  });

  test("rejects an event whose content changed after signing", async () => {
    await assert.rejects(() => signing("tampered"), /id does not match its content|invalid signature/);
  });

  test("rejects a created_at the client did not ask for", async () => {
    await assert.rejects(() => signing("wrong-created-at"), /returned created_at 1700000001/);
  });

  test("rejects reordered tags", async () => {
    // Tag order is meaningful: a kind 30063 release reaches its asset event
    // through an `e` tag, so a reordered list is a different event.
    await assert.rejects(() => signing("reordered-tags"), /altered the event tags/);
  });

  test("rejects an unsigned event", async () => {
    await assert.rejects(() => signing("unsigned"), /without a signature/);
  });

  test("rejects a reply that is not JSON", async () => {
    await assert.rejects(() => signing("not-json"), /not JSON/);
  });

  test("still accepts an honest signer", async () => {
    const event = await (await signing("normal")) as { pubkey: string; content: string };
    assert.equal(event.content, "the real release notes");
    assert.equal(event.pubkey, getPublicKey(signerSecret));
  });
});
