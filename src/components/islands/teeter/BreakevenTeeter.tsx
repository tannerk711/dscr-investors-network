import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  animate,
} from 'framer-motion';
import { teeterCashFlow } from '../../../lib/pricing';

/**
 * BreakevenTeeter — Section 3A replacement for the static RuleOfThumb.
 *
 * Anthony's "$1K per $100K" rule of thumb rendered as a literal seesaw the
 * user can tip with two sliders:
 *
 *   - Loan amount  ($100K → $600K)  → weight on the left cup (the mortgage)
 *   - Monthly rent ($500 → $6,000)  → weight on the right cup (the tenant)
 *
 * The bar tilts toward whichever side is heavier. When rent * 100 > loan
 * it tips right (green "+$X/mo in your pocket"). When loan > rent * 100 it
 * tips left (red "-$X/mo bleeding"). At breakeven it sits flat.
 *
 * The math is `cashFlow = rent - loan/100` (Anthony's napkin math) — pulled
 * from `src/lib/pricing.ts:teeterCashFlow` so there's a single source of
 * truth. No rate, no LTV, no DSCR displayed. Just the rule of thumb visual.
 *
 * Auto-demo on mount: starts heavy-left (loan wins), then the rent slider
 * animates up to the breakeven point and past it into positive territory
 * over ~2.0s, so a scroll-in visitor sees the mechanic with zero reading.
 *
 * Accessibility:
 *   - Both sliders are real <input type="range"> elements
 *   - Live numbers announced via aria-live="polite" on the cashflow line
 *   - Reduced-motion: no auto-demo, no tilt animation (state still changes)
 */

const LOAN_MIN = 100_000;
const LOAN_MAX = 600_000;
const LOAN_STEP = 10_000;
const LOAN_DEFAULT = 400_000;

const RENT_MIN = 500;
const RENT_MAX = 6_000;
const RENT_STEP = 50;
const RENT_DEMO_START = 2_000; // tips left on mount
const RENT_DEMO_END = 4_200; // tips right after demo

// Max tilt in degrees. Tuned so a ±$2K/mo swing uses most of the range
// without ever running the cups off the frame.
const MAX_TILT_DEG = 14;
const TILT_SCALE = 2_500; // $ at which we hit max tilt

