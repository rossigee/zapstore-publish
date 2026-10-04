import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { blobUrl, contentTypeForPath, sha256Hex, uploadBlob, BlossomError } from "../src/blossom.ts";
import { parseGitHubRepository, rankApkAssets, selectApkAsset, selectRelease, SourceError } from "../src/source.ts";

// Known vector: SHA-256 of the empty input.
const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

describe("blossom", () => {
  test("hashes with the known SHA-256 of an empty buffer", () => {
    assert.equal(sha256Hex(new Uint8Array(0)), EMPTY_SHA256);
  });

  test("builds the canonical read URL", () => {
    assert.equal(blobUrl("https://cdn.example", EMPTY_SHA256), `https://cdn.example/${EMPTY_SHA256}`);
    assert.equal(blobUrl("https://cdn.example/", EMPTY_SHA256), `https://cdn.example/${EMPTY_SHA256}`);
  });

  test("uploads with PUT /upload and an X-SHA-256 header", async () => {
    const payload = Buffer.from("icon bytes");
    const captured: { url: string; method?: string; headers: Headers } = {
      url: "",
      headers: new Headers(),
    };

    const descriptor = await uploadBlob(payload, "image/png", {
      baseUrl: "https://cdn.example",
      fetchImpl: (async (url: string, init: RequestInit) => {
        captured.url = url;
        captured.method = init.method;
        captured.headers = new Headers(init.headers);
        return new Response(
          JSON.stringify({
            url: `https://cdn.example/${sha256Hex(payload)}.png`,
            sha256: sha256Hex(payload),
            size: payload.byteLength,
            type: "image/png",
            uploaded: 1_725_105_921,
          }),
          { status: 201 },
        );
      }) as unknown as typeof fetch,
    });

    assert.equal(captured.url, "https://cdn.example/upload");
    assert.equal(captured.method, "PUT");
    assert.equal(captured.headers.get("X-SHA-256"), sha256Hex(payload));
    assert.equal(captured.headers.get("Content-Length"), String(payload.byteLength));
    assert.equal(captured.headers.get("Content-Type"), "image/png");
    assert.equal(captured.headers.get("Authorization"), null, "no token means no Authorization header");

    assert.equal(descriptor.size, payload.byteLength);
    assert.equal(descriptor.url, `https://cdn.example/${sha256Hex(payload)}.png`);
    assert.equal(descriptor.uploaded, 1_725_105_921);
  });

  test("sends a bearer token when one is configured", async () => {
    let auth: string | null = null;
    await uploadBlob(Buffer.from("x"), "image/png", {
      baseUrl: "https://cdn.example",
      token: "s3cret",
      fetchImpl: (async (_url: string, init: RequestInit) => {
        auth = new Headers(init.headers).get("Authorization");
        return new Response("{}", { status: 200 });
      }) as unknown as typeof fetch,
    });
    assert.equal(auth, "Bearer s3cret");
  });

  test("falls back to the canonical URL when the server returns no descriptor", async () => {
    const payload = Buffer.from("no json here");
    const descriptor = await uploadBlob(payload, "image/png", {
      baseUrl: "https://cdn.example",
      fetchImpl: (async () => new Response(null, { status: 201 })) as unknown as typeof fetch,
    });
    assert.equal(descriptor.url, `https://cdn.example/${sha256Hex(payload)}`);
    assert.equal(descriptor.size, payload.byteLength);
  });

  test("rejects a server that reports a different hash", async () => {
    await assert.rejects(
      () =>
        uploadBlob(Buffer.from("a"), "image/png", {
          baseUrl: "https://cdn.example",
          fetchImpl: (async () =>
            new Response(JSON.stringify({ sha256: EMPTY_SHA256, url: "x" }), { status: 200 })) as unknown as typeof fetch,
        }),
      /hashes to/,
    );
  });

  test("surfaces the status and X-Reason on failure", async () => {
    await assert.rejects(
      () =>
        uploadBlob(Buffer.from("a"), "application/vnd.android.package-archive", {
          baseUrl: "https://cdn.example",
          fetchImpl: (async () =>
            new Response(null, { status: 413, headers: { "X-Reason": "too big" } })) as unknown as typeof fetch,
        }),
      (error: unknown) => {
        assert.ok(error instanceof BlossomError);
        assert.equal(error.status, 413);
        assert.match(error.message, /too big/);
        return true;
      },
    );
  });

  test("maps extensions to content types", () => {
    assert.equal(contentTypeForPath("a/b/icon.PNG"), "image/png");
    assert.equal(contentTypeForPath("app.apk"), "application/vnd.android.package-archive");
    assert.equal(contentTypeForPath("mystery.bin"), "application/octet-stream");
  });
});

