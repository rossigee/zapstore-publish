import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  APK_MIME_TYPE,
  buildSoftwareAppEvent,
  buildSoftwareAssetEvent,
  buildSoftwareReleaseEvent,
  DEFAULT_COMMUNITY,
  KIND_SOFTWARE_APP,
  KIND_SOFTWARE_ASSET,
  KIND_SOFTWARE_RELEASE,
  platformsForArchitectures,
  tagValue,
  tagValues,
} from "../src/nostr/events.ts";

const CREATED_AT = 1_700_000_000;
const PACKAGE = "org.example.apkfixture";
const PLATFORMS = ["android-arm64-v8a", "android-armeabi-v7a", "android-x86", "android-x86_64"];

describe("platformsForArchitectures", () => {
  test("claims every ABI when the APK has no native libraries", () => {
    // An APK with no native libraries runs everywhere.
    assert.deepEqual(platformsForArchitectures([]), [
      "android-arm64-v8a",
      "android-armeabi-v7a",
      "android-x86",
      "android-x86_64",
    ]);
  });

  test("maps known ABIs", () => {
    assert.deepEqual(platformsForArchitectures(["arm64-v8a", "x86_64"]), [
      "android-arm64-v8a",
      "android-x86_64",
    ]);
  });

  test("passes an unknown ABI through with an android- prefix", () => {
    assert.deepEqual(platformsForArchitectures(["riscv64"]), ["android-riscv64"]);
  });

  test("deduplicates repeated ABIs", () => {
    assert.deepEqual(platformsForArchitectures(["x86", "x86"]), ["android-x86"]);
  });
});

describe("software asset event (3063)", () => {
  const event = buildSoftwareAssetEvent({
    packageId: PACKAGE,
    sha256: "a".repeat(64),
    version: "2.0.1",
    versionCode: 3,
    urls: ["https://github.com/example/example-app/releases/download/v2.0.1/app.apk"],
    size: 12_000_000,
    platforms: PLATFORMS,
    minSdkVersion: 28,
    targetSdkVersion: 36,
    certificateSha256: "b".repeat(64),
    changelog: "Release notes here",
    createdAt: CREATED_AT,
  });

  test("uses the right kind and carries no d tag", () => {
    assert.equal(event.kind, KIND_SOFTWARE_ASSET);
    // Assets are reached through the release's e tags, not addressed directly.
    assert.equal(tagValue(event, "d"), undefined);
  });

  test("records identity, hash and version", () => {
    assert.equal(tagValue(event, "i"), PACKAGE);
    assert.equal(tagValue(event, "x"), "a".repeat(64));
    assert.equal(tagValue(event, "version"), "2.0.1");
  });

  test("falls back to the version code when there is no version name", () => {
    const fallback = buildSoftwareAssetEvent({
      packageId: PACKAGE,
      sha256: "a".repeat(64),
      versionCode: 7,
      urls: ["https://example.com/a.apk"],
      size: 1,
      platforms: PLATFORMS,
      createdAt: CREATED_AT,
    });
    assert.equal(tagValue(fallback, "version"), "7");
  });

  test("records mime, size and every platform", () => {
    assert.equal(tagValue(event, "m"), APK_MIME_TYPE);
    assert.equal(tagValue(event, "size"), "12000000");
    assert.deepEqual(tagValues(event, "f"), PLATFORMS);
  });

  test("records the SDK levels and certificate hash", () => {
    assert.equal(tagValue(event, "min_platform_version"), "28");
    assert.equal(tagValue(event, "target_platform_version"), "36");
    assert.equal(tagValue(event, "apk_certificate_hash"), "b".repeat(64));
  });

  // Regression: the relay rejects any asset event carrying an android- platform
  // and no version_code, with "missing or empty 'version_code' tag (required for
  // Android)". The rejection surfaced as a greyed-out Install button, because the
  // release event was accepted and pointed at an asset that did not exist.
  test("records the version code, which the relay requires for Android", () => {
    assert.equal(tagValue(event, "version_code"), "3");
  });

  test("keeps release notes in the content", () => {
    assert.equal(event.content, "Release notes here");
  });

  test("refuses an asset with no URL or no platform", () => {
    const base = {
      packageId: PACKAGE,
      sha256: "a".repeat(64),
      version: "1",
      size: 1,
      platforms: PLATFORMS,
      createdAt: CREATED_AT,
    };
    assert.throws(() => buildSoftwareAssetEvent({ ...base, urls: [] }), /at least one url/);
    assert.throws(() => buildSoftwareAssetEvent({ ...base, urls: ["u"], platforms: [] }), /at least one f platform/);
  });
});

