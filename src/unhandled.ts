/**
 * Guards against the one unhandled rejection that is expected at shutdown.
 *
 * `SimplePool.close` rejects the promises behind nostr-tools' internal
 * subscriptions and nothing awaits them. The rejection therefore surfaces after
 * a publish that actually succeeded, and on a real release run it failed the
 * step: every screenshot uploaded, all three events published, then
 * `Error: relay connection closed by us` and a non-zero exit.
 *
 * Only that exact case is tolerated. Every other unhandled rejection is a real
 * defect and still has to fail the step, so it is reported and the exit code is
 * set rather than being swallowed alongside the benign one.
 */

/** True for the rejection nostr-tools raises when a relay is closed. */
export function isBenignRelayClose(reason: unknown): boolean {
  return reason instanceof Error && reason.message === "relay connection closed by us";
}

/**
 * Builds the listener, taking the exit-code side effect as a dependency so the
 * decision can be asserted without touching real process state.
 */
export function createUnhandledRejectionHandler(
  log: (message: string) => void,
  write: (message: string) => void,
  fail: () => void,
): (reason: unknown) => void {
  return (reason: unknown): void => {
    if (isBenignRelayClose(reason)) {
      log("relay closed after publishing; nothing left to do");
      return;
    }
    write(`::error::unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}\n`);
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
