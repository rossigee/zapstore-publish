import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { readManifest } from "../src/apk/manifest.ts";
import { loadApk } from "./helpers.ts";

/**
 * Expectations come from `sms2webhook/build.gradle` and the merged manifest,
 * not from this parser:
 *
 *   defaultConfig { applicationId "org.golder.sms2webhook"; minSdk 28; targetSdk 36 }
 *   defaultConfig { versionCode 3; versionName "2.0.1" }
 */
describe("readManifest", () => {
  const manifest = readManifest(loadApk());

  test("reads the package id and versions from the binary manifest", () => {
    assert.equal(manifest.package, "org.golder.sms2webhook");
    assert.equal(manifest.versionCode, 3);
    assert.equal(manifest.versionName, "2.0.1");
  });

  test("reads the SDK levels", () => {
    assert.equal(manifest.minSdkVersion, 28);
    assert.equal(manifest.targetSdkVersion, 36);
  });

  test("collects the requested permissions", () => {
    for (const permission of [
      "android.permission.RECEIVE_SMS",
      "android.permission.READ_SMS",
      "android.permission.INTERNET",
    ]) {
      assert.ok(manifest.permissions.includes(permission), `expected ${permission}`);
    }
  });

  test("records telephony as an optional feature", () => {
    // The manifest sets android:required="false" so the app installs without a radio.
    const telephony = manifest.features.find((f) => f.name === "android.hardware.telephony");
    assert.equal(telephony?.required, false);
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
