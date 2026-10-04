/**
 * Resolves which APK to publish.
 *
 * Three sources, in the order the config prefers them:
 *
 *   - an explicit path or https URL, for a locally built artifact
 *   - a GitHub release asset, which is already a durable public URL and so
 *     needs no upload
 *   - a plain https URL
 *
 * Only the first case requires uploading the APK anywhere. When the APK comes
 * from a GitHub release, the release asset URL is recorded directly, which
 * avoids copying a multi-megabyte file to a CDN for no benefit.
 */

import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export interface ReleaseAsset {
  name: string;
  size: number;
  /** Public download URL, when the API provided one. */
  browserDownloadUrl?: string;
  /** API id, needed to download private or token-authenticated assets. */
  id?: number;
}

export interface GithubRelease {
  tagName: string;
  draft: boolean;
  prerelease: boolean;
  assets: ReleaseAsset[];
  publishedAt?: string;
}

export interface ResolvedApk {
  data: Buffer;
  /** Public URL clients can fetch, when the APK is already hosted. */
  url?: string;
  /** Human-readable origin for logs. */
  origin: string;
  /** Release tag, when the APK came from a release. */
  tag?: string;
}

export class SourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceError";
  }
}

/**
 * Ranks candidate APKs so the intended build wins.
 *
 * Preference order mirrors what a release publishes: a release-signed build
 * beats a debug build, a universal build beats a per-ABI one, and larger files
 * are treated as a weak signal of a non-stripped build. Pure, so it is directly
 * testable without a network.
 */
export function rankApkAssets(assets: ReleaseAsset[]): ReleaseAsset[] {
  const score = (asset: ReleaseAsset): number => {
    const name = asset.name.toLowerCase();
    let value = 0;
    if (name.includes("release-signed") || name.includes("release.apk")) value += 100;
    else if (name.includes("release")) value += 50;
    if (name.includes("debug")) value -= 40;
    // Universal APKs contain every ABI and are what a user should install.
    if (name.includes("universal")) value += 20;
    if (name.includes("arm64") || name.includes("aarch64")) value += 10;
    if (name.includes("x86_64")) value -= 5;
    if (name.includes("armeabi") || name.includes("armeabi-v7a")) value -= 1;
    return value;
  };
  return [...assets].sort((a, b) => score(b) - score(a) || b.size - a.size || a.name.localeCompare(b.name));
}

/**
 * Picks the APK to publish from a release's assets.
 *
 * `match` is the `match` regex from zapstore.yaml, which lets a repository pin
 * the exact artefact when several look plausible.
 */
export function selectApkAsset(release: GithubRelease, match?: string): ReleaseAsset {
  const apks = release.assets.filter((asset) => asset.name.toLowerCase().endsWith(".apk"));
  if (apks.length === 0) {
    throw new SourceError(`release ${release.tagName} has no .apk assets`);
  }

  if (match) {
    let pattern: RegExp;
    try {
      pattern = new RegExp(match, "i");
    } catch (cause) {
      throw new SourceError(`match is not a valid regular expression: ${cause instanceof Error ? cause.message : cause}`);
    }
    const filtered = apks.filter((asset) => pattern.test(asset.name));
    if (filtered.length === 0) {
      throw new SourceError(
        `no asset in ${release.tagName} matched ${match} (available: ${apks.map((a) => a.name).join(", ")})`,
      );
    }
    const ranked = rankApkAssets(filtered);
    const best = ranked[0];
    if (!best) throw new SourceError(`no asset in ${release.tagName} matched ${match}`);
    return best;
  }

  const ranked = rankApkAssets(apks);
  const best = ranked[0];
  if (!best) throw new SourceError(`no usable APK asset in ${release.tagName}`);
  return best;
}

/** The newest usable release: drafts and prereleases are skipped when possible. */
export function selectRelease(releases: GithubRelease[]): GithubRelease {
  const usable = releases.filter((release) => !release.draft);
  const stable = usable.filter((release) => !release.prerelease);
  const pool = stable.length > 0 ? stable : usable;
  const best = pool[0];
  if (!best) throw new SourceError("repository has no published releases");
  return best;
}

