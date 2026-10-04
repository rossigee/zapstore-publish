/**
 * Blossom (BUD-02) blob upload.
 *
 * Blobs are addressed by the SHA-256 of their contents, which is what makes a
 * published asset verifiable: the hash goes into the release event, the client
 * re-checks it after download, and a mismatch blocks the install.
 */

import { createHash } from "node:crypto";

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
  /** Optional bearer token for servers that require authorisation (BUD-11). */
  token?: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
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
    // Lets the server reject a body that does not match what we claim, and lets
    // it short-circuit when the blob is already stored.
    "X-SHA-256": sha256,
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

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
