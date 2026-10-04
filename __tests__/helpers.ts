import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

/**
 * Loads the real APK fixture, gzipped because an uncompressed 18 MB binary has
 * no business in version control.
 *
 * It is a genuine `assembleDebug` output of this project, so the expectations in
 * the tests are anchored to values that also appear in `sms2webhook/build.gradle`
 * and in the Android SDK's own `apksigner` output, rather than to whatever this
 * code happens to produce.
 */
export function loadApk(): Buffer {
  const path = fileURLToPath(new URL("./fixtures/sms2webhook-debug.apk.gz", import.meta.url));
  return gunzipSync(readFileSync(path));
}
