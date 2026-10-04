/**
 * Reads the identity of an APK from its manifest.
 *
 * `AndroidManifest.xml` inside an APK is not text: the build toolchain compiles
 * it to a chunked binary format called AXML. `android-axml-parser` decodes that
 * into an element tree, and this module pulls out the fields a software
 * release has to record.
 */

import { unzipSync } from "fflate";
import { parseAxml } from "android-axml-parser";

const MANIFEST_ENTRY = "AndroidManifest.xml";

/** True for an AXML resource reference such as `@0x7f110023`. */
function isResourceReference(value: string | undefined): boolean {
  return value !== undefined && /^@0x[0-9a-f]+$/i.test(value.trim());
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  // Values arrive either as plain decimal or as a hex literal.
  const parsed = /^0x/i.test(trimmed) ? Number.parseInt(trimmed, 16) : Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export interface ApkFeature {
  name: string;
  required: boolean;
}

export interface ApkManifest {
  package: string;
  versionCode: number;
  versionName: string;
  minSdkVersion?: number;
  targetSdkVersion?: number;
  compileSdkVersion?: number;
  /** Permissions requested via `uses-permission`, in manifest order. */
  permissions: string[];
  features: ApkFeature[];
  /**
   * The literal `android:label`, when the build inlined it as a string.
   *
   * Almost always absent: the label is a resource reference, and resolving it
   * means decoding `resources.arsc`. Use the listing config's `name` instead.
   */
  label?: string;
  /** The resource id behind an unresolved label, for diagnostics. */
  labelResourceId?: string;
  debuggable?: boolean;
}

export class ManifestReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestReadError";
  }
}

/**
 * Extracts and decodes `AndroidManifest.xml` from an APK.
 *
 * Only the manifest entry is inflated, so this stays fast and flat on
 * memory even for a large APK.
 */
export function readManifest(apk: Buffer): ApkManifest {
  let raw: Buffer;
  try {
    const entries = unzipSync(apk, { filter: (entry) => entry.name === MANIFEST_ENTRY });
    const manifest = entries[MANIFEST_ENTRY];
    if (!manifest) throw new Error(`${MANIFEST_ENTRY} is not present in the APK`);
    // fflate yields a Uint8Array; the AXML parser needs Buffer methods.
    raw = Buffer.from(manifest);
  } catch (cause) {
    throw new ManifestReadError(
      `could not read ${MANIFEST_ENTRY}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  let doc: ReturnType<typeof parseAxml>;
  try {
    doc = parseAxml(raw);
  } catch (cause) {
    throw new ManifestReadError(
      `could not decode the binary manifest: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  const root = doc.root;
  if (!root || root.name !== "manifest") {
    throw new ManifestReadError(`expected a <manifest> root element, found ${root ? `<${root.name}>` : "nothing"}`);
  }

  const attr = (element: { attributes?: { name: string; value?: string }[] } | undefined, name: string) =>
    element?.attributes?.find((a) => a.name === name)?.value;

  const packageName = attr(root, "package");
  const versionCode = toInt(attr(root, "versionCode"));
  const versionName = attr(root, "versionName");

  if (!packageName) throw new ManifestReadError("manifest has no package attribute");
  if (versionCode === undefined) throw new ManifestReadError("manifest has no readable versionCode");
  if (!versionName) throw new ManifestReadError("manifest has no readable versionName");

  const children = root.children ?? [];
  const usesSdk = children.find((c) => c.name === "uses-sdk");

  const permissions: string[] = [];
  for (const child of children) {
    if (child.name !== "uses-permission") continue;
    const name = attr(child, "name");
    if (name) permissions.push(name);
  }

  const features: ApkFeature[] = [];
  for (const child of children) {
    if (child.name !== "uses-feature") continue;
    const name = attr(child, "name");
    if (!name) continue;
    features.push({ name, required: attr(child, "required") !== "false" });
  }

  const application = children.find((c) => c.name === "application");
  const rawLabel = attr(application, "label");
  const label = rawLabel && !isResourceReference(rawLabel) ? rawLabel : undefined;
  const labelResourceId = rawLabel && isResourceReference(rawLabel) ? rawLabel : undefined;

  const debuggableRaw = attr(application, "debuggable");

  const result: ApkManifest = {
    package: packageName,
    versionCode,
    versionName,
    permissions,
    features,
  };

  const minSdk = toInt(attr(usesSdk, "minSdkVersion"));
  if (minSdk !== undefined) result.minSdkVersion = minSdk;
  const targetSdk = toInt(attr(usesSdk, "targetSdkVersion"));
  if (targetSdk !== undefined) result.targetSdkVersion = targetSdk;
  const compileSdk = toInt(attr(root, "compileSdkVersion"));
  if (compileSdk !== undefined) result.compileSdkVersion = compileSdk;
  if (label !== undefined) result.label = label;
  if (labelResourceId !== undefined) result.labelResourceId = labelResourceId;
  if (debuggableRaw !== undefined) result.debuggable = debuggableRaw === "true";

  return result;
}
