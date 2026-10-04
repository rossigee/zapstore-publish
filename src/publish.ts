/**
 * Publishing orchestration: resolve the APK, read its identity, upload media,
 * build the NIP-82 events, sign them and publish them.
 *
 * Kept separate from the GitHub Actions entry point so the whole flow can be
 * driven directly, including against a local relay, without a workflow.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { unzipSync } from "fflate";
import { SimplePool, nip19, type EventTemplate, type VerifiedEvent } from "nostr-tools";

import { readManifest } from "./apk/manifest.ts";
import { signingCertificateSha256 } from "./apk/signing-block.ts";
import { contentTypeForPath, sha256Hex, uploadBlob } from "./blossom.ts";
import { extractReleaseNotes, type ListingConfig } from "./config.ts";
import {
  buildSoftwareAppEvent,
  buildSoftwareAssetEvent,
  buildSoftwareReleaseEvent,
  platformsForArchitectures,
} from "./nostr/events.ts";
import type { Signer } from "./nostr/signer.ts";
import { resolveApk, type ResolvedApk } from "./source.ts";

export class PublishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishError";
  }
}

/** Reads the native ABIs an APK ships, which decides its platform tags. */
function nativeArchitectures(apk: Buffer): string[] {
  const abis = new Set<string>();
  for (const name of Object.keys(unzipSync(apk, { filter: (entry) => entry.name.includes(".so") }))) {
    const match = /(?:^|\/)lib\/([^/]+)\//.exec(name);
    if (match?.[1]) abis.add(match[1]);
  }
  return [...abis];
}

export interface ApkIdentity {
  manifest: ReturnType<typeof readManifest>;
  certificateSha256: string;
  certificateScheme: string;
  platforms: string[];
}

/** Reads the package identity, signing certificate and platform tags from an APK. */
export function inspectApk(apk: Buffer): ApkIdentity {
  const manifest = readManifest(apk);
  const certificate = signingCertificateSha256(apk);
  return {
    manifest,
    certificateSha256: certificate.sha256,
    certificateScheme: certificate.scheme,
    platforms: platformsForArchitectures(nativeArchitectures(apk)),
  };
}

export interface PublishOptions {
  config: ListingConfig;
  signer: Signer;
  /** Explicit APK path or URL, overriding the config and the release lookup. */
  apk?: string;
  relays: string[];
  blossomUrl?: string;
  channel?: string;
  /** Resolve and validate everything, then stop without publishing. */
  check?: boolean;
  githubToken?: string;
  log?: (message: string) => void;
}

export interface PublishedRelease {
  packageId: string;
  version: string;
  versionCode: number;
  certificateSha256: string;
  apkSha256: string;
  apkSize: number;
  /** Where clients will fetch the APK from. */
  apkUrl: string;
  platforms: string[];
  permissions: string[];
  appEvent?: VerifiedEvent;
  assetEvent?: VerifiedEvent;
  releaseEvent?: VerifiedEvent;
  published: boolean;
}

/** Normalises an npub or hex pubkey to hex, for comparison with the signer. */
function pubkeyToHex(value: string): string {
  if (/^[0-9a-f]{64}$/i.test(value)) return value.toLowerCase();
  const decoded = nip19.decode(value);
  if (decoded.type !== "npub" || typeof decoded.data !== "string") {
    throw new PublishError(`pubkey must be an npub or hex key, got ${decoded.type}`);
  }
  return decoded.data;
}

/**
 * Publishes one release.
 *
 * When the APK comes from a GitHub release its asset URL is used directly, since
 * it is already a durable public location. A locally built APK has to be uploaded
 * to Blossom so that clients have somewhere to fetch it from.
 */
