import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  beginTeardown,
  createUnhandledRejectionHandler,
  installUnhandledRejectionGuard,
  isBenignRelayClose,
  isTeardownNoise,
  resetTeardown,
} from "../src/unhandled.ts";

// Regression: a real release run uploaded all five screenshots and published all
// three events, then failed the step because SimplePool.close rejected its
// internal subscription promises with nobody awaiting them.
describe("unhandled rejection guard", () => {
  test("recognises only the relay-close rejection", () => {
    assert.equal(isBenignRelayClose(new Error("relay connection closed by us")), true);
    assert.equal(isBenignRelayClose(new Error("something else")), false);
    assert.equal(isBenignRelayClose("relay connection closed by us"), false);
    assert.equal(isBenignRelayClose(undefined), false);
  });

  test("fails the step on a rejection that is not the relay close", () => {
    const logged: string[] = [];
    const written: string[] = [];
    let failures = 0;
    const handler = createUnhandledRejectionHandler(
      (m) => logged.push(m),
      (m) => written.push(m),
      () => { failures += 1; },
    );

    handler(new Error("a genuine defect"));

    assert.equal(logged.length, 0, "must not be treated as benign");
    assert.equal(written.length, 1, "must be reported");
    assert.match(written[0]!, /unhandled rejection/);
    assert.match(written[0]!, /a genuine defect/);
    assert.equal(failures, 1, "must still fail the step");
  });

  test("stays quiet for the relay close, after a publish that already succeeded", () => {
    const logged: string[] = [];
    const written: string[] = [];
    let failures = 0;
    const handler = createUnhandledRejectionHandler(
      (m) => logged.push(m),
      (m) => written.push(m),
      () => { failures += 1; },
    );

    handler(new Error("relay connection closed by us"));

    assert.equal(written.length, 0, "must not be reported as an error");
    assert.equal(logged.length, 1, "should be noted");
    assert.match(logged[0]!, /relay connection closed by us/);
    assert.equal(failures, 0, "must not fail a publish that already succeeded");
  });

  // The regression that actually bit: after uploads and all three events
  // published, closing the pool produced this and failed the step.
  test("tolerates a send on a closed connection only during teardown", () => {
    const make = () => {
      const logged: string[] = [];
      const written: string[] = [];
      let failures = 0;
      return {
        logged,
        written,
        get failures() { return failures; },
        handler: createUnhandledRejectionHandler(
          (m) => logged.push(m),
          (m) => written.push(m),
          () => { failures += 1; },
        ),
      };
    };

    const noise = new Error(
      "SendingOnClosedConnection: Tried to send message '[\"EVENT\",…]' on a closed connection to wss://relay.zapstore.dev/.",
    );
    assert.equal(isTeardownNoise(noise), true);

    // Before teardown: a real defect, must fail.
    resetTeardown();
    const before = make();
    before.handler(noise);
    assert.equal(before.failures, 1, "must fail outside teardown");
    assert.equal(before.written.length, 1);

    // During teardown: tolerated, because every publish has already resolved.
    beginTeardown();
    const after = make();
    after.handler(noise);
    assert.equal(after.failures, 0, "must not fail during teardown");
    assert.equal(after.written.length, 0);
    assert.equal(after.logged.length, 1);
    resetTeardown();
  });

  test("handles a non-Error rejection without throwing", () => {
    const written: string[] = [];
    let failures = 0;
    const handler = createUnhandledRejectionHandler(() => {}, (m) => written.push(m), () => { failures += 1; });

    handler("just a string");

    assert.equal(failures, 1);
    assert.match(written[0]!, /just a string/);
  });

  // The send-on-closed-connection rejection embeds the entire serialised
  // event, so logging it verbatim buried the run output in a multi-kilobyte
  // line that said nothing the operator could act on.
  describe("teardown noise logging", () => {
    const noise = new Error(
      `SendingOnClosedConnection: Tried to send message '["EVENT",{"kind":32267,"content":"${"x".repeat(5000)}"}]' on a closed connection to wss://relay.zapstore.dev/.`,
    );

    const loggedFor = (reason: unknown): string[] => {
      const logged: string[] = [];
      beginTeardown();
      try {
        createUnhandledRejectionHandler((m) => logged.push(m), () => {}, () => {})(reason);
      } finally {
        resetTeardown();
      }
      return logged;
    };

    test("summarises the rejection by name, without debug logging", () => {
      delete process.env.RUNNER_DEBUG;
      delete process.env.ACTIONS_STEP_DEBUG;

      const [line] = loggedFor(noise);

      assert.equal(line, "ignored relay teardown noise: SendingOnClosedConnection; enable debug logging for the full message");
    });

    test("logs the full message when debug logging is on", () => {
      process.env.RUNNER_DEBUG = "1";
      try {
        const [line] = loggedFor(noise);

        assert.match(line!, /Tried to send message/);
        assert.match(line!, /closed connection to wss:\/\/relay\.zapstore\.dev\//);
      } finally {
        delete process.env.RUNNER_DEBUG;
      }
    });

    test("leaves a colon-free message intact", () => {
      delete process.env.RUNNER_DEBUG;
      delete process.env.ACTIONS_STEP_DEBUG;

      const [line] = loggedFor(new Error("relay connection closed by us"));

      assert.equal(
        line,
        "ignored relay teardown noise: relay connection closed by us; enable debug logging for the full message",
      );
    });
  });

  test("installs and detaches from the process", () => {
    const detach = installUnhandledRejectionGuard(() => {}, () => {});
    assert.equal(process.listenerCount("unhandledRejection") > 0, true);
    detach();
  });
});
