import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { verifyEvent } from "nostr-tools";

import { uploadBlob, uploadAuthHeader, decodeUploadAuthHeader, sha256Hex } from "../src/blossom.ts";
import { createLocalSigner } from "../src/nostr/signer.ts";

// A throwaway key. This suite only asserts the shape and signature of the
// authorisation event, never that a particular publisher is accepted, so the
// identity is irrelevant and nothing here can touch a real listing.
const TEST_SECRET = "1".repeat(63) + "2";

describe("blossom upload authorisation", () => {
  test("signs a kind 24242 event naming the blob and sends it base64", async () => {
    const signer = createLocalSigner(Uint8Array.from(Buffer.from(TEST_SECRET, "hex")));
    const sha256 = sha256Hex(Buffer.from("apk bytes"));

    const header = await uploadAuthHeader(sha256, signer, () => 1_700_000_000);
    // cdn.zapstore.dev rejects a bare base64 value with
    // "authorization scheme must be 'Nostr <base64_event>'".
    assert.ok(header.startsWith("Nostr "), "header must carry the Nostr scheme");
    const event = decodeUploadAuthHeader(header) as any;

    assert.equal(event.kind, 24242);
    assert.equal(event.created_at, 1_700_000_000);
    assert.equal(event.content, `Upload ${sha256}`);
    assert.ok(event.tags.some(([name, value]: [string, string]) => name === "x" && value === sha256));
    // `t` is the action. A media type there is rejected with
    // "auth failed: invalid 't' tag: application/vnd.android.package-archive".
    assert.ok(event.tags.some(([name, value]: [string, string]) => name === "t" && value === "upload"));

    // The point of the header: it must verify against the publishing identity,
    // otherwise the server has no way to attribute the upload.
    assert.equal(event.pubkey, signer.publicKey);
    assert.equal(verifyEvent(event), true);
  });

  test("carries an expiry so a captured header cannot be replayed", async () => {
    const signer = createLocalSigner(Uint8Array.from(Buffer.from(TEST_SECRET, "hex")));
    const createdAt = 1_700_000_000;
    const header = await uploadAuthHeader(sha256Hex(Buffer.from("x")), signer, () => createdAt);
    const event = decodeUploadAuthHeader(header) as any;

    const expiry = event.tags.find(([name]: [string]) => name === "expiration");
    assert.ok(expiry, "expected an expiration tag");
    assert.ok(Number(expiry[1]) > createdAt, "expiry must be in the future");
  });

  // Regression: the CDN answers 401 without an Authorization header, and the
  // action had no way to send one, so every publish failed after the APK
  // resolved. This asserts the header reaches the wire.
  test("sends the signed authorisation on the upload request", async () => {
    const signer = createLocalSigner(Uint8Array.from(Buffer.from(TEST_SECRET, "hex")));
    const payload = Buffer.from("apk bytes");
    let auth: string | null | undefined;

    await uploadBlob(payload, "application/vnd.android.package-archive", {
      baseUrl: "https://cdn.example",
      signer,
      fetchImpl: (async (_url: string, init: RequestInit) => {
        auth = new Headers(init.headers).get("Authorization");
        return new Response(JSON.stringify({}), { status: 201 });
      }) as unknown as typeof fetch,
    });

    assert.ok(auth, "expected an Authorization header");
    assert.ok(auth.startsWith("Nostr "), "upload must send the Nostr scheme");
    const event = decodeUploadAuthHeader(auth) as any;
    assert.equal(event.kind, 24242);
    assert.ok(
      event.tags.some(([name, value]: [string, string]) => name === "x" && value === sha256Hex(payload)),
      "authorisation must name the uploaded blob",
    );
  });

  // Regression: cdn.zapstore.dev runs a `blossy` version that reads the blob
  // hash from `Content-Digest` and 400s with "'Content-Digest' header is missing
  // or empty" without it, while later versions read `X-SHA-256`. Both go out.
  test("sends the blob hash under both header spellings, as hex", async () => {
    const signer = createLocalSigner(Uint8Array.from(Buffer.from(TEST_SECRET, "hex")));
    const payload = Buffer.from("apk bytes");
    const expected = sha256Hex(payload);
    let headers = new Headers();

    await uploadBlob(payload, "image/png", {
      baseUrl: "https://cdn.example",
      signer,
      fetchImpl: (async (_url: string, init: RequestInit) => {
        headers = new Headers(init.headers);
        return new Response("{}", { status: 201 });
      }) as unknown as typeof fetch,
    });

    // Hex, not the RFC 9530 base64 form: the server parses exactly 64 hex
    // characters.
    assert.equal(headers.get("Content-Digest"), expected);
    assert.equal(headers.get("X-SHA-256"), expected);
    assert.match(headers.get("Content-Digest")!, /^[0-9a-f]{64}$/);
    assert.equal(headers.get("Content-Length"), String(payload.byteLength));
  });

  test("falls back to a bearer token when no signer is available", async () => {
    let auth: string | null | undefined;
    await uploadBlob(Buffer.from("x"), "image/png", {
      baseUrl: "https://cdn.example",
      token: "t0ken",
      fetchImpl: (async (_url: string, init: RequestInit) => {
        auth = new Headers(init.headers).get("Authorization");
        return new Response("{}", { status: 201 });
      }) as unknown as typeof fetch,
    });

    assert.equal(auth, "Bearer t0ken");
  });

  test("omits the header entirely with neither signer nor token", async () => {
    let auth: string | null | undefined;
    await uploadBlob(Buffer.from("x"), "image/png", {
      baseUrl: "https://cdn.example",
      fetchImpl: (async (_url: string, init: RequestInit) => {
        auth = new Headers(init.headers).get("Authorization");
        return new Response("{}", { status: 201 });
      }) as unknown as typeof fetch,
    });

    assert.ok(auth === null || auth === undefined, "expected no Authorization header");
  });
});
