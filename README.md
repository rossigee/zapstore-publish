# zapstore-publish

A GitHub Action that publishes an Android release to [Zapstore](https://zapstore.dev),
the open Android app store built on Nostr.

It is a native TypeScript implementation: no `zsp` binary, no Go toolchain, and
no `dist/` bundle to keep in sync. The Action runs its source directly on the
runner, which Node 24 can do because TypeScript type annotations are erased at
load time.

```yaml
- uses: rossigee/zapstore-publish@v1
  with:
    sign-with: ${{ secrets.ZAPSTORE_SIGN_WITH }}
```

## What it does

Given a signed APK it publishes three [NIP-82](https://github.com/nostr-protocol/nips/blob/master/82.md)
events to `wss://relay.zapstore.dev`:

| Kind | Event | Carries |
| --- | --- | --- |
| `3063` | Software Asset | APK SHA-256, size, download URL, SDK levels, signing certificate hash |
| `30063` | Software Release | version, channel, reference to the asset event |
| `32267` | Software Application | name, summary, description, icon, screenshots, topics |

The APK is identified by parsing it directly: `AndroidManifest.xml` is decoded
from Android's binary AXML format, and the signing certificate is read out of the
APK Signing Block. No `aapt`, `apkanalyzer` or `apksigner` is invoked.

## Setup

1. **Commit a `zapstore.yaml`** to your repository. This is required, not
   optional: when your first event reaches the relay, it fetches this file from
   your repository, verifies that `pubkey` matches the signing key, and only then
   whitelists you. Without it the event is rejected.

   ```yaml
   repository: https://github.com/you/your-app
   name: Your App
   summary: One line describing the app
   description: |
     Longer description, markdown.
   license: MIT
   tags:
     - utilities
   # Optional. Pins the release asset so a debug build is never published.
   match: ".*-release-signed\\.apk$"
   images:
     - screenshots/01.png
   release_notes: ./CHANGELOG.md
   pubkey: npub1...
   ```

2. **Generate a Nostr identity.** `zsp` has no keygen subcommand, so use
   [`nak`](https://github.com/fiatjaf/nak):

   ```bash
   go install github.com/fiatjaf/nak@latest
   NSEC=$(nak key generate)
   nak key public "$NSEC" | nak encode npub   # -> zapstore.yaml pubkey
   ```

3. **Store the credential** as the `ZAPSTORE_SIGN_WITH` repository secret.

4. **Tag a release.** The APK is taken from the newest GitHub release asset
   matching `match`, so the release has to exist first.

## Signing: use a bunker, not a key

`sign-with` accepts either an `nsec1...` key or a NIP-46 `bunker://` URL.

Prefer a bunker in CI. With an `nsec`, the key is decrypted onto the runner,
where **every action in the job** can read it from `/proc/<pid>/environ` — and a
leak costs you that npub across all of Nostr, not just this listing. A bunker URL
is a scoped, revocable capability token, and the key never leaves the signer.

| | `nsec1...` | `bunker://` |
| --- | --- | --- |
| Private key on the runner | yes | never |
| Blast radius if leaked | the whole npub | this session only |
| Revoke | must rotate the identity | rotate the secret |
| Needs a reachable signer | no | yes |

`zsp` and this Action accept the same values, so you can start with an `nsec` and
switch later without changing the workflow. Any NIP-46 signer works; look for one
supporting per-connection `perms` so the session can be limited to `sign_event`.

## Inputs

| Input | Default | Purpose |
| --- | --- | --- |
| `config` | `zapstore.yaml` | Path to the listing config |
| `sign-with` | `$SIGN_WITH` | `nsec1...`, hex, or a `bunker://` URL |
| `apk` | newest matching release asset | Path or https URL to publish instead |
| `relays` | `wss://relay.zapstore.dev` | Comma-separated relays |
| `blossom` | `https://cdn.zapstore.dev` | CDN for icon and screenshot uploads |
| `mode` | `publish` | `check` validates without publishing |
| `skip-if-unconfigured` | `false` | Succeed quietly when no signer is set |

## Outputs

`apk-sha256`, `certificate-sha256`, `app-event-id`, `asset-event-id`,
`release-event-id`.

## Verifying without publishing

`mode: check` resolves the APK, reads its identity and validates the config, then
stops. It makes no network calls for a GitHub-sourced APK and uploads nothing, so
it is safe to run on every push:

```yaml
- uses: rossigee/zapstore-publish@v1
  with:
    sign-with: ${{ secrets.ZAPSTORE_SIGN_WITH }}
    mode: check
```

## How this is tested

`zapstore.yaml` and the APK are the inputs; everything else is derived and
checked against something independent.

- **Certificate fingerprints are compared to `apksigner`.** The test fixture is a
  real `assembleDebug` output, and the expected digest was captured from the
  Android SDK, not from this code.
- **Manifest values are compared to `build.gradle`** — `applicationId`,
  `versionCode`, `versionName`, `minSdk`, `targetSdk`.
- **NIP-46 runs against an in-process signer** that derives real NIP-44
  conversation keys, decrypts requests and encrypts replies. This caught a bug
  where a second, separately derived key was used for inbound traffic, which made
  every response silently undecryptable.
- **Event tags are compared to `zsp`'s output**, since Zapstore clients are
  written against that shape. The `zsp` README is wrong about two of them: `h` is
  a NIP-78 community identifier rather than a repository reference, and the
  NIP-34 pointer uses an `a` tag. The `3063` asset event has no `d` tag at all.

```bash
npm ci
npm run typecheck
npm test
```

## Limitations

- **v1/JAR-only APKs are rejected** with a clear error. Those keep the
  certificate in `META-INF` and have no signing block. Any APK built by a modern
  Android Gradle Plugin is v2 or v3.
- **Icons and screenshots are not extracted from the APK.** `android:icon` and
  `android:label` are resource references, and resolving them means decoding
  `resources.arsc`, which is not implemented. Supply `icon:` and `images:` in
  `zapstore.yaml` instead. The manifest reader reports `labelResourceId` so the
  situation is visible rather than silent.
- **`versionCode` monotonicity is the caller's problem.** Zapstore records the
  version code but does not enforce that it increases.

## License

MIT
