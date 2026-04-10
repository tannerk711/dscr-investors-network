import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  animate,
} from 'framer-motion';
import { heroScrubberQuote } from '../../../lib/pricing';

/**
 * EquityScrubber — interactive hero centerpiece.
 *
 * A single range slider maps property value ($200K → $1M) to two live
 * ballpark outputs: cash at close + monthly cash flow. As the user drags,
 * both numbers update at 60fps via a motion-value pipeline (no React
 * re-renders per tick — DOM text is written directly from a subscriber).
 *
 * On mount, the slider auto-demos: it ramps from $200K → $400K over 1.2s
 * so a first-time visitor sees the mechanic without reading an instruction.
 * The "try it" hint fades once the user interacts.
 *
 * Brand constraints honored:
 *   - No rate, LTV, DSCR displayed
 *   - Ballpark-before-contact (numbers visible with zero form fields)
 *   - Mobile-first (85% of traffic) — the slider is full-width touch target
 */

const MIN = 200_000;
const MAX = 1_000_000;
const STEP = 10_000;
const DEFAULT = 400_000;

export function EquityScrubber() {
  const prefersReduced = useReducedMotion() ?? false;

  // Source of truth — motion value that drives the DOM text directly
  // without causing React re-renders on every frame.
  const value = useMotionValue(MIN);

  // React-tracked slider value — only updates on commit, not on every
  // frame of the drag. The <input type="range"> stays in sync via this.
  const [sliderValue, setSliderValue] = useState(MIN);
  const [interacted, setInteracted] = useState(false);

  const cashRef = useRef<HTMLSpanElement>(null);
  const flowRef = useRef<HTMLSpanElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Auto-demo on mount — animate the motion value from MIN → DEFAULT.
  useEffect(() => {
    if (prefersReduced) {
      value.set(DEFAULT);
      setSliderValue(DEFAULT);
      return;
    }
    const controls = animate(value, DEFAULT, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => {
        // Keep the native range input in sync during the demo so the
        // thumb visibly slides across the track.
        if (sliderRef.current) {
          sliderRef.current.value = String(Math.round(v));
          sliderRef.current.style.setProperty(
            '--range-progress',
            `${((v - MIN) / (MAX - MIN)) * 100}%`
          );
        }
      },
      onComplete: () => {
        setSliderValue(DEFAULT);
      },
    });
    return () => controls.stop();
  }, [prefersReduced, value]);

  // Subscribe to motion-value changes and paint text directly into the DOM.
  // This is the "60fps without re-renders" path — useMotionValueEvent is
  // called on every frame while animating / dragging and writes the
  // textContent of the two spans.
  useMotionValueEvent(value, 'change', (latest) => {
    const { cashAtClose, monthlyCashFlow } = heroScrubberQuote(latest);
    if (cashRef.current) {
      cashRef.current.textContent = formatUsd(cashAtClose);
    }
    if (flowRef.current) {
      flowRef.current.textContent = `+${formatUsd(monthlyCashFlow)}/mo`;
    }
  });

  // Paint initial values once on mount (motion-value events don't fire
  // for the starting value).
  useEffect(() => {
    const { cashAtClose, monthlyCashFlow } = heroScrubberQuote(value.get());
    if (cashRef.current) cashRef.current.textContent = formatUsd(cashAtClose);
    if (flowRef.current)
      flowRef.current.textContent = `+${formatUsd(monthlyCashFlow)}/mo`;
  }, [value]);

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      value.set(n);
      setSliderValue(n);
      setInteracted(true);
      // Update the fill progress custom prop inline for instant paint.
      e.target.style.setProperty(
        '--range-progress',
        `${((n - MIN) / (MAX - MIN)) * 100}%`
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-gold bg-white p-6 shadow-xl md:p-8">
      {/* Giant $ watermark */}
      <span
        className="pointer-events-none absolute -right-6 -bottom-10 select-none text-[12rem] font-extrabold leading-none text-gold opacity-[0.06]"
        aria-hidden="true"
      >
        $
      </span>

      {/* Top label */}
      <p className="relative text-xs font-semibold uppercase tracking-widest text-gold">
        Your Cash Card — drag to preview
      </p>

      {/* Cash at close — live */}
      <div className="relative mt-5">
        <p className="text-4xl font-extrabold leading-tight text-ink tabular-nums md:text-5xl">
          <span ref={cashRef}>$0</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">cash at close</p>
      </div>

      {/* Cash flow — live */}
      <div className="relative mt-5">
        <p className="text-2xl font-bold text-success tabular-nums md:text-3xl">
          <span ref={flowRef}>+$0/mo</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">monthly cash flow</p>
      </div>

      {/* The scrubber */}
      <div className="relative mt-6">
        <label
          htmlFor="hero-equity-slider"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          Drag your property value
        </label>
        <input
          ref={sliderRef}
          id="hero-equity-slider"
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          defaultValue={MIN}
          onChange={handleSlider}
          aria-label="Property value scrubber"
          className="cash-slider mt-3 w-full"
          style={{
            ['--range-progress' as string]: `${((sliderValue - MIN) / (MAX - MIN)) * 100}%`,
          }}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400 tabular-nums">
          <span>{formatUsd(MIN)}</span>
          <span>{formatUsd(MAX)}</span>
        </div>

        {/* "Try it" hint — fades after first interaction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: interacted ? 0 : 1 }}
          transition={{ duration: 0.4, delay: interacted ? 0 : 1.3 }}
          className="pointer-events-none mt-3 text-center text-xs italic text-gold"
          aria-hidden="true"
        >
          ← try it →
        </motion.p>
      </div>
    </div>
  );
}

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}
