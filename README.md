# zapstore-publish

A GitHub Action that publishes an Android release to [Zapstore](https://zapstore.dev),
the open Android app store built on Nostr.

It is a native TypeScript implementation: no `zsp` binary and no Go toolchain.

The dependencies are bundled into a single committed `dist/index.js` with esbuild.
GitHub Actions does not run `npm install` for an action, so anything left
external resolves during in-repo testing and then fails for consumers. Vendoring
`node_modules` was the alternative and ran to 52 MB per invocation; the bundle is
under 600 KB. CI rebuilds and fails if `dist/` is stale, and the self-test runs
with `node_modules` moved aside so a missing bundle shows up as a broken test
rather than a broken publish.

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

   `pubkey` is injected at publish time from the signing credential, so it can be
   left as a placeholder or omitted entirely. That keeps the committed config and
   the key from drifting apart when the key is rotated, and means the npub never
   has to be copied by hand.

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
   # Optional. Injected from the signing key at publish time.
   pubkey: REPLACE_WITH_YOUR_NPUB
   ```

   With a bunker credential there is no known identity until after connecting, so
   the config must carry its own `pubkey`.

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
| `mode` | `publish` | `check` needs no credential; `sign` signs without publishing |
| `skip-if-unconfigured` | `false` | Succeed quietly when no signer is set |

## Outputs

`apk-sha256`, `certificate-sha256`, `app-event-id`, `asset-event-id`,
`release-event-id`.

## Verifying without publishing

`mode: check` resolves the APK, reads its identity and validates the config, then
stops. It makes no network calls for a GitHub-sourced APK, uploads nothing, and
**requires no Nostr identity at all**, so it is safe to run on every push and in
CI without handling a credential:

```yaml
- uses: rossigee/zapstore-publish@v1
  with:
    mode: check
```

This is how the project's own CI exercises the action: from an unbuilt checkout,
with no key, asserting the APK digest and certificate fingerprint it reports.

### Verifying a signing credential

`mode: sign` needs a credential and signs every event, but uploads no media and
publishes nothing. It proves the whole path — secret reaches the runner, is
accepted, and produces signatures that verify — without writing to a shared relay
or CDN. Useful for confirming a secret is correct before letting it publish:

```yaml
- uses: rossigee/zapstore-publish@v1
  with:
    sign-with: ${{ secrets.ZAPSTORE_SIGN_WITH }}
    mode: sign
```

`check`, `sign` and `publish` are the three stages: validate, prove the key, then
publish.

## How this is tested

`zapstore.yaml` and the APK are the inputs; everything else is derived and
checked against something independent.

- **Certificate fingerprints are compared to `apksigner`.** The test fixture is a
  real SDK build — `aapt2` links its manifest, `d8` produces its dex, `zipalign`
  aligns and `apksigner` signs it with v2 only — so the expected digest was
  captured from the Android SDK, not from this code.
- **Manifest values are compared to the fixture's own `AndroidManifest.xml`** —
  `package`, `versionCode`, `versionName`, `minSdk`, `targetSdk`.
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
npm run build
```

`npm run build` regenerates `dist/index.js`, which is committed. CI runs it and
fails if the result differs from what is checked in.

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