describe("software release event (30063)", () => {
  const event = buildSoftwareReleaseEvent({
    packageId: PACKAGE,
    version: "2.0.1",
    channel: "main",
    assetEventId: "c".repeat(64),
    assetRelayHint: "wss://relay.zapstore.dev",
    platforms: PLATFORMS,
    releaseNotes: "Fixed edge-to-edge issues",
    createdAt: CREATED_AT,
  });

  test("is addressed as packageId@version", () => {
    assert.equal(event.kind, KIND_SOFTWARE_RELEASE);
    assert.equal(tagValue(event, "d"), `${PACKAGE}@2.0.1`);
    assert.equal(tagValue(event, "i"), PACKAGE);
  });

  test("references its asset with a relay hint", () => {
    assert.deepEqual(tagValues(event, "e"), ["c".repeat(64)]);
    const eTag = event.tags.find((tag) => tag[0] === "e");
    assert.deepEqual(eTag, ["e", "c".repeat(64), "wss://relay.zapstore.dev"]);
  });

  test("omits the relay hint when there is none", () => {
    const noHint = buildSoftwareReleaseEvent({
      packageId: PACKAGE,
      version: "2.0.1",
      channel: "main",
      assetEventId: "c".repeat(64),
      platforms: PLATFORMS,
      createdAt: CREATED_AT,
    });
    assert.deepEqual(
      noHint.tags.find((tag) => tag[0] === "e"),
      ["e", "c".repeat(64)],
    );
  });

  test("records the channel", () => {
    assert.equal(tagValue(event, "c"), "main");
  });

  test("must reference an asset", () => {
    assert.throws(
      () =>
        buildSoftwareReleaseEvent({
          packageId: PACKAGE,
          version: "1",
          channel: "main",
          assetEventId: "",
          platforms: PLATFORMS,
          createdAt: CREATED_AT,
        }),
      /must reference an asset/,
    );
  });
});

describe("software application event (32267)", () => {
  const event = buildSoftwareAppEvent({
    packageId: PACKAGE,
    name: "Example App",
    description: "An example listing.",
    summary: "Example listing",
    icon: "https://cdn.example/icon.png",
    images: ["https://cdn.example/one.png", "https://cdn.example/two.png"],
    tags: ["example", "automation"],
    website: "https://github.com/example/example-app",
    repository: "https://github.com/example/example-app",
    nip34: { pointer: "30617:" + "d".repeat(64) + ":example-app" },
    platforms: PLATFORMS,
    license: "MIT",
    createdAt: CREATED_AT,
  });

  test("is addressed by package id", () => {
    assert.equal(event.kind, KIND_SOFTWARE_APP);
    assert.equal(tagValue(event, "d"), PACKAGE);
    assert.equal(tagValue(event, "name"), "Example App");
    assert.equal(tagValue(event, "summary"), "Example listing");
  });

  test("carries icon, images and topics", () => {
    assert.equal(tagValue(event, "icon"), "https://cdn.example/icon.png");
    assert.deepEqual(tagValues(event, "image"), [
      "https://cdn.example/one.png",
      "https://cdn.example/two.png",
    ]);
    assert.deepEqual(tagValues(event, "t"), ["example", "automation"]);
  });

  test("links the NIP-34 repository with an a tag", () => {
    assert.deepEqual(
      event.tags.find((tag) => tag[0] === "a"),
      ["a", "30617:" + "d".repeat(64) + ":example-app"],
    );
  });

  test("defaults h to the Zapstore community", () => {
    // h is a NIP-78 community identifier, not a repository reference.
    assert.deepEqual(tagValues(event, "h"), [DEFAULT_COMMUNITY]);
  });

  test("honours an explicit community list", () => {
    const custom = buildSoftwareAppEvent({
      packageId: PACKAGE,
      name: "x",
      description: "",
      platforms: PLATFORMS,
      communities: ["e".repeat(64)],
      createdAt: CREATED_AT,
    });
    assert.deepEqual(tagValues(custom, "h"), ["e".repeat(64)]);
  });

  test("records website, license and platforms", () => {
    assert.equal(tagValue(event, "url"), "https://github.com/example/example-app");
    assert.equal(tagValue(event, "repository"), "https://github.com/example/example-app");
    assert.equal(tagValue(event, "license"), "MIT");
    assert.deepEqual(tagValues(event, "f"), PLATFORMS);
  });

  test("requires at least one platform", () => {
    assert.throws(
      () =>
        buildSoftwareAppEvent({
          packageId: PACKAGE,
          name: "x",
          description: "",
          platforms: [],
          createdAt: CREATED_AT,
        }),
      /at least one f platform/,
    );
  });
});