/** Parses `https://github.com/owner/repo` into its path segments. */
export function parseGitHubRepository(repository: string): { owner: string; repo: string } {
  const match = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)/i.exec(repository.trim());
  if (!match?.[1] || !match[2]) {
    throw new SourceError(`expected a github.com repository URL, got ${repository}`);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export interface GitHubOptions {
  repository: string;
  token?: string;
  match?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Lists the repository's releases, newest first, using the GitHub REST API.
 */
export async function listReleases(options: GitHubOptions): Promise<GithubRelease[]> {
  const { owner, repo } = parseGitHubRepository(options.repository);
  const doFetch = options.fetchImpl ?? fetch;
  const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=30`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await doFetch(url, { headers });
  if (!response.ok) {
    throw new SourceError(
      `listing releases for ${owner}/${repo} failed with ${response.status}${
        response.status === 403 ? " (rate limited or token missing)" : ""
      }`,
    );
  }

  const payload = (await response.json()) as {
    tag_name?: string;
    draft?: boolean;
    prerelease?: boolean;
    published_at?: string;
    assets?: { name?: string; size?: number; browser_download_url?: string; id?: number }[];
  }[];

  return payload
    .map((release) => ({
      tagName: release.tag_name ?? "",
      draft: release.draft ?? false,
      prerelease: release.prerelease ?? false,
      publishedAt: release.published_at,
      assets: (release.assets ?? [])
        .filter((asset): asset is { name: string; size: number; browser_download_url?: string; id?: number } =>
          typeof asset.name === "string",
        )
        .map((asset) => ({
          name: asset.name,
          size: asset.size ?? 0,
          browserDownloadUrl: asset.browser_download_url,
          id: asset.id,
        })),
    }))
    .filter((release) => release.tagName !== "");
}

/** Downloads a release asset, following the API when a plain URL is unavailable. */
export async function downloadAsset(
  asset: ReleaseAsset,
  options: GitHubOptions,
): Promise<Buffer> {
  const doFetch = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = { Accept: "application/octet-stream" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  // The browser_download_url is public and cheapest; the API id is the fallback
  // for repositories where the asset needs the token to fetch.
  const url =
    asset.browserDownloadUrl ??
    (asset.id !== undefined
      ? `${assetUrl(options.repository, asset.id)}`
      : undefined);

  if (!url) throw new SourceError(`asset ${asset.name} has no download URL`);

  const response = await doFetch(url, { headers });
  if (!response.ok) {
    throw new SourceError(`downloading ${asset.name} failed with ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function assetUrl(repository: string, id: number): string {
  const { owner, repo } = parseGitHubRepository(repository);
  return `https://api.github.com/repos/${owner}/${repo}/releases/assets/${id}`;
}

export interface ResolveOptions extends GitHubOptions {
  /** Explicit path or https URL, overriding the repository lookup. */
  apk?: string;
}

/** Reads an APK from disk or over https. */
async function loadExplicit(apk: string): Promise<ResolvedApk> {
  if (/^https?:\/\//i.test(apk)) {
    const response = await fetch(apk);
    if (!response.ok) throw new SourceError(`fetching ${apk} failed with ${response.status}`);
    return { data: Buffer.from(await response.arrayBuffer()), url: apk, origin: apk };
  }
  try {
    return { data: await readFile(apk), origin: apk };
  } catch (cause) {
    throw new SourceError(`reading ${apk} failed: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

/** Resolves the APK to publish, from an explicit source or a GitHub release. */
export async function resolveApk(options: ResolveOptions): Promise<ResolvedApk> {
  if (options.apk) return loadExplicit(options.apk);

  const releases = await listReleases(options);
  const release = selectRelease(releases);
  const asset = selectApkAsset(release, options.match);

  const data = await downloadAsset(asset, options);
  const origin = `${options.repository} ${release.tagName}/${asset.name}`;
  const result: ResolvedApk = { data, origin, tag: release.tagName };
  // A release asset is already a durable public URL, so it is recorded as-is
  // instead of being copied to a CDN.
  if (asset.browserDownloadUrl) result.url = asset.browserDownloadUrl;
  return result;
}

/** Display name for logs. */
export function describeSource(apk: ResolvedApk): string {
  return `${basename(apk.origin)} (${apk.data.byteLength} bytes)`;
}
