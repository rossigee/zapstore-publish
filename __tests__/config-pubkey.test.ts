import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";

import { injectPubkey, loadConfig, npubFor, parseConfig, syncConfigPubkey } from "../src/config.ts";

describe("npubFor", () => {
  const secret = generateSecretKey();
  const npub = nip19.npubEncode(getPublicKey(secret));

  test("derives the npub from an nsec", () => {
    assert.equal(npubFor(nip19.nsecEncode(secret)), npub);
  });

  test("derives the npub from a hex key", () => {
    const hex = Buffer.from(secret).toString("hex");
    assert.equal(npubFor(hex), npub);
    assert.equal(npubFor(hex.toUpperCase()), npub);
  });

  test("has no answer for a bunker credential", () => {
    // The identity behind a bunker is only known after connecting, so there is
    // nothing to inject and the config must carry its own pubkey.
    assert.equal(npubFor(`bunker://${npub}?relay=wss://relay.example&secret=x`), undefined);
  });

  test("has no answer for junk or empty input", () => {
    assert.equal(npubFor(""), undefined);
    assert.equal(npubFor("hunter2"), undefined);
  });
});

describe("injectPubkey", () => {
  test("replaces an existing field", () => {
    const out = injectPubkey("repository: r\npubkey: REPLACE_WITH_YOUR_NPUB\nname: n\n", "npub1abc");
    assert.match(out, /^pubkey: npub1abc$/m);
    assert.ok(!out.includes("REPLACE_WITH"));
    // Everything else is untouched.
    assert.match(out, /^repository: r$/m);
    assert.match(out, /^name: n$/m);
  });

  test("appends a field when none exists", () => {
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
    const out = injectPubkey("repository: r\n", npub);
    assert.match(out, new RegExp(`pubkey: ${npub}`));
    assert.equal(parseConfig(out).pubkey, npub);
  });

  test("keeps the result parseable", () => {
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
    const original = "repository: https://github.com/a/b\ntags:\n  - sms\n";
    assert.equal(parseConfig(injectPubkey(original, npub)).tags?.length, 1);
  });
});

describe("syncConfigPubkey", () => {
  function configWith(body: string): string {
    const dir = mkdtempSync(join(tmpdir(), "zapstore-cfg-"));
    const path = join(dir, "zapstore.yaml");
    writeFileSync(path, body);
    return path;
  }

  test("repairs a placeholder", async () => {
    const path = configWith("repository: https://github.com/a/b\npubkey: REPLACE_WITH_YOUR_NPUB\n");
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));

    assert.equal(await syncConfigPubkey(path, npub), true);
    // The strict loader must now accept it, which is the point.
    assert.equal((await loadConfig(path)).pubkey, npub);
  });

  test("repairs a config with no pubkey at all", async () => {
    const path = configWith("repository: https://github.com/a/b\n");
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
    assert.equal(await syncConfigPubkey(path, npub), true);
    assert.equal((await loadConfig(path)).pubkey, npub);
  });

  test("replaces a stale pubkey after key rotation", async () => {
    const old = nip19.npubEncode(getPublicKey(generateSecretKey()));
    const fresh = nip19.npubEncode(getPublicKey(generateSecretKey()));
    const path = configWith(`repository: https://github.com/a/b\npubkey: ${old}\n`);

    assert.equal(await syncConfigPubkey(path, fresh), true);
    assert.equal((await loadConfig(path)).pubkey, fresh);
  });

  test("leaves the file alone when it already matches", async () => {
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
    const body = `repository: https://github.com/a/b\npubkey: ${npub}\n`;
    const path = configWith(body);

    assert.equal(await syncConfigPubkey(path, npub), false);
    assert.equal(readFileSync(path, "utf8"), body, "file must not be rewritten");
  });

  test("does nothing without a pubkey to inject", async () => {
    const path = configWith("repository: https://github.com/a/b\n");
    assert.equal(await syncConfigPubkey(path, undefined), false);
    assert.ok(!readFileSync(path, "utf8").includes("pubkey"));
  });

  test("still reports genuinely broken config", async () => {
    // A missing repository is not something pubkey injection can fix.
    const path = configWith("name: nameless\n");
    const npub = nip19.npubEncode(getPublicKey(generateSecretKey()));
    await assert.rejects(() => syncConfigPubkey(path, npub), /must set a repository URL/);
  });
});
