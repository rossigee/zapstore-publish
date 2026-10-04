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
function createMockBunker(signerSecret: Uint8Array, behaviour: "normal" | "unresponsive" | "error" = "normal") {
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
          reply({ id: rpc.id, result: JSON.stringify(finalizeEvent(template, signerSecret)) });
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
