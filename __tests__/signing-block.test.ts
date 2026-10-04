import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  signingCertificateSha256,
  findSigningBlock,
  findCentralDirectoryOffset,
  CertificateNotFoundError,
} from "../src/apk/signing-block.ts";
import { loadApk } from "./helpers.ts";

/**
 * Ground truth captured from the Android SDK build tools, not from this parser:
 *
 *   apksigner verify --verbose --print-certs sms2webhook-debug.apk
 *     Verified using v2 scheme (APK Signature Scheme v2): true
 *     Verified using v3 scheme (APK Signature Scheme v3): false
 *     Signer #1 certificate SHA-256 digest: 2ac43b8b...
 */
const EXPECTED_CERT_SHA256 =
  "2ac43b8bdfac5ac81978146cc57d593307a8315cda2c8073eb148e5287f76c6e";

describe("APK signing block", () => {
  test("certificate fingerprint matches apksigner", () => {
    const apk = loadApk();
    const info = signingCertificateSha256(apk);

    assert.equal(info.sha256, EXPECTED_CERT_SHA256);
    assert.equal(info.scheme, "v2");
    assert.equal(info.derLength, 744);
  });

  test("locates the signing block adjacent to the central directory", () => {
    const apk = loadApk();
    const cd = findCentralDirectoryOffset(apk);
    const block = findSigningBlock(apk);

    assert.ok(block, "expected a signing block");
    assert.equal(block.pairsEnd, cd - 24);
    assert.equal(apk.toString("latin1", cd - 16, cd), "APK Sig Block 42");
    // The size field is repeated at both ends of the block.
    assert.equal(apk.readBigUInt64LE(block.start), apk.readBigUInt64LE(cd - 24));
  });

  test("reports no signing block for a plain zip", () => {
    // A stored (uncompressed) zip with a single entry, no signing block.
    const zip = Buffer.from(
      "504b0304" + "0a000000" + "00000000" + "00000000" + "00000000" +
      "00000000" + "00000000" + "00000000" + "00000000" + "00000000" +
      "504b0506" + "00000000" + "00000000" + "00000000" + "00000000" +
      "00000000" + "00000000",
      "hex",
    );
    assert.equal(findSigningBlock(zip), undefined);
  });

  test("rejects an archive with no end-of-central-directory record", () => {
    assert.throws(() => findCentralDirectoryOffset(Buffer.alloc(64)), /end-of-central-directory/);
  });

  test("explains a v1-only APK rather than returning a wrong digest", () => {
    // v1/JAR signing keeps the certificate in META-INF and has no signing block.
    const apk = loadApk();
    const stripped = Buffer.from(apk);
    const cd = findCentralDirectoryOffset(stripped);
    stripped.write("PK\0\0", cd - 16, "latin1");

    assert.throws(() => signingCertificateSha256(stripped), CertificateNotFoundError);
    assert.throws(() => signingCertificateSha256(stripped), /v1 \(JAR\) signature/);
  });
});
