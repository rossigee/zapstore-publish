import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { readManifest } from "../src/apk/manifest.ts";
import { loadApk } from "./helpers.ts";

/**
 * Expectations come from the fixture's `AndroidManifest.xml` as written by hand
 * and compiled by aapt2, not from this parser:
 *
 *   package "org.example.apkfixture"; versionCode 3; versionName "2.0.1"
 *   --min-sdk-version 28 --target-sdk-version 36 --manifest AndroidManifest.xml
 */
describe("readManifest", () => {
  const manifest = readManifest(loadApk());

  test("reads the package id and versions from the binary manifest", () => {
    assert.equal(manifest.package, "org.example.apkfixture");
    assert.equal(manifest.versionCode, 3);
    assert.equal(manifest.versionName, "2.0.1");
  });

  test("reads the SDK levels", () => {
    assert.equal(manifest.minSdkVersion, 28);
    assert.equal(manifest.targetSdkVersion, 36);
    // aapt2 records the compile SDK it linked against in the manifest itself.
    assert.equal(manifest.compileSdkVersion, 36);
  });

  test("collects the requested permissions", () => {
    for (const permission of [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.CAMERA",
    ]) {
      assert.ok(manifest.permissions.includes(permission), `expected ${permission}`);
    }
  });

  test("records a camera as an optional feature", () => {
    // The manifest sets android:required="false" so the app installs without one.
    const camera = manifest.features.find((f) => f.name === "android.hardware.camera.any");
    assert.equal(camera?.required, false);
  });

  test("reports the label as unresolved rather than inventing one", () => {
    // android:label is a resource reference; resolving it needs resources.arsc.
    assert.equal(manifest.label, undefined);
    assert.match(manifest.labelResourceId ?? "", /^@0x[0-9a-f]+$/);
  });

  test("detects a debuggable build", () => {
    assert.equal(manifest.debuggable, true);
  });

  test("rejects a buffer that is not an APK", () => {
    assert.throws(() => readManifest(Buffer.from("not a zip archive")), /could not read/);
  });
});
