import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

/**
 * Loads the APK fixture, gzipped because a binary in version control is a
 * poor neighbour even at this size.
 *
 * It is a genuine Android SDK build rather than a hand-assembled zip: `aapt2`
 * compiles and links a manifest and a string resource, `d8` produces a dex from
 * one empty activity, `zipalign` aligns, and `apksigner` signs with v2 only. So
 * the manifest the tests read is real AXML, and the signature is real, which is
 * what makes the expected values worth asserting: the fingerprint is the one
 * `apksigner verify --print-certs` prints, not whatever this code happens to
 * produce.
 *
 * It carries no dependencies and no functionality beyond that, because nothing
 * in the tests reads anything except the manifest and the signing block.
 *
 * Rebuilding it is byte-for-byte reproducible: timestamps are normalised and the
 * signing key is fixed, so the digest asserted in CI is a property of the recipe
 * rather than of one machine.
 */
export function loadApk(): Buffer {
  const path = fileURLToPath(new URL("./fixtures/minimal-debug.apk.gz", import.meta.url));
  return gunzipSync(readFileSync(path));
}