export async function publishRelease(options: PublishOptions): Promise<PublishedRelease> {
  const log = options.log ?? (() => {});
  const { config } = options;
  const channel = options.channel ?? "main";
  const createdAt = Math.floor(Date.now() / 1000);
  const blossomUrl = options.blossomUrl ?? "";

  const apk: ResolvedApk = await resolveApk({
    repository: config.repository,
    token: options.githubToken,
    match: config.match,
    apk: options.apk ?? config.releaseSource,
  });
  log(`APK resolved from ${apk.origin} (${apk.data.byteLength} bytes)`);

  const { manifest, certificateSha256, certificateScheme, platforms } = inspectApk(apk.data);
  const apkSha256 = sha256Hex(apk.data);
  log(
    `${manifest.package} ${manifest.versionName} (code ${manifest.versionCode}), ` +
      `certificate ${certificateSha256.slice(0, 16)}… via ${certificateScheme}`,
  );
  log(`platforms: ${platforms.join(", ")}`);

  // A mismatch here means the relay will not whitelist the publisher, and every
  // event would be rejected, so fail before signing anything.
  if (config.pubkey && pubkeyToHex(config.pubkey) !== options.signer.publicKey) {
    throw new PublishError(
      "zapstore.yaml pubkey does not match the signing key " +
        `(config ${pubkeyToHex(config.pubkey).slice(0, 16)}…, signer ${options.signer.publicKey.slice(0, 16)}…). ` +
        "The relay verifies these match, so publishing would be rejected.",
    );
  }

  // Every local path is checked before anything is uploaded, so a typo fails
  // immediately instead of after transferring a multi-megabyte APK.
  const localReferences = [apk.url ? "" : apk.origin, config.icon ?? "", ...(config.images ?? [])].filter(Boolean);
  for (const reference of localReferences) {
    if (!/^https?:\/\//i.test(reference) && !existsSync(reference)) {
      throw new PublishError(`${reference} does not exist`);
    }
  }

  const upload = async (reference: string): Promise<string> => {
    if (/^https?:\/\//i.test(reference)) return reference;
    if (!blossomUrl) throw new PublishError(`cannot upload ${reference} without a Blossom URL`);
    const data = await readFile(reference);
    const descriptor = await uploadBlob(data, contentTypeForPath(reference), { baseUrl: blossomUrl });
    log(`uploaded ${reference} (${data.byteLength} bytes)`);
    return descriptor.url;
  };

  let releaseNotes = "";
  if (config.releaseNotes && existsSync(config.releaseNotes)) {
    releaseNotes = extractReleaseNotes(await readFile(config.releaseNotes, "utf8"), manifest.versionName);
  }

  const base: PublishedRelease = {
    packageId: manifest.package,
    version: manifest.versionName,
    versionCode: manifest.versionCode,
    certificateSha256,
    apkSha256,
    apkSize: apk.data.byteLength,
    apkUrl: apk.url ?? `(would upload ${apk.origin} to Blossom)`,
    platforms,
    permissions: manifest.permissions,
    published: false,
  };

  if (options.check) {
    log("check mode: validated without uploading or publishing");
    return base;
  }

  if (!apk.url && !blossomUrl) {
    throw new PublishError("a locally built APK needs a Blossom URL to be uploaded to");
  }

  const apkUrl = apk.url ?? (await upload(apk.origin));
  const iconUrl = config.icon ? await upload(config.icon) : undefined;
  const imageUrls: string[] = [];
  for (const image of config.images ?? []) imageUrls.push(await upload(image));

  const pool = new SimplePool();
  try {
    const sign = async (template: EventTemplate): Promise<VerifiedEvent> => {
      const signed = await options.signer.signEvent(template);
      await pool.publish(options.relays, signed);
      log(`published kind ${template.kind} ${signed.id.slice(0, 16)}…`);
      return signed;
    };

    // The asset goes first: the release references its event id.
    const assetEvent = await sign(
      buildSoftwareAssetEvent({
        packageId: manifest.package,
        sha256: apkSha256,
        version: manifest.versionName,
        versionCode: manifest.versionCode,
        urls: [apkUrl],
        size: apk.data.byteLength,
        platforms,
        minSdkVersion: manifest.minSdkVersion,
        targetSdkVersion: manifest.targetSdkVersion,
        certificateSha256,
        changelog: releaseNotes,
        createdAt,
      }),
    );

    const releaseEvent = await sign(
      buildSoftwareReleaseEvent({
        packageId: manifest.package,
        version: manifest.versionName,
        channel,
        assetEventId: assetEvent.id,
        assetRelayHint: options.relays[0],
        platforms,
        releaseNotes,
        createdAt,
      }),
    );

    const appEvent = await sign(
      buildSoftwareAppEvent({
        packageId: manifest.package,
        name: config.name ?? manifest.label ?? manifest.package,
        description: config.description ?? "",
        summary: config.summary,
        icon: iconUrl,
        images: imageUrls,
        tags: config.tags,
        website: config.website,
        repository: config.repository,
        platforms,
        license: config.license,
        communities: config.communities,
        createdAt,
      }),
    );

    return { ...base, appEvent, assetEvent, releaseEvent, published: true };
  } finally {
    pool.close(options.relays);
  }
}
