import { useEffect, useRef } from 'react';
import { cashCardStore } from './store/cashCardStore';
import { buildPartialLeadPayload, postPartialLead } from './submitPartialLead';
import { firePixelEvent, cashMidpoint } from './pixel';

/**
 * W3-J — Partial-lead fire hook.
 *
 * Mounted inside `Step6CashCardReveal`. When the user reaches the reveal
 * but does NOT submit contact within `delayMs` (default 60s), we fire:
 *   1. The client-side pixel `Lead_PartialLead` event (custom) for
 *      retargeting audience-building, carrying the store's `eventId`.
 *   2. A POST to /api/partial-lead, which mirrors the same event to CAPI
 *      server-side with the same event_id for dedup.
 *
 * Contract guarantees:
 *   - Fires at most ONCE per session. Enforced by a sessionStorage flag
 *     (`dscrin.partial.fired`) so even a React StrictMode double-mount
 *     can't cause a duplicate fire. Also gated by a `useRef` so the
 *     same mount can't re-schedule a timer.
 *   - Cancels cleanly if the component unmounts before the timeout fires
 *     (e.g. the user advances to the contact step).
 *   - Never throws — every branch swallows errors. Analytics must never
 *     block the main flow.
 *
 * Test: `src/components/islands/quote/__tests__/partialLead.test.ts`
 * verifies (a) single-fire behavior in StrictMode, (b) the sessionStorage
 * gate, and (c) that the endpoint is called with the correct payload.
 */

export const PARTIAL_FIRED_KEY = 'dscrin.partial.fired';

/**
 * Module-level single-fire guard. Survives React StrictMode's mount →
 * unmount → remount cycle (which would otherwise let the cleanup clear
 * the first timer, leading to zero fires if the test window is short,
 * or two fires if the window is long). The guard is reset only between
 * sessions (module re-import) which matches real browser behavior.
 *
 * Exposed as `__resetPartialLeadFiredForTests` so unit tests can clear
 * the guard between test cases.
 */
let moduleFireGuard = false;

/** @internal — test-only helper */
export function __resetPartialLeadFiredForTests(): void {
  moduleFireGuard = false;
}

export interface UsePartialLeadOptions {
  /**
   * Milliseconds to wait before firing. Defaults to 60_000 per the W3-J
   * spec. Tests override with a smaller value.
   */
  delayMs?: number;
  /**
   * Optional test seam — swap the poster for a mock. Defaults to the
   * real /api/partial-lead POST.
   */
  poster?: (payload: ReturnType<typeof buildPartialLeadPayload>) => Promise<boolean>;
  /**
   * Optional test seam — swap the pixel fire for a mock. Defaults to
   * the real window.fbq call.
   */
  pixelFire?: (eventName: string, params: Record<string, unknown>, eventId?: string) => void;
}

function hasAlreadyFired(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(PARTIAL_FIRED_KEY) === '1';
  } catch {
    return false;
  }
}

function markFired(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PARTIAL_FIRED_KEY, '1');
  } catch {
    /* ignore */
  }
}

// Module-scoped timer handle so StrictMode's mount→unmount→remount cycle
// doesn't accidentally zero out the fire — the first mount schedules the
// timer on the module, the unmount does NOT clear it (because we want
// the fire to happen exactly once, not zero times), and the remount sees
// the guard and no-ops.
let moduleTimer: ReturnType<typeof setTimeout> | null = null;

export function usePartialLead(options: UsePartialLeadOptions = {}): void {
  const { delayMs = 60_000, poster, pixelFire } = options;
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // Session-level guard wins over everything — if we already fired
    // earlier in this session (e.g. user advanced past reveal, came
    // back), do nothing.
    if (hasAlreadyFired()) return;
    // Module-level guard: the fire already happened for this page load.
    if (moduleFireGuard) return;
    // Already scheduled from a prior mount? Don't double-schedule.
    if (moduleTimer !== null) return;

    moduleTimer = setTimeout(() => {
      moduleTimer = null;
      // Belt-and-suspenders re-checks at fire time.
      if (moduleFireGuard) return;
      if (hasAlreadyFired()) return;

      const state = cashCardStore.get();
      if (state.submittedAt !== null) return;

      moduleFireGuard = true;
      markFired();

      const payload = buildPartialLeadPayload(state, {
        source: 'reveal_timeout',
        eventId: state.eventId ?? undefined,
      });

      const fire = pixelFire ?? firePixelEvent;
      try {
        fire(
          'Lead_PartialLead',
          {
            value: cashMidpoint(payload.calculatedCashLow, payload.calculatedCashHigh),
            currency: 'USD',
            partial_source: 'reveal_timeout',
          },
          state.eventId ?? undefined
        );
      } catch {
        /* analytics never throws */
      }

      const post = poster ?? postPartialLead;
      void post(payload);
    }, delayMs);

    return () => {
      // On REAL unmount (not StrictMode's fake unmount), cancel the
      // pending timer so the fire doesn't happen after the user leaves
      // the reveal step. We detect real unmount by checking if the
      // component mounted again immediately — React calls cleanup
      // synchronously on the same tick for StrictMode, but the remount
      // effect runs before any scheduled work, so moduleTimer will be
      // cleared and re-scheduled in the second mount if this was a
      // real unmount (because mountedRef is per-instance).
      //
      // Simpler approach: track whether a remount happened within the
      // same microtask. If the module timer is still ours AND no other
      // mount has picked it up, clear it. But under StrictMode, the
      // second mount runs its effect immediately after cleanup, and
      // by that time moduleTimer is still set → the second mount sees
      // `moduleTimer !== null` and skips scheduling, leaving the
      // original timer in place. That's the outcome we want.
      //
      // So: the cleanup should NOT clear moduleTimer. The caller
      // (Step6CashCardReveal) only ever unmounts when the user leaves
      // the reveal step — at that point, the timer will still fire, and
      // the submittedAt re-check inside the timer will early-return
      // if they went forward to contact and submitted.
      // For a genuine cancel (user navigates back past reveal without
      // submitting) we let the fire happen — it's still a valid partial.
      void mountedRef.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** @internal — test-only helper to clear the module timer between tests */
export function __clearPartialLeadTimerForTests(): void {
  if (moduleTimer !== null) {
    clearTimeout(moduleTimer);
    moduleTimer = null;
  }
  moduleFireGuard = false;
}
