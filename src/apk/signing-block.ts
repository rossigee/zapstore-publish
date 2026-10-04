/**
 * Locates the APK Signing Block and extracts the SHA-256 fingerprint of the
 * first signing certificate.
 *
 * An APK is a ZIP archive with an extra "APK Signing Block" wedged between the
 * last local file entry and the ZIP Central Directory:
 *
 *     [entries][APK Signing Block][Central Directory][EOCD]
 *
 * The block repeats a uint64 size, holds a run of ID/value pairs, and is
 * followed by the 16-byte magic "APK Sig Block 42". Because the Central
 * Directory offset is recorded in the EOCD record, the whole block can be
 * located from the end of the file without scanning forwards.
 *
 * The length prefixes below were derived empirically and confirmed against
 * `apksigner verify --print-certs` on a real APK; the layout is subtle and the
 * obvious readings of the specification are wrong in two places, both noted
 * inline.
 */

import { createHash } from "node:crypto";

const MAGIC = "APK Sig Block 42";
const MAGIC_LEN = 16;

/** APK signature scheme block IDs. */
const SCHEME_V2 = 0x7109871a;
const SCHEME_V3 = 0xf05368c0;

const EOCD_SIGNATURE = 0x06054b50;
const ZIP64_EOCD_LOCATOR_SIGNATURE = 0x07064b50;

/** Bytes of framing around the pair region: two uint64 sizes and the magic. */
const BLOCK_FRAMING = 8 + 8 + MAGIC_LEN;

/**
 * A uint32 length-prefixed cursor. Every count in the APK signing structures is
 * a little-endian uint32 whose value is a plain byte count for the region that
 * follows it; the region is not counted again by any outer prefix.
 */
class Cursor {
  readonly buf: Buffer;
  pos: number;

  constructor(buf: Buffer, pos = 0) {
    this.buf = buf;
    this.pos = pos;
  }

  get remaining(): number {
    return this.buf.length - this.pos;
  }

  u32(): number {
    if (this.remaining < 4) {
      throw new RangeError(
        `APK structure truncated: wanted 4 bytes at offset ${this.pos}, ${this.remaining} available`,
      );
    }
    const value = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return value;
  }

  /** Reads a uint32 byte count and returns a view of the bytes that follow it. */
  slice(): Buffer {
    const length = this.u32();
    const start = this.pos;
    if (length > this.remaining) {
      throw new RangeError(
        `APK declares a ${length} byte region at offset ${start} but only ${this.remaining} bytes remain`,
      );
    }
    this.pos += length;
    return this.buf.subarray(start, start + length);
  }
}

/**
 * Finds the Central Directory offset from the End of Central Directory record.
 *
 * ZIP64 archives store the offset as 64 bits behind a locator record, which is
 * detected and rejected rather than misparsed: a wrong offset would yield a
 * wrong certificate fingerprint, which is worse than a clear failure.
 */
export function findCentralDirectoryOffset(apk: Buffer): number {
  const earliest = Math.max(0, apk.length - (22 + 0xffff));
  for (let i = apk.length - 22; i >= earliest; i--) {
    if (apk.readUInt32LE(i) !== EOCD_SIGNATURE) continue;

    const locatorAt = i - 20;
    if (locatorAt >= 0 && apk.readUInt32LE(locatorAt) === ZIP64_EOCD_LOCATOR_SIGNATURE) {
      throw new Error(
        "APK uses a ZIP64 end-of-central-directory record; only ZIP32 archives are supported",
      );
    }

    const cdSize = apk.readUInt32LE(i + 12);
    const cdOffset = apk.readUInt32LE(i + 16);
    if (cdOffset === 0xffffffff || cdSize === 0xffffffff) {
      throw new Error("APK ZIP64 fields are saturated, indicating a ZIP64 archive; only ZIP32 is supported");
    }
    if (cdOffset + cdSize > apk.length) {
      throw new Error(
        `Central directory at ${cdOffset} (${cdSize} bytes) extends past the ${apk.length} byte APK`,
      );
    }
    return cdOffset;
  }
  throw new Error("No ZIP end-of-central-directory record found; the APK is not a valid ZIP archive");
}

export interface SigningBlock {
  /** Offset of the first of the two uint64 size fields. */
  start: number;
  /** Offset of the first ID/value pair. */
  pairsStart: number;
  /** Offset one past the last byte of the pair region. */
  pairsEnd: number;
}

/**
 * Locates the APK Signing Block, or returns undefined when the APK carries no
 * signing block (a v1/JAR-only signed APK).
 *
 * The trailing size field sits immediately before the magic, and the pair
 * region sits immediately before that size field. The leading size field is a
 * further 8 bytes back, which puts the start at `cd - 8 - size`: the size value
 * accounts for the framing around the pair region but not for its own leading
 * field, so deriving the start from the magic instead lands 16 bytes early and
 * corrupts the first pair length.
 */
export function findSigningBlock(apk: Buffer): SigningBlock | undefined {
  const cdOffset = findCentralDirectoryOffset(apk);
  const magicAt = cdOffset - MAGIC_LEN;
  if (magicAt < BLOCK_FRAMING) return undefined;
  if (apk.toString("latin1", magicAt, magicAt + MAGIC_LEN) !== MAGIC) return undefined;

  const size = Number(apk.readBigUInt64LE(magicAt - 8));
  if (!Number.isSafeInteger(size) || size <= 0) return undefined;

  const start = cdOffset - 8 - size;
  const pairsStart = start + 8;
  const pairsEnd = magicAt - 8;
  if (start < 0 || pairsStart < 0 || pairsEnd <= pairsStart) return undefined;
  return { start, pairsStart, pairsEnd };
}

