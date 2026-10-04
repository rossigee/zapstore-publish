import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { generateSecretKey, getPublicKey, nip19, verifyEvent } from "nostr-tools";

import {
  createLocalSigner,
  decodeSecretKey,
  isBunkerUrl,
  parseBunkerUrl,
  UnsupportedIdentityError,
} from "../src/nostr/signer.ts";

describe("decodeSecretKey", () => {
  const secret = generateSecretKey();
  const hex = Buffer.from(secret).toString("hex");

  test("accepts 64 hex characters", () => {
    assert.deepEqual(decodeSecretKey(hex), new Uint8Array(secret));
  });

  test("accepts an nsec and returns the same key", () => {
    assert.deepEqual(decodeSecretKey(nip19.nsecEncode(secret)), new Uint8Array(secret));
  });

  test("is case insensitive about hex", () => {
    assert.deepEqual(decodeSecretKey(hex.toUpperCase()), new Uint8Array(secret));
  });

  test("rejects an npub, which cannot sign", () => {
    assert.throws(() => decodeSecretKey(nip19.npubEncode(getPublicKey(secret))), UnsupportedIdentityError);
  });

  test("rejects junk with an actionable message", () => {
    assert.throws(() => decodeSecretKey("hunter2"), /must be an nsec1/);
  });
});

describe("isBunkerUrl", () => {
  test("recognises both connection token forms", () => {
    assert.ok(isBunkerUrl("bunker://abc?relay=wss://x"));
    assert.ok(isBunkerUrl("nostrconnect://abc?relay=wss://x"));
    assert.ok(!isBunkerUrl("nsec1abc"));
  });
});

describe("parseBunkerUrl", () => {
  const pubkey = getPublicKey(generateSecretKey());
  const npub = nip19.npubEncode(pubkey);

  test("parses a hex signer key with a relay and secret", () => {
    const pointer = parseBunkerUrl(`bunker://${pubkey}?relay=wss://relay.example&secret=s3cret`);
    assert.equal(pointer.remoteSignerPubkey, pubkey);
    assert.deepEqual(pointer.relays, ["wss://relay.example"]);
    assert.equal(pointer.secret, "s3cret");
  });

  test("parses an npub signer key", () => {
    const pointer = parseBunkerUrl(`bunker://${npub}?relay=wss://a.example&relay=wss://b.example`);
    assert.equal(pointer.remoteSignerPubkey, pubkey);
    assert.deepEqual(pointer.relays, ["wss://a.example", "wss://b.example"]);
    assert.equal(pointer.secret, undefined);
  });

  test("requires at least one relay", () => {
    assert.throws(() => parseBunkerUrl(`bunker://${pubkey}`), /no relay/);
  });

  test("refuses nostrconnect, which needs an inbound relay subscription", () => {
    assert.throws(
      () => parseBunkerUrl(`nostrconnect://${pubkey}?relay=wss://relay.example&secret=x`),
      /use a bunker:\/\/ URL in CI/,
    );
  });

  test("rejects a token with no signer key", () => {
    assert.throws(() => parseBunkerUrl("bunker://?relay=wss://relay.example"), /neither a hex nor npub/);
  });
});

describe("createLocalSigner", () => {
  const secret = generateSecretKey();

  test("reports the derived public key", () => {
    assert.equal(createLocalSigner(secret).publicKey, getPublicKey(secret));
  });

  test("produces a signature nostr-tools accepts", async () => {
    const signer = createLocalSigner(secret);
    const event = await signer.signEvent({
      kind: 30063,
      content: "release notes",
      tags: [["d", "org.example@1.0.0"]],
      created_at: 1_700_000_000,
    });

    // Trust nostr-tools' own verification rather than reimplementing it.
    assert.ok(verifyEvent(event), "event should verify");
    assert.equal(event.pubkey, getPublicKey(secret));
    assert.equal(event.kind, 30063);
    // Event ids are the SHA-256 of the serialized form, so a stable template
    // must produce a stable id.
    assert.match(event.id, /^[0-9a-f]{64}$/);
    assert.equal(
      event.id,
      (
        await createLocalSigner(secret).signEvent({
          kind: 30063,
          content: "release notes",
          tags: [["d", "org.example@1.0.0"]],
          created_at: 1_700_000_000,
        })
      ).id,
    );
  });

  test("close is a no-op for a local signer", async () => {
    await createLocalSigner(secret).close();
  });
});
