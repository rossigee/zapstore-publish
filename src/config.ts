/**
 * Loading and validation of `zapstore.yaml`.
 *
 * Field names match `zsp`'s config schema so a repository's existing listing
 * config works unchanged, whether it was written for the Go tool or for this
 * action.
 */

import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { existsSync } from "node:fs";

export interface ListingConfig {
  /** Source repository URL, recorded in the listing for provenance. */
  repository: string;
  /** Regex selecting the release asset to publish. */
  match?: string;
  /** APK path or https URL, overriding the repository release lookup. */
  releaseSource?: string;
  name?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  license?: string;
  website?: string;
  /** Icon path or URL. */
  icon?: string;
  /** Screenshot paths or URLs. */
  images?: string[];
  /** Path to release notes, optionally a Keep-a-Changelog file. */
  releaseNotes?: string;
  /** Publisher npub. Must match the signing key or the relay will not whitelist. */
  pubkey?: string;
  /** NIP-78 community identifiers to list under. */
  communities?: string[];
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** The field names this loader understands, for error messages. */
const KNOWN_FIELDS = new Set([
  "repository",
  "match",
  "release_source",
  "name",
  "summary",
  "description",
  "tags",
  "license",
  "website",
  "icon",
  "images",
  "release_notes",
  "pubkey",
  "communities",
]);

/**
 * Unfilled placeholders left in a committed config.
 *
 * `zapstore.yaml` must be committed for the relay to whitelist the publisher, so
 * it is easy to publish a config that still carries a template value. Failing
 * here with a clear message beats an event the relay silently rejects.
 */
const PLACEHOLDER = /^REPLACE_WITH_|^<.*>$/;

function asStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new ConfigError(`${field} must be a list`);
  return value.map((entry) => {
    if (typeof entry !== "string") throw new ConfigError(`${field} entries must be strings`);
    return entry;
  });
}

export function parseConfig(source: string, origin = "zapstore.yaml"): ListingConfig {
  let document: unknown;
  try {
    document = parse(source);
  } catch (cause) {
    throw new ConfigError(`${origin} is not valid YAML: ${cause instanceof Error ? cause.message : String(cause)}`);
  }

  if (document === null || typeof document !== "object" || Array.isArray(document)) {
    throw new ConfigError(`${origin} must be a mapping of fields`);
  }

  const raw = document as Record<string, unknown>;

  const unknownKeys = Object.keys(raw).filter((key) => !KNOWN_FIELDS.has(key));
  if (unknownKeys.length > 0) {
    // Not fatal: zsp accepts more fields than are used here, and rejecting them
    // would break a config written for the Go tool. Worth surfacing though.
    raw.__unknown = unknownKeys;
  }

  if (typeof raw.repository !== "string" || raw.repository.trim() === "") {
    throw new ConfigError(`${origin} must set a repository URL`);
  }

  const optionalString = (field: string): string | undefined => {
    const value = raw[field];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string") throw new ConfigError(`${field} must be a string`);
    return value;
  };

  const config: ListingConfig = { repository: raw.repository.trim() };

  const match = optionalString("match");
  if (match !== undefined) config.match = match;

  const releaseSource = optionalString("release_source");
  if (releaseSource !== undefined) config.releaseSource = releaseSource;

  for (const field of ["name", "summary", "description", "license", "website", "icon"] as const) {
    const value = optionalString(field);
    if (value !== undefined) config[field] = value;
  }

  // release_notes is the YAML spelling; the interface uses camelCase.
  const releaseNotes = optionalString("release_notes");
  if (releaseNotes !== undefined) config.releaseNotes = releaseNotes;

  const tags = asStringArray(raw.tags, "tags");
  if (tags) config.tags = tags;

  const images = asStringArray(raw.images, "images");
  if (images) config.images = images;

  const communities = asStringArray(raw.communities, "communities");
  if (communities) config.communities = communities;

  const pubkey = optionalString("pubkey");
  if (pubkey !== undefined) {
    if (PLACEHOLDER.test(pubkey.trim())) {
      throw new ConfigError(
        `${origin} still has an unfilled pubkey placeholder. Generate one with \`nak key generate\`, ` +
          "put the npub in pubkey, and commit the file: the relay reads it to whitelist the publisher.",
      );
    }
    if (!/^(npub1[023456789acdefghjklmnpqrstuvwxyz]+|[0-9a-f]{64})$/i.test(pubkey.trim())) {
      throw new ConfigError(`${origin} pubkey must be an npub or a 64 character hex key`);
    }
    config.pubkey = pubkey.trim();
  }

  return config;
}

/** Reads and parses a config file. */
export async function loadConfig(path: string): Promise<ListingConfig> {
  if (!existsSync(path)) {
    throw new ConfigError(
      `${path} not found. It must be committed to the repository: the relay fetches it to verify the publisher.`,
    );
  }
  return parseConfig(await readFile(path, "utf8"), path);
}

/**
 * Pulls the section for one version out of a Keep a Changelog file.
 *
 * Falls back to the whole document when there is no matching heading, since a
 * plain release notes file is perfectly reasonable.
 */
export function extractReleaseNotes(text: string, version: string): string {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Keep a Changelog headings look like "## [2.0.1] - 2025-07-04".
  const heading = new RegExp(`^##\\s*\\[?${escaped}\\]?[^\\n]*$`, "m");
  const match = heading.exec(text);
  if (!match) return text.trim();

  const rest = text.slice(match.index + match[0].length);
  const next = /^##\s/m.exec(rest);
  const section = next ? rest.slice(0, next.index) : rest;
  return section.trim() || text.trim();
}
