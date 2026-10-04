import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { extractReleaseNotes, loadConfig, parseConfig, ConfigError } from "../src/config.ts";
import { inspectApk, publishRelease } from "../src/publish.ts";
import { createLocalSigner } from "../src/nostr/signer.ts";
import { nip19 } from "nostr-tools";
import { loadApk } from "./helpers.ts";

const APK_PATH = join(import.meta.dirname, "fixtures", "sms2webhook-debug.apk.gz");

/** Writes a listing config into a temp dir alongside a local APK copy. */
function scaffold(overrides: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "zapstore-"));
  const apk = join(dir, "sms2webhook.apk");
  writeFileSync(apk, loadApk());
  const configPath = join(dir, "zapstore.yaml");
  writeFileSync(
    configPath,
    `repository: https://github.com/rossigee/sms2webhook\nname: SMS2Webhook\ndescription: Forwards SMS.\nsummary: SMS to webhook\nlicense: MIT\ntags:\n  - sms\n${Object.entries(overrides)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join("\n")}\n`,
  );
  return { dir, apk, configPath };
}

describe("config", () => {
  test("requires a repository", () => {
    assert.throws(() => parseConfig("name: x\n"), /must set a repository URL/);
  });

  test("maps release_source and release_notes", () => {
    const config = parseConfig(
      "repository: https://github.com/a/b\nrelease_source: ./app.apk\nrelease_notes: ./CHANGELOG.md\n",
    );
    assert.equal(config.releaseSource, "./app.apk");
    assert.equal(config.releaseNotes, "./CHANGELOG.md");
  });

  test("rejects an unfilled pubkey placeholder with guidance", () => {
    assert.throws(
      () => parseConfig("repository: https://github.com/a/b\npubkey: REPLACE_WITH_YOUR_NPUB\n"),
      /unfilled pubkey placeholder.*nak key generate/s,
    );
  });

  test("accepts a real npub", () => {
    const npub = nip19.npubEncode("f".repeat(64));
    assert.equal(parseConfig(`repository: https://github.com/a/b\npubkey: ${npub}\n`).pubkey, npub);
  });

  test("rejects a malformed pubkey", () => {
    assert.throws(() => parseConfig("repository: https://github.com/a/b\npubkey: nonsense\n"), /npub or a 64/);
  });

  test("rejects a non-list images field", () => {
    assert.throws(() => parseConfig("repository: https://github.com/a/b\nimages: nope\n"), /must be a list/);
  });

  test("explains a missing file, including why it must be committed", async () => {
    await assert.rejects(() => loadConfig("/nonexistent/zapstore.yaml"), /must be committed/);
  });
});

describe("extractReleaseNotes", () => {
  const changelog = ["# Changelog", "", "## [2.0.1] - 2025-07-04", "", "- Fixed insets", "", "## [2.0.0]", "", "- Older"].join(
    "\n",
  );

  test("extracts the section for the requested version", () => {
    assert.equal(extractReleaseNotes(changelog, "2.0.1"), "- Fixed insets");
  });

  test("falls back to the whole document when the version is absent", () => {
    assert.match(extractReleaseNotes(changelog, "9.9.9"), /## \[2.0.1\]/);
  });

  test("does not let a dotted version match a longer one", () => {
    const tricky = "## [2.0.1] - a\n\nfirst\n\n## [2.0.10] - b\n\nsecond\n";
    assert.equal(extractReleaseNotes(tricky, "2.0.1"), "first");
  });
});

describe("inspectApk", () => {
  test("reads identity, certificate and platforms from the real APK", () => {
    const identity = inspectApk(loadApk());
    assert.equal(identity.manifest.package, "org.golder.sms2webhook");
    assert.equal(identity.manifest.versionName, "2.0.1");
    assert.equal(identity.certificateSha256, "2ac43b8bdfac5ac81978146cc57d593307a8315cda2c8073eb148e5287f76c6e");
    assert.equal(identity.certificateScheme, "v2");
    // Pure Java APK, so it claims every ABI rather than just arm64.
    assert.deepEqual(identity.platforms, [
      "android-arm64-v8a",
      "android-armeabi-v7a",
      "android-x86",
      "android-x86_64",
    ]);
  });
});

describe("publishRelease in check mode", () => {
  test("validates a local APK without touching the network", async () => {
    const { apk, configPath } = scaffold();
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(nip19.decode(nip19.nsecEncode(new Uint8Array(32).fill(7))).data as Uint8Array);

    const messages: string[] = [];
    const result = await publishRelease({
      config,
      signer,
      apk,
      relays: ["wss://relay.zapstore.dev"],
      check: true,
      log: (message) => messages.push(message),
    });

    assert.equal(result.published, false);
    assert.equal(result.packageId, "org.golder.sms2webhook");
    assert.equal(result.version, "2.0.1");
    assert.equal(result.versionCode, 3);
    assert.equal(result.apkSha256.length, 64);
    assert.equal(result.certificateSha256, "2ac43b8bdfac5ac81978146cc57d593307a8315cda2c8073eb148e5287f76c6e");
    assert.ok(result.permissions.includes("android.permission.READ_SMS"));
    assert.ok(messages.some((m) => m.includes("check mode")));
    assert.ok(messages.some((m) => m.includes("android-arm64-v8a")));
  });

  test("refuses to publish under a pubkey that is not the signer", async () => {
    const { apk, configPath } = scaffold({ pubkey: nip19.npubEncode("a".repeat(64)) });
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(new Uint8Array(32).fill(3));

    await assert.rejects(
      () => publishRelease({ config, signer, apk, relays: ["wss://relay.zapstore.dev"], check: true }),
      /pubkey does not match the signing key/,
    );
  });

  test("refuses a media file that does not exist", async () => {
    const { apk, configPath } = scaffold({ icon: "/nonexistent/icon.png" });
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(new Uint8Array(32).fill(4));

    await assert.rejects(
      () =>
        publishRelease({
          config,
          signer,
          apk,
          relays: ["wss://relay.zapstore.dev"],
          blossomUrl: "https://cdn.example",
          check: true,
        }),
      /does not exist/,
    );
  });
});
