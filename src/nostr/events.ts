/**
 * NIP-82 software catalog events, plus the NIP-34 pointer that ties a listing to
 * a source repository.
 *
 *   kind 3063   Software Asset      the APK itself: hash, size, URLs, certificate
 *   kind 30063  Software Release    a version, pointing at its assets
 *   kind 32267  Software Application the listing: name, summary, icon, platforms
 *
 * The tag shapes here match what `zsp` emits, since Zapstore clients are written
 * against them. Two details are easy to get wrong and are called out inline: the
 * asset event carries no `d` tag and is located through the release's `e` tags,
 * and `h` is a NIP-78 community identifier rather than a repository reference.
 */

import type { EventTemplate } from "nostr-tools";

export const KIND_SOFTWARE_ASSET = 3063;
export const KIND_SOFTWARE_RELEASE = 30063;
export const KIND_SOFTWARE_APP = 32267;

/** The `h` tag Zapstore uses when a listing names no community of its own. */
export const DEFAULT_COMMUNITY = "acfeaea6e51420e8068fac446ca9d17d7a9ef6a5d20d93894e50fee3d4902a84";

/** The MIME type every Android asset is recorded as. */
export const APK_MIME_TYPE = "application/vnd.android.package-archive";

const ALL_ANDROID_PLATFORMS = [
  "android-arm64-v8a",
  "android-armeabi-v7a",
  "android-x86",
  "android-x86_64",
];

const KNOWN_ABIS: Record<string, string> = {
  "arm64-v8a": "android-arm64-v8a",
  "armeabi-v7a": "android-armeabi-v7a",
  x86: "android-x86",
  x86_64: "android-x86_64",
};

/**
 * Maps an APK's native ABIs to NIP-82 platform identifiers.
 *
 * An APK with no native libraries serves every ABI, so all four platforms are
 * claimed. That is the common case for a pure Kotlin or Java app, and claiming
 * only arm64 would hide it from x86_64 devices and emulators.
 */
export function platformsForArchitectures(abis: string[]): string[] {
  if (abis.length === 0) return [...ALL_ANDROID_PLATFORMS];
  const mapped = abis.map((abi) => KNOWN_ABIS[abi] ?? `android-${abi}`);
  return [...new Set(mapped)];
}

/** NIP-82 prefers the version name, falling back to the version code. */
function versionOrCode(version: string | undefined, versionCode: number | undefined): string {
  if (version) return version;
  if (versionCode !== undefined) return String(versionCode);
  throw new Error("an asset needs either a version name or a version code");
}

export interface SoftwareAppInput {
  packageId: string;
  name: string;
  description: string;
  summary?: string;
  icon?: string;
  images?: string[];
  tags?: string[];
  website?: string;
  repository?: string;
  /** NIP-34 pointer as `30617:<pubkey>:<identifier>`. */
  nip34?: { pointer: string; relay?: string };
  platforms: string[];
  license?: string;
  communities?: string[];
  createdAt: number;
}

/**
 * Builds the kind 32267 listing event.
 *
 * `f` platform tags are required by NIP-82, and `h` carries NIP-78 community
 * identifiers, defaulting to Zapstore's own community so a new listing is
 * discoverable.
 */
export function buildSoftwareAppEvent(input: SoftwareAppInput): EventTemplate {
  if (input.platforms.length === 0) {
    throw new Error("a software application event needs at least one f platform tag");
  }

  const tags: string[][] = [
    ["d", input.packageId],
    ["name", input.name],
  ];

  if (input.summary) tags.push(["summary", input.summary]);
  if (input.icon) tags.push(["icon", input.icon]);
  for (const image of input.images ?? []) tags.push(["image", image]);
  for (const tag of input.tags ?? []) tags.push(["t", tag]);
  if (input.website) tags.push(["url", input.website]);
  if (input.repository) tags.push(["repository", input.repository]);
  if (input.nip34) {
    tags.push(input.nip34.relay ? ["a", input.nip34.pointer, input.nip34.relay] : ["a", input.nip34.pointer]);
  }
  for (const platform of input.platforms) tags.push(["f", platform]);
  if (input.license) tags.push(["license", input.license]);

  const communities = input.communities?.length ? input.communities : [DEFAULT_COMMUNITY];
  for (const community of communities) tags.push(["h", community]);

  return { kind: KIND_SOFTWARE_APP, content: input.description, tags, created_at: input.createdAt };
}

