import { useEffect, useRef, useState } from 'react';

/**
 * W3-J — Exit-intent detector.
 *
 * Desktop: fires when the mouse leaves the viewport through the TOP edge
 * (classic exit intent — user aiming for the address bar / back button /
 * close tab).
 *
 * Mobile: fires on a rapid upward scroll gesture (scrollY decreasing with
 * a velocity above a threshold) since mobile has no mouseleave. This is
 * a heuristic, not perfect, but good enough to catch most abandon attempts.
 *
 * Fires at most ONCE per session (tracked in sessionStorage at key
 * `dscrin.exit_intent.shown`). The parent component can also pass
 * `enabled=false` to suppress entirely (we gate on step >= q3).
 */

export const EXIT_INTENT_SHOWN_KEY = 'dscrin.exit_intent.shown';

export interface UseExitIntentOptions {
  /**
   * Whether the detector is armed. When false, listeners are still
   * attached but the fire handler no-ops — lets the consumer cheaply
   * toggle state without reattaching events.
   */
  enabled: boolean;
  /**
   * Mobile scroll velocity threshold (pixels per millisecond). Default
   * 1.5 px/ms ≈ a deliberate upward flick.
   */
  mobileVelocityThreshold?: number;
}

function hasAlreadyShown(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.sessionStorage.getItem(EXIT_INTENT_SHOWN_KEY) === '1';
  } catch {
    return false;
  }
}

function markShown(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(EXIT_INTENT_SHOWN_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function useExitIntent(
  options: UseExitIntentOptions
): { triggered: boolean; dismiss: () => void } {
  const { enabled, mobileVelocityThreshold = 1.5 } = options;
  const [triggered, setTriggered] = useState(false);
  // Track last scroll position + timestamp for mobile velocity math.
  const lastScrollRef = useRef<{ y: number; t: number } | null>(null);
  // Prevent the same mount firing twice in StrictMode.
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (hasAlreadyShown()) return;
    if (typeof window === 'undefined') return;

    function fire() {
      if (firedRef.current) return;
      if (hasAlreadyShown()) return;
      firedRef.current = true;
      markShown();
      setTriggered(true);
    }

    function onMouseLeave(e: MouseEvent) {
      // Only top-edge exits count. e.clientY can be negative when the
      // cursor leaves the viewport through the top.
      if (e.clientY <= 0) {
        fire();
      }
    }

    function onScroll() {
      const now = Date.now();
      const y = window.scrollY;
      const last = lastScrollRef.current;
      lastScrollRef.current = { y, t: now };
      if (!last) return;
      const dy = y - last.y;
      const dt = now - last.t;
      if (dt <= 0) return;
      // Rapid upward flick — scrolling up FAST.
      const velocity = Math.abs(dy) / dt;
      if (dy < 0 && velocity >= mobileVelocityThreshold && y < 200) {
        fire();
      }
    }

    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, mobileVelocityThreshold]);

  return {
    triggered,
    dismiss: () => setTriggered(false),
  };
}
