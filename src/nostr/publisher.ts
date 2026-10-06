/**
 * A relay publisher built on `Relay` rather than `SimplePool`.
 *
 * `SimplePool` constructs its own relays and gives no way to set
 * `publishTimeout`: nostr-tools' `AbstractRelay` declares it as an instance field
 * defaulting to 4400ms, and its constructor copies only `verifyEvent`,
 * `websocketImplementation`, `enablePing`, `enableReconnect` and `idleTimeout` from
 * its options. `SimplePool.ensureRelay` does not pass it, so every relay it creates
 * inherits 4400ms.
 *
 * That deadline is tuned for an interactive client. By the time this action
 * publishes the asset event it has already uploaded a ~15MB APK and several CDN
 * objects, so a relay that takes a moment fails the release with "publish timed
 * out" — and possibly after having stored the event anyway. That is what left
 * SMS2Webhook v2.2.0 with a release event pointing at an asset event the relay
 * never accepted, and a greyed-out Install button.
 *
 * `Relay` *is* exported and extends `AbstractRelay`, so the field is reachable on
 * the instance.
 */

import { Relay, type VerifiedEvent } from "nostr-tools";

/**
 * How long to wait for a relay to acknowledge a publish.
 *
 * Generous on purpose. Waiting costs a slower failure; not waiting costs a release
 * that published half an event set.
 */
export const PUBLISH_TIMEOUT_MS = 30_000;

/** True for the rejection nostr-tools raises when no acknowledgement arrives. */
export function isPublishTimeout(error: unknown): boolean {
  return error instanceof Error && error.message === "publish timed out";
}

export class RelayPublisher {
  private readonly relays = new Map<string, Relay>();
  private readonly timeoutMs: number;

  constructor(timeoutMs: number = PUBLISH_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  private relayFor(url: string): Relay {
    let relay = this.relays.get(url);
    if (!relay) {
      relay = new Relay(url, { enablePing: true });
      relay.publishTimeout = this.timeoutMs;
      this.relays.set(url, relay);
    }
    return relay;
  }

  /** One promise per relay, matching `SimplePool.publish` for callers. */
  publish(relays: string[], event: VerifiedEvent): Promise<unknown>[] {
    return relays.map(async (url) => {
      const relay = this.relayFor(url);
      if (!relay.connected) {
        await relay.connect();
      }
      return relay.publish(event);
    });
  }

  /** Closes every connection this publisher opened. */
  close(): void {
    for (const relay of this.relays.values()) {
      try {
        void relay.close();
      } catch {
        // Teardown noise after a resolved publish is not a failure.
      }
    }
    this.relays.clear();
  }
}

/**
 * Awaits every relay's acknowledgement, retrying once on timeout.
 *
 * A timeout is ambiguous: the relay may have stored the event and simply been slow,
 * or it may never have received it. Republishing is safe because a NIP-01 event id
 * is derived from its content, so a repeat is the same event rather than a
 * duplicate. Anything slower than the timeout twice running is a relay that is not
 * answering, and that still throws.
 */
export async function awaitAcknowledgement(
  attempt: () => Promise<unknown>[],
): Promise<void> {
  try {
    await Promise.all(attempt());
    return;
  } catch (first) {
    if (!isPublishTimeout(first)) throw first;
  }
  await Promise.all(attempt());
}
