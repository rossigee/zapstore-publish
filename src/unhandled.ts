/**
 * Guards against unhandled rejections that are noise rather than failures.
 *
 * `SimplePool.close` tears down relay connections while nostr-tools may still
 * have queued work bound to them, and nothing awaits the resulting promises.
 * Two rejections show up on a real release run *after* every event was already
 * accepted by the relay:
 *
 *   Error: relay connection closed by us
 *   SendingOnClosedConnection: Tried to send message '["EVENT",…]'
 *
 * Both arrived after five screenshots were uploaded and kinds 3063, 30063 and
 * 32267 were all published, and both failed the step. Left alone, a publish that
 * worked is reported as broken.
 *
 * The distinction that matters is *when* the rejection happens. During the run,
 * any unhandled rejection is a real defect and still fails the step. Teardown
 * begins only once the last publish has resolved, at which point a rejection
 * about the connection going away cannot be a publish failure, because the
 * publishes are already done.
 */

/** Rejections that are always benign, whenever they arrive. */
const BENIGN_MESSAGES = ["relay connection closed by us"];

/** Rejections that are benign only once teardown has begun. */
const TEARDOWN_MESSAGES = ["SendingOnClosedConnection", "closed connection"];

function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * GitHub Actions sets RUNNER_DEBUG=1 when the workflow enables debug logging,
 * and ACTIONS_STEP_DEBUG=1 when it is enabled for this step alone.
 */
function debugEnabled(): boolean {
  return process.env.RUNNER_DEBUG === "1" || process.env.ACTIONS_STEP_DEBUG === "1";
}

/**
 * A send-on-closed-connection rejection embeds the whole serialised event, so
 * its message runs to thousands of characters of app description, screenshot
 * URLs and signatures. None of it is actionable: the only part that identifies
 * the rejection is the error name ahead of the first colon, and the operator
 * already knows the publishes succeeded, since the guard only tolerates these
 * after the last publish has resolved.
 */
function summariseNoise(message: string): string {
  const [name] = message.split(":", 1);
  return `${name === message ? message : name}; enable debug logging for the full message`;
}

// Both require a real Error: nostr-tools throws Error objects, and matching a
// bare string or an arbitrary object that happens to contain the text would
// widen the tolerated set for no reason.
export function isBenignRelayClose(reason: unknown): boolean {
  return reason instanceof Error && BENIGN_MESSAGES.some((m) => reason.message.includes(m));
}

/** True for a rejection caused by tearing a relay connection down. */
export function isTeardownNoise(reason: unknown): boolean {
  return reason instanceof Error && TEARDOWN_MESSAGES.some((m) => reason.message.includes(m));
}

let tearingDown = false;

/**
 * Marks the start of teardown, after which connection-level rejections are
 * tolerated. Called immediately before the relay pool is closed.
 */
export function beginTeardown(): void {
  tearingDown = true;
}

/** Test hook. */
export function resetTeardown(): void {
  tearingDown = false;
}

export function createUnhandledRejectionHandler(
  log: (message: string) => void,
  write: (message: string) => void,
  fail: () => void,
): (reason: unknown) => void {
  return (reason: unknown): void => {
    const message = messageOf(reason);
    if (isBenignRelayClose(reason) || (tearingDown && isTeardownNoise(reason))) {
      const detail = debugEnabled() ? message : summariseNoise(message);
      log(`ignored relay teardown noise: ${detail}`);
      return;
    }
    write(`::error::unhandled rejection: ${reason instanceof Error ? reason.stack : message}\n`);
    fail();
  };
}

export function installUnhandledRejectionGuard(
  log: (message: string) => void,
  write: (message: string) => void,
): () => void {
  const listener = createUnhandledRejectionHandler(log, write, () => {
    process.exitCode = 1;
  });
  process.on("unhandledRejection", listener);
  // Returned so a caller, and the tests, can detach it.
  return () => process.off("unhandledRejection", listener);
}