export function BreakevenTeeter() {
  const prefersReduced = useReducedMotion() ?? false;

  const loanMv = useMotionValue(LOAN_DEFAULT);
  const rentMv = useMotionValue(RENT_DEMO_START);

  const [loan, setLoan] = useState(LOAN_DEFAULT);
  const [rent, setRent] = useState(RENT_DEMO_START);
  const [interacted, setInteracted] = useState(false);

  const loanSliderRef = useRef<HTMLInputElement>(null);
  const rentSliderRef = useRef<HTMLInputElement>(null);
  const flowRef = useRef<HTMLSpanElement>(null);

  // The tilt angle is derived from both motion values via a custom subscriber
  // so the beam can rotate on every frame without React re-renders. We store
  // the angle in its own motion value to feed Framer's `rotate`.
  const tiltMv = useMotionValue(0);
  const rotate = useTransform(tiltMv, (t) => `${t}deg`);

  // Recompute tilt + paint the cashflow text whenever either MV changes.
  const recompute = () => {
    const l = loanMv.get();
    const r = rentMv.get();
    const cf = teeterCashFlow(l, r);

    // Clamp tilt to ±MAX_TILT_DEG. Positive cf → tilt right (negative deg
    // in CSS since we rotate around the center pivot with right side going
    // DOWN when positive). Convention: negative deg = right cup drops.
    const clamped = Math.max(-1, Math.min(1, cf / TILT_SCALE));
    const deg = -clamped * MAX_TILT_DEG;
    tiltMv.set(deg);

    if (flowRef.current) {
      flowRef.current.textContent = formatCashFlow(cf);
      flowRef.current.className = cashFlowClass(cf);
    }
  };

  useMotionValueEvent(loanMv, 'change', recompute);
  useMotionValueEvent(rentMv, 'change', recompute);

  // Paint initial numbers + auto-demo on mount.
  useEffect(() => {
    recompute();
    if (prefersReduced) return;

    // Auto-demo: ramp the rent slider from a losing $2K to a winning $4,200
    // over 2s with a short pause at the start so the user's eye catches it.
    const ctrl = animate(rentMv, RENT_DEMO_END, {
      duration: 2.0,
      delay: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => {
        if (rentSliderRef.current) {
          rentSliderRef.current.value = String(Math.round(v));
          rentSliderRef.current.style.setProperty(
            '--range-progress',
            `${((v - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100}%`
          );
        }
      },
      onComplete: () => setRent(RENT_DEMO_END),
    });
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  function handleLoan(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    loanMv.set(n);
    setLoan(n);
    setInteracted(true);
    e.target.style.setProperty(
      '--range-progress',
      `${((n - LOAN_MIN) / (LOAN_MAX - LOAN_MIN)) * 100}%`
    );
  }

  function handleRent(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    rentMv.set(n);
    setRent(n);
    setInteracted(true);
    e.target.style.setProperty(
      '--range-progress',
      `${((n - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100}%`
    );
  }

  const loanProgress = ((loan - LOAN_MIN) / (LOAN_MAX - LOAN_MIN)) * 100;
  const rentProgress = ((rent - RENT_MIN) / (RENT_MAX - RENT_MIN)) * 100;

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* The teeter scene — fixed-height canvas so rotation doesn't shift
          surrounding layout. Pivot is the triangle fulcrum at the bottom. */}
      <div className="relative mx-auto h-48 w-full sm:h-56 md:h-64">
        {/* Beam wrapper — rotates around its center-bottom (the fulcrum tip) */}
        <motion.div
          style={{
            rotate,
            transformOrigin: '50% 100%',
          }}
          className="absolute inset-x-0 bottom-8 mx-auto flex h-0 items-end justify-between"
        >
          {/* LEFT cup — the loan (mortgage) */}
          <div className="relative flex -translate-y-2 flex-col items-center">
            {/* Weight label floating above the cup */}
            <div className="mb-2 rounded-lg border border-red-accent/30 bg-white px-3 py-1 text-center shadow-md">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Mortgage
              </p>
              <p className="text-sm font-bold tabular-nums text-red-accent sm:text-base">
                {formatUsd(loan)}
              </p>
            </div>
            {/* Cup visual — a red bowl */}
            <div
              className="h-6 w-20 rounded-b-full border-2 border-red-accent/60 bg-red-accent/10 sm:h-7 sm:w-24"
              aria-hidden="true"
            />
          </div>

          {/* BEAM — a gold bar across the middle, absolutely drawn behind the cups */}
          <div
            className="absolute left-0 right-0 top-0 -z-10 h-3 rounded-full bg-gradient-to-r from-gold via-gold to-gold shadow-md sm:h-4"
            aria-hidden="true"
          />

          {/* RIGHT cup — the rent (tenant check) */}
          <div className="relative flex -translate-y-2 flex-col items-center">
            <div className="mb-2 rounded-lg border border-success/40 bg-white px-3 py-1 text-center shadow-md">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Monthly rent
              </p>
              <p className="text-sm font-bold tabular-nums text-success sm:text-base">
                {formatUsd(rent)}
              </p>
            </div>
            <div
              className="h-6 w-20 rounded-b-full border-2 border-success/60 bg-success/10 sm:h-7 sm:w-24"
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* FULCRUM — a navy triangle pinned to the center baseline */}
        <div
          className="absolute inset-x-0 bottom-0 flex justify-center"
          aria-hidden="true"
        >
          <div
            className="h-8 w-16"
            style={{
              background: 'var(--color-navy)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          />
        </div>

        {/* Ground line under the fulcrum */}
        <div
          className="absolute inset-x-6 bottom-0 h-0.5 bg-navy/20"
          aria-hidden="true"
        />
      </div>

      {/* LIVE cashflow readout — giant, color-coded */}
      <div
        className="mt-6 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Monthly cash flow (Anthony&rsquo;s napkin math)
        </p>
        <p className="mt-2 text-4xl font-extrabold tabular-nums md:text-5xl">
          <span ref={flowRef} className={cashFlowClass(teeterCashFlow(loan, rent))}>
            {formatCashFlow(teeterCashFlow(loan, rent))}
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          rent &minus; (loan &divide; 100) &mdash; the rule-of-thumb PITI
        </p>
      </div>

      {/* Sliders — two stacked on mobile, side-by-side on desktop */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <label
            htmlFor="teeter-loan"
            className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            <span>Drag the loan</span>
            <span className="tabular-nums text-red-accent">{formatUsd(loan)}</span>
          </label>
          <input
            ref={loanSliderRef}
            id="teeter-loan"
            type="range"
            min={LOAN_MIN}
            max={LOAN_MAX}
            step={LOAN_STEP}
            value={loan}
            onChange={handleLoan}
            aria-label="Loan amount"
            className="cash-slider mt-3 w-full"
            style={{
              ['--range-progress' as string]: `${loanProgress}%`,
            }}
          />
          <div className="mt-2 flex justify-between text-[10px] text-gray-400 tabular-nums">
            <span>{formatUsd(LOAN_MIN)}</span>
            <span>{formatUsd(LOAN_MAX)}</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="teeter-rent"
            className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            <span>Drag the rent</span>
            <span className="tabular-nums text-success">{formatUsd(rent)}</span>
          </label>
          <input
            ref={rentSliderRef}
            id="teeter-rent"
            type="range"
            min={RENT_MIN}
            max={RENT_MAX}
            step={RENT_STEP}
            defaultValue={RENT_DEMO_START}
            onChange={handleRent}
            aria-label="Monthly rent"
            className="cash-slider mt-3 w-full"
            style={{
              ['--range-progress' as string]: `${rentProgress}%`,
            }}
          />
          <div className="mt-2 flex justify-between text-[10px] text-gray-400 tabular-nums">
            <span>{formatUsd(RENT_MIN)}</span>
            <span>{formatUsd(RENT_MAX)}</span>
          </div>
        </div>
      </div>

      {/* "Try it" hint — fades after first interaction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: interacted ? 0 : 1 }}
        transition={{ duration: 0.4, delay: interacted ? 0 : 2.8 }}
        className="pointer-events-none mt-4 text-center text-xs italic text-gold"
        aria-hidden="true"
      >
        ← drag either slider to tip the teeter →
      </motion.p>
    </div>
  );
}

function formatUsd(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

function formatCashFlow(cf: number): string {
  const abs = Math.abs(cf);
  const formatted = `$${abs.toLocaleString('en-US')}`;
  if (cf > 0) return `+${formatted}/mo`;
  if (cf < 0) return `\u2212${formatted}/mo`;
  return `$0/mo`;
}

function cashFlowClass(cf: number): string {
  if (cf > 0) return 'text-success';
  if (cf < 0) return 'text-red-accent';
  return 'text-navy';
}