describe("github source resolution", () => {
  test("parses a repository URL, with or without .git", () => {
    assert.deepEqual(parseGitHubRepository("https://github.com/rossigee/sms2webhook"), {
      owner: "rossigee",
      repo: "sms2webhook",
    });
    assert.deepEqual(parseGitHubRepository("https://github.com/rossigee/sms2webhook.git"), {
      owner: "rossigee",
      repo: "sms2webhook",
    });
    assert.throws(() => parseGitHubRepository("https://gitlab.com/a/b"), SourceError);
  });

  test("prefers the release-signed build over the debug build", () => {
    const ranked = rankApkAssets([
      { name: "sms2webhook-v2.0.1-debug.apk", size: 18_398_889 },
      { name: "sms2webhook-v2.0.1-release-signed.apk", size: 12_000_000 },
    ]);
    assert.equal(ranked[0]?.name, "sms2webhook-v2.0.1-release-signed.apk");
  });

  test("prefers a universal build over a per-ABI one", () => {
    const ranked = rankApkAssets([
      { name: "app-arm64-v8a.apk", size: 9_000_000 },
      { name: "app-universal.apk", size: 9_100_000 },
    ]);
    assert.equal(ranked[0]?.name, "app-universal.apk");
  });

  test("honours the match regex from zapstore.yaml", () => {
    const release = {
      tagName: "v2.0.1",
      draft: false,
      prerelease: false,
      assets: [
        { name: "app-debug.apk", size: 20_000_000 },
        { name: "app-release-signed.apk", size: 10_000_000 },
      ],
    };
    // The sms2webhook pin, which is what keeps a debug build off users' devices.
    assert.equal(selectApkAsset(release, ".*-release-signed\\.apk$").name, "app-release-signed.apk");
    assert.throws(() => selectApkAsset(release, ".*-nope\\.apk$"), /no asset in v2.0.1 matched/);
  });

  test("reports every available asset when the match finds nothing", () => {
    const release = {
      tagName: "v1",
      draft: false,
      prerelease: false,
      assets: [{ name: "app-debug.apk", size: 1 }],
    };
    assert.throws(() => selectApkAsset(release, "nothing"), /available: app-debug\.apk/);
  });

  test("rejects a release with no APK at all", () => {
    assert.throws(
      () => selectApkAsset({ tagName: "v1", draft: false, prerelease: false, assets: [{ name: "notes.txt", size: 1 }] }),
      /has no \.apk assets/,
    );
  });

  test("rejects an invalid match regex instead of silently ignoring it", () => {
    assert.throws(
      () => selectApkAsset({ tagName: "v1", draft: false, prerelease: false, assets: [{ name: "a.apk", size: 1 }] }, "(["),
      /not a valid regular expression/,
    );
  });

  test("skips drafts and prereleases when a stable release exists", () => {
    const chosen = selectRelease([
      { tagName: "v3-beta", draft: false, prerelease: true, assets: [] },
      { tagName: "v2", draft: false, prerelease: false, assets: [] },
    ]);
    assert.equal(chosen.tagName, "v2");
  });

  test("falls back to a prerelease when that is all there is", () => {
    const chosen = selectRelease([{ tagName: "v3-beta", draft: false, prerelease: true, assets: [] }]);
    assert.equal(chosen.tagName, "v3-beta");
  });

  test("never selects a draft", () => {
    assert.throws(() => selectRelease([{ tagName: "v4", draft: true, prerelease: false, assets: [] }]), SourceError);
  });
});
