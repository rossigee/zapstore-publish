/**
 * Signing identity for publishing.
 *
 * Two shapes are supported behind one interface:
 *
 *   - a local secret key, given as `nsec1...` or 64 hex characters
 *   - a NIP-46 remote signer, given as a `bunker://` or `nostrconnect://` URL
 *
 * The bunker form is preferable in CI. A secret key has to be decrypted onto
 * the runner, where any action in the same job can read it out of
 * `/proc/<pid>/environ`, and a leak costs the whole npub across all of Nostr
 * rather than one listing. A bunker URL is a scoped, revocable capability
 * token, and the key itself never leaves the signer.
 */

import {
  finalizeEvent,
  getPublicKey,
  nip19,
  type EventTemplate,
  type VerifiedEvent,
} from "nostr-tools";

export interface Signer {
  /** Hex public key of the identity that will sign events. */
  readonly publicKey: string;
  /** How the key is held. Safe to log; carries no secret material. */
  readonly kind: "local" | "bunker";
  /** Signs an event template and returns it with an id and signature attached. */
  signEvent(template: EventTemplate): Promise<VerifiedEvent>;
  /** Releases any relay subscription held open. */
  close(): Promise<void>;
}

export class UnsupportedIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedIdentityError";
  }
}

const HEX_SECRET = /^[0-9a-f]{64}$/i;

/**
 * Normalises a secret key to raw bytes.
 *
 * Accepts `nsec1...` bech32 or 64 hex characters. `nip19.decode` returns a
 * Uint8Array, which is what the Schnorr and NIP-44 code paths need.
 */
export function decodeSecretKey(value: string): Uint8Array {
  const trimmed = value.trim();

  if (HEX_SECRET.test(trimmed)) {
    return Uint8Array.from(Buffer.from(trimmed, "hex"));
  }

  if (/^nsec1/i.test(trimmed)) {
    const decoded = nip19.decode(trimmed);
    if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) {
      throw new UnsupportedIdentityError(`expected an nsec key, decoded as ${decoded.type}`);
    }
    return decoded.data;
  }

  throw new UnsupportedIdentityError(
    "SIGN_WITH must be an nsec1... key, 64 hex characters, or a bunker:// or nostrconnect:// URL",
  );
}

/** True when the value names a NIP-46 remote signer rather than a key. */
export function isBunkerUrl(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("bunker://") || trimmed.startsWith("nostrconnect://");
}

export interface BunkerPointer {
  /** Hex public key of the remote signer application. */
  remoteSignerPubkey: string;
  /** Relays to reach the signer over. */
  relays: string[];
  /** Optional pairing secret, used once when the signer initiates. */
  secret?: string;
}

/**
 * Parses a NIP-46 connection token.
 *
 * `nostr-tools` does not understand these URIs, so they are parsed here. Only
 * the signer-initiated `bunker://` form is supported; `nostrconnect://` requires
 * the client to listen on a relay for the signer's response, which a CI job has
 * no reason to do.
 */
export function parseBunkerUrl(uri: string): BunkerPointer {
  const trimmed = uri.trim();

  if (trimmed.startsWith("nostrconnect://")) {
    throw new UnsupportedIdentityError(
      "nostrconnect:// tokens require this process to listen for the signer's response; use a bunker:// URL in CI",
    );
  }

  if (!trimmed.startsWith("bunker://")) {
    throw new UnsupportedIdentityError("expected a bunker:// URL");
  }

  const rest = trimmed.slice("bunker://".length);
  const queryAt = rest.indexOf("?");
  const pubkeyPart = queryAt === -1 ? rest : rest.slice(0, queryAt);
  const params = new URLSearchParams(queryAt === -1 ? "" : rest.slice(queryAt + 1));

  // The pubkey may be given as npub or as raw hex.
  let remoteSignerPubkey: string;
  if (/^[0-9a-f]{64}$/i.test(pubkeyPart)) {
    remoteSignerPubkey = pubkeyPart.toLowerCase();
  } else if (/^npub1/i.test(pubkeyPart)) {
    const decoded = nip19.decode(pubkeyPart);
    if (decoded.type !== "npub" || typeof decoded.data !== "string") {
      throw new UnsupportedIdentityError(`expected an npub in the bunker URL, decoded as ${decoded.type}`);
    }
    remoteSignerPubkey = decoded.data;
  } else {
    throw new UnsupportedIdentityError("bunker URL has neither a hex nor npub signer key");
  }

  const relays = params.getAll("relay").filter(Boolean);
  if (relays.length === 0) {
    throw new UnsupportedIdentityError("bunker URL has no relay parameter");
  }

  const secret = params.get("secret") ?? undefined;
  return secret
    ? { remoteSignerPubkey, relays, secret }
    : { remoteSignerPubkey, relays };
}

/** A signer holding the secret key in this process. */
export function createLocalSigner(secret: Uint8Array): Signer {
  const publicKey = getPublicKey(secret);
  return {
    publicKey,
    kind: "local",
    async signEvent(template: EventTemplate): Promise<VerifiedEvent> {
      return finalizeEvent(template, secret) as VerifiedEvent;
    },
    async close(): Promise<void> {},
  };
}
