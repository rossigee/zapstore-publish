/**
 * GitHub Actions entry point.
 *
 * Reads inputs from the environment, runs the publish flow, and writes step
 * outputs and a job summary. Any failure exits non-zero so the release is
 * visibly broken rather than quietly published.
 */

import { appendFileSync } from "node:fs";
import crypto from "node:crypto";
import { setSecret } from "./secrets.ts";
import { loadConfig } from "./config.ts";
import { createLocalSigner, decodeSecretKey, isBunkerUrl, parseBunkerUrl } from "./nostr/signer.ts";
import { createBunkerSigner } from "./nostr/bunker.ts";
import { PublishError, publishRelease } from "./publish.ts";

function input(name: string): string {
  return process.env[`INPUT_${name.toUpperCase().replace(/ /g, "_")}`]?.trim() ?? "";
}

function flag(name: string, fallback = false): boolean {
  const raw = input(name).toLowerCase();
  if (raw === "") return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

function setOutput(name: string, value: string): void {
  const file = process.env.GITHUB_OUTPUT;
  // A heredoc delimiter is used so values containing newlines, such as a summary
  // URL, cannot break the format.
  const delimiter = `ghadelimiter_${name}_${crypto.randomUUID()}`;
  if (file) {
    appendFileSync(file, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
    return;
  }
  // Outside a runner there is no output file, so report on stdout instead. The
  // deprecated ::set-output command is deliberately not used.
  process.stdout.write(`[output] ${name} = ${value}\n`);
}

function summarise(lines: string[]): void {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  appendFileSync(file, `${lines.join("\n")}\n`);
}

function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

async function main(): Promise<void> {
  // Logged because the action depends on the runner's Node erasing TypeScript
  // type annotations at load time, which needs Node 22.18+ or 24+.
  log(`running on Node ${process.version}`);

  const configPath = input("config") || "zapstore.yaml";
  const mode = input("mode") || "publish";
  const skipIfUnconfigured = flag("skip-if-unconfigured");

  const signWith = input("sign-with") || process.env.SIGN_WITH?.trim() || "";

  // Check mode resolves and validates the APK without signing anything, so it
  // needs no credential. Requiring one would mean a repository cannot validate
  // its listing config until it has a Nostr identity.
  const needsSigner = mode !== "check";

  if (needsSigner && !signWith) {
    const notice =
      "Zapstore publish skipped: no Nostr identity configured. Set the ZAPSTORE_SIGN_WITH secret " +
      "to an nsec1... key or a bunker:// URL.";
    if (skipIfUnconfigured) {
      log(`::notice::${notice}`);
      return;
    }
    throw new PublishError(`${notice} Pass skip-if-unconfigured: true to allow this.`);
  }

  // Keep the credential out of workflow logs.
  if (signWith && !isBunkerUrl(signWith)) setSecret(signWith);

  const relays = (input("relays") || "wss://relay.zapstore.dev")
    .split(",")
    .map((relay) => relay.trim())
    .filter(Boolean);
  if (relays.length === 0) throw new PublishError("no relays configured");

  const config = await loadConfig(configPath);
  log(`loaded ${configPath} for ${config.repository}`);

  const signer = !signWith
    ? undefined
    : isBunkerUrl(signWith)
      ? await createBunkerSigner(parseBunkerUrl(signWith), {
          clientName: "zapstore-publish",
          clientUrl: "https://github.com/rossigee/zapstore-publish",
        })
      : createLocalSigner(decodeSecretKey(signWith));

  if (signer) log(`signing as ${signer.publicKey.slice(0, 16)}… via a ${signer.kind} key`);
  else log("check mode: no Nostr identity needed, nothing will be signed");

  try {
    const result = await publishRelease({
      config,
      signer,
      apk: input("apk") || undefined,
      relays,
      blossomUrl: input("blossom") || undefined,
      check: mode === "check",
      githubToken: process.env.GITHUB_TOKEN,
      log,
    });

    setOutput("apk-sha256", result.apkSha256);
    setOutput("certificate-sha256", result.certificateSha256);
    if (result.appEvent) setOutput("app-event-id", result.appEvent.id);
    if (result.releaseEvent) setOutput("release-event-id", result.releaseEvent.id);
    if (result.assetEvent) setOutput("asset-event-id", result.assetEvent.id);

    const heading = result.published ? "Published to Zapstore" : "Zapstore check passed";
    summarise([
      `### ${heading}`,
      "",
      `- Package: \`${result.packageId}\``,
      `- Version: \`${result.version}\` (code ${result.versionCode})`,
      `- APK SHA-256: \`${result.apkSha256}\``,
      `- Certificate: \`${result.certificateSha256}\``,
      `- Platforms: ${result.platforms.join(", ")}`,
      `- APK URL: ${result.apkUrl}`,
      "",
      "Permissions declared by the APK:",
      ...result.permissions.map((permission) => `  - \`${permission}\``),
    ]);
  } finally {
    await signer?.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`::error::${message}\n`);
  if (error instanceof Error && error.stack && process.env.RUNNER_DEBUG === "1") {
    process.stderr.write(`${error.stack}\n`);
  }
  process.exitCode = 1;
});
