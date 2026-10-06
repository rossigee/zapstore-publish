import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { RelayPublisher, PUBLISH_TIMEOUT_MS, isPublishTimeout, awaitAcknowledgement } from "../src/nostr/publisher.ts";

describe("isPublishTimeout", () => {
  test("recognises the rejection nostr-tools raises", () => {
    assert.equal(isPublishTimeout(new Error("publish timed out")), true);
  });

  test("does not swallow other failures", () => {
    // A relay rejecting the event is a real answer and must not be retried into a
    // success, so only the exact timeout counts.
    assert.equal(isPublishTimeout(new Error("rejected: blocked")), false);
    assert.equal(isPublishTimeout("publish timed out"), false);
    assert.equal(isPublishTimeout(undefined), false);
  });
});

describe("awaitAcknowledgement", () => {
  test("awaits every promise in the returned array", async () => {
    // The array is one promise per relay. Awaiting the array itself would await
    // nothing, which is how a publish was once reported that no relay accepted.
    let resolved = 0;
    await awaitAcknowledgement(() => [
      Promise.resolve().then(() => { resolved++; }),
      Promise.resolve().then(() => { resolved++; }),
      Promise.resolve().then(() => { resolved++; }),
    ]);
    assert.equal(resolved, 3);
  });

  test("retries once on timeout", async () => {
    let attempts = 0;
    await awaitAcknowledgement(() => {
      attempts++;
      if (attempts === 1) return [Promise.reject(new Error("publish timed out"))];
      return [Promise.resolve("ok")];
    });
    assert.equal(attempts, 2, "should retry exactly once after a timeout");
  });

  test("does not retry a real rejection", async () => {
    let attempts = 0;
    await assert.rejects(
      () => awaitAcknowledgement(() => {
        attempts++;
        return [Promise.reject(new Error("rejected: blocked"))];
      }),
      /rejected: blocked/,
    );
    assert.equal(attempts, 1, "a relay that rejected the event must not be retried");
  });

  test("gives up after the second timeout", async () => {
    let attempts = 0;
    await assert.rejects(
      () => awaitAcknowledgement(() => {
        attempts++;
        return [Promise.reject(new Error("publish timed out"))];
      }),
      /publish timed out/,
    );
    assert.equal(attempts, 2, "a relay that is not answering must not be retried forever");
  });

  test("does not retry when the first attempt succeeds", async () => {
    let attempts = 0;
    await awaitAcknowledgement(() => {
      attempts++;
      return [Promise.resolve("ok")];
    });
    assert.equal(attempts, 1);
  });
});

describe("RelayPublisher", () => {
  test("raises the acknowledgement deadline above the library default", () => {
    // nostr-tools defaults every relay to 4400ms, and SimplePool gives no way to
    // change it. That is what failed the SMS2Webhook v2.2.0 release.
    const publisher = new RelayPublisher();
    assert.equal(PUBLISH_TIMEOUT_MS, 30_000);
    assert.ok(
      PUBLISH_TIMEOUT_MS > 4_400,
      "must exceed the 4400ms nostr-tools default",
    );
    publisher.close();
  });

  test("closing twice is safe", () => {
    const publisher = new RelayPublisher();
    publisher.close();
    publisher.close();
  });
});
