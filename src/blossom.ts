/**
 * Blossom (BUD-02) blob upload.
 *
 * Blobs are addressed by the SHA-256 of their contents, which is what makes a
 * published asset verifiable: the hash goes into the release event, the client
 * re-checks it after download, and a mismatch blocks the install.
 */

import { createHash } from "node:crypto";
import type { Signer } from "./nostr/signer.ts";

export interface BlobDescriptor {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
}

export interface BlossomOptions {
  /** Base URL, for example https://cdn.zapstore.dev */
  baseUrl: string;
  /**
   * Identity used to sign the BUD-02 upload authorisation.
   *
   * The Zapstore CDN requires authorisation on `PUT /upload` and answers 401
   * without it. BUD-02 specifies that authorisation as a signed kind-24242
   * event naming the blob, not a bearer token, so the publishing identity signs
   * it. That also keeps the upload attributable to the same npub the relay
   * whitelists for the release events.
   */
  signer?: Signer;
  /** Optional bearer token for servers that authorise that way instead (BUD-11). */
  token?: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  /** Injectable for tests. */
  now?: () => number;
}

export class BlossomError extends Error {
  /** HTTP status, when the failure came from a server response. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "BlossomError";
    this.status = status;
  }
}

/** Lowercase hex SHA-256 of a buffer. */
export function sha256Hex(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/** The canonical BUD-01 read URL for a blob. */
export function blobUrl(baseUrl: string, sha256: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${sha256}`;
}

/** How long a signed upload authorisation stays valid, in seconds. */
const UPLOAD_AUTH_TTL_SECONDS = 3600;

/**
 * Builds the BUD-02 `Authorization` header for an upload.
 *
 * The value is `Nostr <base64>`, where the base64 is the signed event's JSON.
 * The scheme prefix is not optional: cdn.zapstore.dev answers
 * `401 authorization scheme must be 'Nostr <base64_event>'` without it.
 *
 * The event names the blob in an `x` tag so the server can check the
 * authorisation covers the body actually being sent, and carries an
 * `expiration` so a captured header is not replayable indefinitely.
 */
export async function uploadAuthHeader(
  sha256: string,
  signer: Signer,
  now: () => number = () => Math.floor(Date.now() / 1000),
): Promise<string> {
  const createdAt = now();
  const event = await signer.signEvent({
    kind: 24242,
    created_at: createdAt,
    content: `Upload ${sha256}`,
    tags: [
      // `t` is the action, not a media type: the server matches it against
      // get/upload/list/delete and answers "invalid 't' tag" otherwise. `x`
      // names this blob so the server can check the authorisation covers the
      // body being sent, and `expiration` must be in the future or it is
      // rejected as expired.
      ["t", "upload"],
      ["x", sha256],
      ["expiration", String(createdAt + UPLOAD_AUTH_TTL_SECONDS)],
    ],
  });

  const encoded = Buffer.from(JSON.stringify(event), "utf8").toString("base64");
  return `Nostr ${encoded}`;
}

/** Decodes a header produced by {@link uploadAuthHeader}. Test helper. */
export function decodeUploadAuthHeader(header: string): unknown {
  const encoded = header.startsWith("Nostr ") ? header.slice("Nostr ".length) : header;
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
}

/**
 * Uploads a blob and returns its descriptor.
 *
 * The server's descriptor is preferred, because BUD-02 lets it return a
 * redirecting URL with a file extension. The canonical `{base}/{sha256}` form is
 * used only if the server omits a usable URL, which keeps this working against
 * servers that return a bare 201.
 */
export async function uploadBlob(
  data: Uint8Array,
  contentType: string,
  options: BlossomOptions,
): Promise<BlobDescriptor> {
  const sha256 = sha256Hex(data);
  const endpoint = `${options.baseUrl.replace(/\/+$/, "")}/upload`;
  const doFetch = options.fetchImpl ?? fetch;

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(data.byteLength),
    // Both spellings of the blob hash are sent, in plain hex rather than the
    // RFC 9530 base64 form. Blossom servers disagree on the header name: the
    // version of `blossy` that cdn.zapstore.dev runs reads `Content-Digest` and
    // rejects a request without it with
    // "'Content-Digest' header is missing or empty", while later ones read
    // `X-SHA-256`. The value is identical and both are cheap, so sending both
    // works against either. The hash lets the server reject a body that does not
    // match what we claim, and short-circuit when the blob is already stored.
    "Content-Digest": sha256,
    "X-SHA-256": sha256,
  };
  if (options.signer) {
    headers.Authorization = await uploadAuthHeader(sha256, options.signer, options.now);
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await doFetch(endpoint, { method: "PUT", headers, body: data });

  if (!response.ok) {
    // X-Reason is explicitly a human-readable diagnostic; never parse it for
    // control flow, only surface it.
    const reason = response.headers.get("X-Reason");
    throw new BlossomError(
      `upload to ${endpoint} failed with ${response.status}${reason ? `: ${reason}` : ""}`,
      response.status,
    );
  }

  const fallback = blobUrl(options.baseUrl, sha256);
  let parsed: Partial<BlobDescriptor> = {};
  try {
    parsed = (await response.json()) as Partial<BlobDescriptor>;
  } catch {
    // A server that answers 201 with no body is acceptable; fall back below.
  }

  if (parsed.sha256 && parsed.sha256 !== sha256) {
    throw new BlossomError(
      `server reported sha256 ${parsed.sha256} for a blob that hashes to ${sha256}`,
    );
  }

  return {
    url: typeof parsed.url === "string" && parsed.url ? parsed.url : fallback,
    sha256,
    size: data.byteLength,
    type: typeof parsed.type === "string" && parsed.type ? parsed.type : contentType,
    uploaded: typeof parsed.uploaded === "number" ? parsed.uploaded : 0,
  };
}

/** Guesses a content type from a file extension. */
export function contentTypeForPath(path: string): string {
  const extension = path.toLowerCase().split(".").pop() ?? "";
  const types: Record<string, string> = {
    apk: "application/vnd.android.package-archive",
    png: "image/png",
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
  };
  return types[extension] ?? "application/octet-stream";
}
