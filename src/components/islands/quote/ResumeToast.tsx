import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { cashCardStore, cashCardActions } from './store/cashCardStore';

/**
 * W3-J — "Welcome back" resume toast.
 *
 * Appears at the top of the form when ALL of the following are true:
 *   1. A non-default state is loaded from sessionStorage — i.e. the user
 *      has answered at least Q1 (`state` is set and non-empty).
 *   2. The resume happened within the last 7 days — checked against
 *      `lastTouchedAt` on the store. (No lastTouchedAt = stale = skip.)
 *   3. The user hasn't already submitted (`submittedAt === null`).
 *
 * Two buttons:
 *   - "Pick up where I left off" — no-op (the store is already restored),
 *     just dismisses the toast.
 *   - "Start over" — calls `cashCardActions.reset()`.
 *
 * Auto-dismisses 8 seconds after first render either way.
 *
 * Implementation note: we compute `shouldShow` once on mount (snapshot of
 * initial state) and then latch it. That way user interactions don't
 * cause the toast to reappear mid-session — it's a "welcome back"
 * prompt, not a persistent banner.
 */

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function ResumeToast() {
  const state = useStore(cashCardStore);
  const [visible, setVisible] = useState<boolean>(() => {
    // Snapshot the initial state — we only want to show this if the
    // store had resume data on first mount, not if the user answered
    // Q1 mid-session.
    const snap = cashCardStore.get();
    if (snap.submittedAt !== null) return false;
    if (!snap.state) return false;
    if (!snap.lastTouchedAt) return false;
    const touched = Date.parse(snap.lastTouchedAt);
    if (!Number.isFinite(touched)) return false;
    const age = Date.now() - touched;
    if (age < 0 || age > SEVEN_DAYS_MS) return false;
    return true;
  });

  // Auto-dismiss after 8 seconds.
  useEffect(() => {
    if (!visible) return undefined;
    const t = setTimeout(() => setVisible(false), 8_000);
    return () => clearTimeout(t);
  }, [visible]);

  // If the user submits during the toast window, kill the toast.
  useEffect(() => {
    if (state.submittedAt !== null) {
      setVisible(false);
    }
  }, [state.submittedAt]);

  if (!visible) return null;

  function handlePickUp() {
    setVisible(false);
  }

  function handleStartOver() {
    cashCardActions.reset();
    setVisible(false);
  }

  return (
    <div
      className="mx-auto mb-4 flex w-full max-w-2xl items-center gap-3 rounded-xl border border-navy/20 bg-navy/5 px-4 py-3 text-sm"
      role="status"
      aria-live="polite"
      data-testid="resume-toast"
    >
      <span className="flex-1 font-medium text-ink">
        Welcome back — pick up where you left off?
      </span>
      <button
        type="button"
        onClick={handlePickUp}
        className="rounded-md bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        Pick up where I left off
      </button>
      <button
        type="button"
        onClick={handleStartOver}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-ink"
      >
        Start over
      </button>
    </div>
  );
}
