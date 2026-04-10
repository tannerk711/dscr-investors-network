import { useEffect, useRef, useState } from 'react';

/**
 * Drop-in count-up hook for the Cash Card reveal screen.
 *
 * Tweens from 0 → `target` over `duration` ms with an `ease-out-expo`
 * curve, then locks the value. `delay` lets us stagger sequential
 * counters (cash first, cash flow second).
 *
 * Avoids framer-motion's MotionValue/useMotionValue API to keep this
 * a pure number (so the cents display, asterisks, and ranges all read
 * from one source). Uses requestAnimationFrame.
 *
 * `skip` short-circuits the animation entirely — the value jumps to
 * `target` immediately. Used for `prefers-reduced-motion` clients so
 * we don't do a 1.2s ramp on users who asked the OS to calm down.
 */
type UseCountUpOptions = {
  duration?: number;
  delay?: number;
  skip?: boolean;
};

export function useCountUp(
  target: number,
  durationOrOptions: number | UseCountUpOptions = 1200,
  delayArg = 0
): number {
  // Backwards-compatible overload: legacy call sites pass (target, duration, delay)
  // as positional args; new call sites can pass an options object.
  const opts: Required<UseCountUpOptions> =
    typeof durationOrOptions === 'number'
      ? { duration: durationOrOptions, delay: delayArg, skip: false }
      : {
          duration: durationOrOptions.duration ?? 1200,
          delay: durationOrOptions.delay ?? 0,
          skip: durationOrOptions.skip ?? false,
        };

  const { duration, delay, skip } = opts;
  const [value, setValue] = useState(skip ? target : 0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced-motion short-circuit: lock to the target immediately.
    if (skip) {
      setValue(target);
      return;
    }

    let timeoutId: number | null = null;
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      // ease-out-expo — feels like a slot machine easing into its final
      // position (fast start, long smooth settle at the end) rather than
      // a spreadsheet updating in a linear tick.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    }

    function start() {
      if (cancelled) return;
      startRef.current = null;
      rafRef.current = window.requestAnimationFrame(tick);
    }

    if (delay > 0) {
      timeoutId = window.setTimeout(start, delay);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay, skip]);

  return value;
}
