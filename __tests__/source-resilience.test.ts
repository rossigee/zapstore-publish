import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { Socket } from "node:net";
import type { AddressInfo } from "node:net";

import { downloadAsset, GITHUB_TIMEOUT_MS, listReleases, SourceError } from "../src/source.ts";

/**
 * Builds a fetch that fails a given number of times before answering.
 *
 * Each call is recorded so a test can assert how many attempts were actually
 * made, which is the part that matters: retrying is only correct if it stops.
 */
function flakyFetch(
  failures: number,
  failure: (attempt: number) => unknown,
  body: unknown = [{ tag_name: "v1.0.0", draft: false, prerelease: false, assets: [] }],
): { fetchImpl: typeof fetch; calls: number } {
  const state = { calls: 0 };
  const fetchImpl = (async () => {
    state.calls += 1;
    if (state.calls <= failures) {
      const outcome = failure(state.calls);
      if (outcome instanceof Response) return outcome;
      throw outcome;
    }
    // A non-Response body is returned as bytes, so a download test can use the
    // same helper as a listing test.
    if (body instanceof Uint8Array) return new Response(body, { status: 200 });
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return { fetchImpl, get calls() { return state.calls; } } as { fetchImpl: typeof fetch; calls: number };
}

const REPOSITORY = "https://github.com/example/example-app";

describe("GitHub request resilience", () => {
  test("asks once when the call succeeds", async () => {
    const mock = flakyFetch(0, () => new Error("unused"));
    const releases = await listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl });
    assert.equal(mock.calls, 1);
    assert.equal(releases.length, 1);
    assert.equal(releases[0]?.tagName, "v1.0.0");
  });

  test("retries a transport error and then succeeds", async () => {
    const mock = flakyFetch(2, (attempt) => new Error(`socket hang up ${attempt}`));
    const releases = await listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl });
    assert.equal(releases.length, 1);
    assert.equal(mock.calls, 3, "two failures then one success");
  });

  test("retries a 5xx and then succeeds", async () => {
    const mock = flakyFetch(2, (attempt) => new Response("busy", { status: 503 }));
    const releases = await listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl });
    assert.equal(releases.length, 1);
    assert.equal(mock.calls, 3);
  });

  test("retries a 429 and then succeeds", async () => {
    const mock = flakyFetch(1, () => new Response("slow down", { status: 429 }));
    const releases = await listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl });
    assert.equal(releases.length, 1);
    assert.equal(mock.calls, 2);
  });

  test("gives up after a bounded number of attempts and reports it", async () => {
    // Without a bound this retries forever, and the step hangs until the job
    // timeout, which defaults to six hours.
    const mock = flakyFetch(99, () => new Error("connection reset"));
    await assert.rejects(
      () => listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl }),
      /connection reset/,
    );
    assert.equal(mock.calls, 3, "three attempts, then it gives up");
  });

  test("does not retry a 4xx, since the request is wrong", async () => {
    const mock = flakyFetch(99, () => new Response("no such repo", { status: 404 }));
    await assert.rejects(
      () => listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl }),
      (error: unknown) => {
        assert.ok(error instanceof SourceError);
        assert.match(error.message, /failed with 404/);
        return true;
      },
    );
    assert.equal(mock.calls, 1, "a 404 is not worth repeating");
  });

  test("reports the last 5xx rather than the first", async () => {
    const mock = flakyFetch(99, (attempt) => new Response(`busy ${attempt}`, { status: 502 }));
    await assert.rejects(
      () => listReleases({ repository: REPOSITORY, fetchImpl: mock.fetchImpl }),
      /failed with 502/,
    );
    assert.equal(mock.calls, 3);
  });

  test("sets a deadline on every attempt, so a hung socket cannot block forever", async () => {
    const signals: (AbortSignal | null | undefined)[] = [];
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      signals.push(init.signal);
      return new Response(JSON.stringify([]), { status: 200 });
    }) as unknown as typeof fetch;

    await listReleases({ repository: REPOSITORY, fetchImpl });
    assert.equal(signals.length, 1);
    assert.ok(signals[0] instanceof AbortSignal, "a signal must be set");
    assert.equal(signals[0]?.aborted, false);
  });

  test("a hung socket rejects instead of blocking, and is retried", async () => {
    assert.ok(GITHUB_TIMEOUT_MS > 0 && GITHUB_TIMEOUT_MS <= 120_000, "the deadline is finite and sane");

    // A real server that accepts the connection and never answers, rather than a
    // stub that returns a pending promise. The open socket is what keeps the
    // event loop alive, so the deadline is the only thing that can end this: a
    // pending promise alone would let the process exit and the step report
    // success having published nothing.
    const sockets: Socket[] = [];
    const server = createServer((_request, response) => {
      // Accept and hold. Never write a response.
      const socket = response.socket;
      if (socket) sockets.push(socket);
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;

    try {
      // listReleases builds a github.com URL, so the redirect is pointed at the
      // stub by resolving the host through a fetch that ignores the given URL.
      let attempts = 0;
      const fetchImpl = (async (_url: string, init: RequestInit) => {
        attempts += 1;
        return fetch(`http://127.0.0.1:${port}/`, { ...init, signal: init.signal });
      }) as unknown as typeof fetch;

      await assert.rejects(
        () => listReleases({ repository: REPOSITORY, fetchImpl, timeoutMs: 250 }),
        /abort|timeout|timed out/i,
      );
      assert.equal(attempts, 3, "the hang is retried, then reported");
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe("downloadAsset resilience", () => {
  const asset = { name: "app.apk", size: 4, browserDownloadUrl: "https://github.com/example/example-app/releases/app.apk" };

  test("retries a dropped connection mid-download", async () => {
    const mock = flakyFetch(1, () => new Error("ECONNRESET"), new Uint8Array([1, 2, 3, 4]));
    const data = await downloadAsset(asset, { repository: REPOSITORY, fetchImpl: mock.fetchImpl });
    assert.equal(mock.calls, 2);
    assert.deepEqual([...data], [1, 2, 3, 4]);
  });

  test("does not retry a 404 asset", async () => {
    const mock = flakyFetch(99, () => new Response("gone", { status: 404 }));
    await assert.rejects(
      () => downloadAsset(asset, { repository: REPOSITORY, fetchImpl: mock.fetchImpl }),
      /downloading app\.apk failed with 404/,
    );
    assert.equal(mock.calls, 1);
  });
});