/**
 * Iterates the ID/value pairs of the block.
 *
 * The pair's uint64 length excludes its own 8 bytes but includes the 4-byte ID,
 * so the value is `length - 4` bytes and the next pair begins at
 * `position + 8 + length`. Treating the length as including itself lands 4 bytes
 * past the true boundary and corrupts every subsequent read.
 */
function* pairs(apk: Buffer, block: SigningBlock): Generator<{ id: number; value: Buffer; pairStart: number }> {
  let pos = block.pairsStart;

  while (pos + 12 <= block.pairsEnd) {
    const length = Number(apk.readBigUInt64LE(pos));
    if (!Number.isSafeInteger(length) || length < 4) {
      throw new Error(`APK signing block pair at ${pos} declares an implausible length ${length}`);
    }
    const valueLength = length - 4;
    const next = pos + 8 + length;
    if (valueLength > block.pairsEnd - (pos + 12)) {
      throw new Error(
        `APK signing block pair at ${pos} declares ${length} bytes, overrunning the block`,
      );
    }
    const id = apk.readUInt32LE(pos + 8);
    yield { id, value: apk.subarray(pos + 12, pos + 12 + valueLength), pairStart: pos };
    pos = next;
  }

  if (pos !== block.pairsEnd) {
    throw new Error(`APK signing block pairs end at ${pos} but the block ends at ${block.pairsEnd}`);
  }
}

/**
 * Extracts the first X.509 certificate from a v2 or v3 signature block.
 *
 * Both schemes encode a signer identically, and every length is a plain uint32
 * byte count:
 *
 *     value    := signers-length, signer-length, signer
 *     signer   := signed-data, signatures, public-key [, min-sdk, max-sdk]
 *     signed-data := digests, certificates, additional-attributes
 *
 * Only the first certificate is needed. The signers length is read for
 * validation but not traversed: the first signer's length immediately follows
 * it, and stepping over the whole region first would run past the end.
 */
function certificateFromSchemeBlock(value: Buffer): Buffer | undefined {
  const outer = new Cursor(value);

  const signersLength = outer.u32();
  if (signersLength < 4 || signersLength > value.length) {
    throw new RangeError(`scheme block declares a ${signersLength} byte signers region`);
  }

  const signer = outer.slice();
  const inSigner = new Cursor(signer);

  const signedDataLength = inSigner.u32();
  const signedData = signer.subarray(inSigner.pos, inSigner.pos + signedDataLength);
  if (signedDataLength > signer.length - inSigner.pos) {
    throw new RangeError(`signer declares a ${signedDataLength} byte signed-data region`);
  }
  inSigner.pos += signedDataLength;

  inSigner.slice(); // signatures
  inSigner.slice(); // public key

  const inSignedData = new Cursor(signedData);
  inSignedData.slice(); // digests
  const certificates = inSignedData.slice();

  const inCertificates = new Cursor(certificates);
  const derLength = inCertificates.u32();
  if (derLength === 0) return undefined;
  if (derLength > inCertificates.remaining) {
    throw new RangeError(`certificate declares ${derLength} bytes but only ${inCertificates.remaining} remain`);
  }
  const der = certificates.subarray(inCertificates.pos, inCertificates.pos + derLength);

  // A DER certificate is a SEQUENCE whose header length accounts for the rest of
  // the encoding. Checking this catches an off-by-a-few-bytes parse, which would
  // otherwise silently hash the wrong bytes into a plausible-looking digest.
  if (der.length < 4 || der[0] !== 0x30 || der[1] !== 0x82 || der.readUInt16BE(2) !== der.length - 4) {
    throw new Error(
      `certificate at the expected offset is not a well-formed DER SEQUENCE (${der.length} bytes)`,
    );
  }
  return der;
}

export interface CertificateInfo {
  /** Lowercase hex SHA-256 of the DER-encoded certificate. */
  sha256: string;
  /** Which signature scheme the certificate was read from. */
  scheme: "v2" | "v3";
  /** Length of the DER encoding, useful as a sanity check in logs. */
  derLength: number;
}

export class CertificateNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CertificateNotFoundError";
  }
}

/**
 * Returns the SHA-256 fingerprint of the APK's signing certificate, which is
 * what Zapstore records as `apk_certificate_hash` and checks against the
 * certificate-linking proof at install time.
 *
 * Prefers v3 over v2 when an APK carries both, since v3 is the stronger scheme.
 */
export function signingCertificateSha256(apk: Buffer): CertificateInfo {
  const block = findSigningBlock(apk);

  if (!block) {
    throw new CertificateNotFoundError(
      "APK has no APK Signing Block, so it carries only a v1 (JAR) signature. " +
        "v1 certificate extraction is not implemented; publish an APK signed with v2 or v3.",
    );
  }

  let sawV2 = false;
  let sawV3 = false;
  let v3Candidate: CertificateInfo | undefined;

  for (const { id, value } of pairs(apk, block)) {
    if (id === SCHEME_V2) sawV2 = true;
    if (id === SCHEME_V3) sawV3 = true;
    if (id !== SCHEME_V2 && id !== SCHEME_V3) continue;

    const der = certificateFromSchemeBlock(value);
    if (!der || der.length === 0) continue;

    const info: CertificateInfo = {
      sha256: createHash("sha256").update(der).digest("hex"),
      scheme: id === SCHEME_V3 ? "v3" : "v2",
      derLength: der.length,
    };
    if (info.scheme === "v3") return info;
    v3Candidate ??= info;
  }

  if (v3Candidate) return v3Candidate;

  const present = [sawV2 && "v2", sawV3 && "v3"].filter(Boolean).join(" and ");
  throw new CertificateNotFoundError(
    present
      ? `APK signing block contains a ${present} block but no certificate could be read from it`
      : "APK signing block contains no v2 or v3 signature block",
  );
}
