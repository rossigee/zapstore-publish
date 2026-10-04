import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { extractReleaseNotes, loadConfig, parseConfig, ConfigError } from "../src/config.ts";
import { KIND_SOFTWARE_APP } from "../src/nostr/events.ts";
import { inspectApk, publishRelease } from "../src/publish.ts";
import { createLocalSigner } from "../src/nostr/signer.ts";
import { getPublicKey, nip19 } from "nostr-tools";
import { loadApk } from "./helpers.ts";

/** Writes a listing config into a temp dir alongside a local APK copy. */
function scaffold(overrides: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "zapstore-"));
  const apk = join(dir, "app.apk");
  writeFileSync(apk, loadApk());
  const configPath = join(dir, "zapstore.yaml");
  writeFileSync(
    configPath,
    `repository: https://github.com/example/example-app\nname: Example App\ndescription: An example listing.\nsummary: Example listing\nlicense: MIT\ntags:\n  - example\n${Object.entries(overrides)
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
  test("reads identity, certificate and platforms from the fixture APK", () => {
    const identity = inspectApk(loadApk());
    assert.equal(identity.manifest.package, "org.example.apkfixture");
    assert.equal(identity.manifest.versionName, "2.0.1");
    assert.equal(identity.certificateSha256, "925d2fefa4c7ab702ad35df1cf35ba7976faa7f2b2e0dd76d9b35d0859fe5bf9");
    assert.equal(identity.certificateScheme, "v2");
    // The fixture ships no native libraries, so it claims every ABI.
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
    assert.equal(result.packageId, "org.example.apkfixture");
    assert.equal(result.version, "2.0.1");
    assert.equal(result.versionCode, 3);
    assert.equal(result.apkSha256.length, 64);
    assert.equal(result.certificateSha256, "925d2fefa4c7ab702ad35df1cf35ba7976faa7f2b2e0dd76d9b35d0859fe5bf9");
    assert.ok(result.permissions.includes("android.permission.CAMERA"));
    assert.ok(messages.some((m) => m.includes("check mode")));
    assert.ok(messages.some((m) => m.includes("android-arm64-v8a")));
  });

  test("refuses to publish under a pubkey that is not the signer", async () => {
    const { apk, configPath } = scaffold({ pubkey: nip19.npubEncode("a".repeat(64)) });
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(new Uint8Array(32).fill(3));

    // Publish mode, but the mismatch is caught before any upload or signing,
    // so this still touches no network.
    await assert.rejects(
      () => publishRelease({ config, signer, apk, relays: ["wss://relay.zapstore.dev"] }),
      /pubkey does not match the signing key/,
    );
  });

  test("needs no signer at all in check mode", async () => {
    const { apk, configPath } = scaffold();
    const config = await loadConfig(configPath);

    // No signer: check mode resolves and validates without a credential, so a
    // repository can verify its listing before it has a Nostr identity.
    const result = await publishRelease({
      config,
      apk,
      relays: ["wss://relay.zapstore.dev"],
      check: true,
    });

    assert.equal(result.published, false);
    assert.equal(result.packageId, "org.example.apkfixture");
    assert.equal(result.certificateSha256, "925d2fefa4c7ab702ad35df1cf35ba7976faa7f2b2e0dd76d9b35d0859fe5bf9");
  });

  test("refuses to publish with no signer", async () => {
    const { apk, configPath } = scaffold();
    const config = await loadConfig(configPath);

    await assert.rejects(
      () => publishRelease({ config, apk, relays: ["wss://relay.zapstore.dev"] }),
      /signer is required to publish/,
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

describe("publishRelease in sign mode", () => {
  test("signs every event but publishes nothing and uploads nothing", async () => {
    // Absolute, because the action resolves media relative to the process
    // working directory rather than the config file.
    const icon = join(mkdtempSync(join(tmpdir(), "zapstore-icon-")), "icon.png");
    writeFileSync(icon, Buffer.from("fake png"));
    const { apk, configPath } = scaffold({ icon });
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(new Uint8Array(32).fill(9));

    const messages: string[] = [];
    // No relays and no Blossom URL: if this mode tried to reach either, it
    // would fail, which is exactly the guarantee being asserted.
    const result = await publishRelease({
      config,
      signer,
      apk,
      relays: [],
      signOnly: true,
      log: (message) => messages.push(message),
    });

    assert.equal(result.published, false);
    assert.ok(result.assetEvent, "asset should be signed");
    assert.ok(result.releaseEvent, "release should be signed");
    assert.ok(result.appEvent, "app should be signed");

    // Signed by the given key, and the ids are distinct per kind.
    for (const event of [result.appEvent, result.assetEvent, result.releaseEvent]) {
      assert.equal(event?.pubkey, getPublicKey(new Uint8Array(32).fill(9)));
      assert.match(event?.id ?? "", /^[0-9a-f]{64}$/);
    }
    assert.notEqual(result.assetEvent?.id, result.releaseEvent?.id);

    // Nothing reached a relay or a CDN. "not published" only ever appears on the
    // signing lines, so any bare "published kind" line would mean a real relay
    // write happened.
    assert.equal(messages.filter((m) => /^published kind/.test(m)).length, 0);
    // Four, not three: the app event is signed twice, once before anything is
    // uploaded to trigger relay whitelisting and once with the uploaded media.
    assert.equal(messages.filter((m) => /not published/.test(m)).length, 4);
    assert.equal(messages.filter((m) => /^uploaded /.test(m)).length, 0);
  });

  // Regression: the relay whitelists a publisher when the app event reaches it,
  // and refuses blob uploads until it has. Publishing the app event last left a
  // new npub stuck on "403 authenticated pubkey is not allowed" with no way to
  // trigger the whitelist.
  test("signs the app event before anything is uploaded", async () => {
    const icon = join(mkdtempSync(join(tmpdir(), "zapstore-order-")), "icon.png");
    writeFileSync(icon, Buffer.from("fake png"));
    const { apk, configPath } = scaffold({ icon });
    const config = await loadConfig(configPath);
    const signer = createLocalSigner(new Uint8Array(32).fill(9));

    const messages: string[] = [];
    await publishRelease({
      config,
      signer,
      apk,
      relays: [],
      signOnly: true,
      log: (message) => messages.push(message),
    });

    const appSigns = messages
      .map((m, i) => (/^signed kind (\d+)/.exec(m)?.[1] === String(KIND_SOFTWARE_APP) ? i : -1))
      .filter((i) => i >= 0);
    assert.equal(appSigns.length, 2, "the app event is signed twice");
    for (const i of appSigns) {
      assert.ok(
        !messages.slice(0, i).some((m) => /^uploaded /.test(m)),
        "an app event was signed after an upload",
      );
    }
  });

  test("needs a signer", async () => {
    const { apk, configPath } = scaffold();
    const config = await loadConfig(configPath);
    await assert.rejects(
      () => publishRelease({ config, apk, relays: [], signOnly: true }),
      /signer is required to sign/,
    );
  });
});
