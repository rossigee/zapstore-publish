import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  createUnhandledRejectionHandler,
  installUnhandledRejectionGuard,
  isBenignRelayClose,
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
    assert.match(logged[0]!, /relay closed/);
    assert.equal(failures, 0, "must not fail a publish that already succeeded");
  });

  test("handles a non-Error rejection without throwing", () => {
    const written: string[] = [];
    let failures = 0;
    const handler = createUnhandledRejectionHandler(() => {}, (m) => written.push(m), () => { failures += 1; });

    handler("just a string");

    assert.equal(failures, 1);
    assert.match(written[0]!, /just a string/);
  });

  test("installs and detaches from the process", () => {
    const detach = installUnhandledRejectionGuard(() => {}, () => {});
    assert.equal(process.listenerCount("unhandledRejection") > 0, true);
    detach();
  });
});