export interface SoftwareAssetInput {
  packageId: string;
  sha256: string;
  version?: string;
  versionCode?: number;
  urls: string[];
  size: number;
  platforms: string[];
  minSdkVersion?: number;
  targetSdkVersion?: number;
  /** SHA-256 of the APK signing certificate, checked at install time. */
  certificateSha256?: string;
  /** Release notes. NIP-82 puts these in the asset's content as well. */
  changelog?: string;
  createdAt: number;
}

/**
 * Builds the kind 3063 asset event for one APK.
 *
 * Note the absence of a `d` tag: the event is not independently addressable, and
 * clients reach it through the `e` tags on the release that references it.
 */
export function buildSoftwareAssetEvent(input: SoftwareAssetInput): EventTemplate {
  if (input.urls.length === 0) {
    throw new Error("a software asset event needs at least one url tag");
  }
  if (input.platforms.length === 0) {
    throw new Error("a software asset event needs at least one f platform tag");
  }

  const tags: string[][] = [
    ["i", input.packageId],
    ["x", input.sha256],
    ["version", versionOrCode(input.version, input.versionCode)],
  ];

  for (const url of input.urls) tags.push(["url", url]);
  tags.push(["m", APK_MIME_TYPE]);
  if (input.size > 0) tags.push(["size", String(input.size)]);
  for (const platform of input.platforms) tags.push(["f", platform]);
  if (input.minSdkVersion !== undefined) tags.push(["min_platform_version", String(input.minSdkVersion)]);
  if (input.targetSdkVersion !== undefined) tags.push(["target_platform_version", String(input.targetSdkVersion)]);
  if (input.certificateSha256) tags.push(["apk_certificate_hash", input.certificateSha256]);

  return {
    kind: KIND_SOFTWARE_ASSET,
    content: input.changelog ?? "",
    tags,
    created_at: input.createdAt,
  };
}

export interface SoftwareReleaseInput {
  packageId: string;
  version: string;
  /** Release channel, conventionally `main`. */
  channel: string;
  /** Event id of the kind 3063 asset this release ships. */
  assetEventId: string;
  /** Relay the asset event was published to, added as the `e` tag's third value. */
  assetRelayHint?: string;
  platforms: string[];
  releaseNotes?: string;
  createdAt: number;
}

/**
 * Builds the kind 30063 release event.
 *
 * The `d` tag is `packageId@version`, which is what makes a release
 * addressable and replaceable by a later publish of the same version.
 */
export function buildSoftwareReleaseEvent(input: SoftwareReleaseInput): EventTemplate {
  if (!input.assetEventId) throw new Error("a software release must reference an asset event id");
  if (input.platforms.length === 0) {
    throw new Error("a software release event needs at least one f platform tag");
  }

  const tags: string[][] = [
    ["i", input.packageId],
    ["version", input.version],
    ["d", `${input.packageId}@${input.version}`],
    ["c", input.channel],
  ];

  for (const platform of input.platforms) tags.push(["f", platform]);
  tags.push(
    input.assetRelayHint
      ? ["e", input.assetEventId, input.assetRelayHint]
      : ["e", input.assetEventId],
  );

  return {
    kind: KIND_SOFTWARE_RELEASE,
    content: input.releaseNotes ?? "",
    tags,
    created_at: input.createdAt,
  };
}

/** Reads the first value of a tag, for assertions and logging. */
export function tagValue(event: EventTemplate, name: string): string | undefined {
  return event.tags.find((tag) => tag[0] === name)?.[1];
}

/** Reads every value of a repeated tag. */
export function tagValues(event: EventTemplate, name: string): string[] {
  return event.tags.filter((tag) => tag[0] === name).map((tag) => tag[1] ?? "");
}
