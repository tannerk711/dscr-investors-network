import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, useReducedMotion } from 'framer-motion';
import { formSteps } from '@content/index';
import {
  cashCardActions,
  cashCardStore,
  selectFinalResult,
} from '../store/cashCardStore';
import { usePartialLead } from '../usePartialLead';
import { useCountUp } from '../useCountUp';

/**
 * Step 6 — The Cash Card reveal.
 *
 * Wave-4 upgrade (Item #2): 3-part dramatic reveal.
 *
 *   Phase A — DRUMROLL (0 → 1800ms):
 *     Card mounts with a gold shimmer skeleton + "calculating…" micro-text.
 *     The real numbers are hidden behind the skeleton. This is the "pause
 *     before the magic" — users feel the work happening.
 *
 *   Phase B — DIGIT MORPH (1800 → 2400ms):
 *     Skeleton fades. The cash-at-close midpoint runs through DigitMorph
 *     right-to-left with 60ms stagger per digit + 2px overshoot bounce.
 *     400ms later, the cash-flow number morphs left-to-right.
 *
 *   Phase C — TIMELINE DRAW (2400 → 3000ms):
 *     An SVG "15 business days" timeline line draws on via stroke-dasharray
 *     over 600ms. Once settled, the CTA is interactive.
 *
 * Total choreography: ~3.0s. Reduced-motion short-circuits every piece —
 * skeleton is skipped, numbers render instantly, timeline draws in one frame.
 *
 * The CTA is "Lock My Cash Card", not "submit" or "get quote". The
 * reveal MUST appear BEFORE the contact step (master-build-plan §5).
 */
export function Step6CashCardReveal() {
  const state = useStore(cashCardStore);
  const { reveal } = formSteps;
  const result = selectFinalResult(state);
  const prefersReduced = useReducedMotion() ?? false;

  // W3-J: Fire a partial-lead event if the user sits on the reveal for
  // 60 seconds without advancing to contact. Exactly-once per session.
  usePartialLead();

  // Drumroll / reveal state machine.
  const DRUMROLL_MS = prefersReduced ? 0 : 1200;
  const COUNTUP_DURATION = prefersReduced ? 0 : 1100;
  const CASH_DELAY = prefersReduced ? 0 : DRUMROLL_MS;
  const FLOW_DELAY = prefersReduced ? 0 : DRUMROLL_MS + 400;
  const TIMELINE_DELAY = prefersReduced ? 0 : DRUMROLL_MS + 800;

  const [drumrollDone, setDrumrollDone] = useState(prefersReduced);
  const [pulseLocked, setPulseLocked] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setDrumrollDone(true);
      setPulseLocked(true);
      return;
    }
    const t1 = window.setTimeout(() => setDrumrollDone(true), DRUMROLL_MS);
    const t2 = window.setTimeout(() => setPulseLocked(true), DRUMROLL_MS + 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [prefersReduced, DRUMROLL_MS]);

  // Defensive — should not happen because the form router only reaches
  // this step after Q5 is answered. But if it does, route back to Q5.
  if (!result) {
    return (
      <div className="text-center">
        <p className="text-base text-gray-500">
          Missing some answers — let's pick that up.
        </p>
        <button
          type="button"
          onClick={() => cashCardActions.setStep('q5', 'back')}
          className="mt-6 rounded-xl bg-navy px-6 py-3 text-base font-bold text-white hover:bg-ink"
        >
          Go back
        </button>
      </div>
    );
  }

  // Cash at close is displayed as the MIDPOINT of the engine range
  // (rounded to nearest $1K) — the two-number slot-machine range from
  // the Wave-3 pass was swapped for a single headline number in the
  // digit-morph design so the drum fall lands crisply.
  const cashMid = Math.max(
    0,
    Math.round((result.cashLow + result.cashHigh) / 2000) * 1000
  );
  const cashFlowTarget = Math.round(result.monthlyCashFlow / 10) * 10;
  const flowAbs = Math.abs(cashFlowTarget);
  const flowSign = cashFlowTarget < 0 ? '-' : '';

  // Tween the display numbers from 0 → target with an ease-out expo curve.
  // Replaces the DigitMorph per-digit reel — that had a layout bug on some
  // clients where the reel container rendered its leading digits invisibly,
  // so the reveal card showed "$   ,000" instead of "$85,000".
  const cashDisplay = useCountUp(cashMid, {
    duration: COUNTUP_DURATION,
    delay: CASH_DELAY,
    skip: prefersReduced,
  });
  const flowDisplay = useCountUp(flowAbs, {
    duration: COUNTUP_DURATION,
    delay: FLOW_DELAY,
    skip: prefersReduced,
  });

  const tightFlow = result.edgeCases.includes('TIGHT_OR_NEGATIVE_CASH_FLOW');
  const lowCashOut = result.edgeCases.includes('LOW_CASH_OUT_UNDER_10K');
  const noCashOut = result.edgeCases.includes('NEGATIVE_OR_ZERO_CASH_OUT');

  function handleLockIn() {
    cashCardActions.next();
  }

  const cardInitial = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, y: 8 };
  const cardAnimate = prefersReduced
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };
  const cardTransition = prefersReduced
    ? { duration: 0.2, ease: 'linear' as const }
    : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReduced ? 0.2 : 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-navy">
        Your Cash Card
      </p>
      <h2 className="mt-2 text-3xl font-extrabold leading-tight text-ink md:text-4xl">
        {reveal.headline}
      </h2>

      <motion.div
        initial={cardInitial}
        animate={cardAnimate}
        transition={cardTransition}
        className={`cash-card mx-auto mt-8 w-full max-w-md rounded-2xl border-2 bg-gradient-to-br from-white to-off-white p-6 shadow-xl md:p-8 ${
          pulseLocked ? 'cash-card--pulse border-gold' : 'border-navy'
        }`}
      >
        {/* ========================================================
              CASH AT CLOSE
            ======================================================== */}
        <div className="relative">
          {!drumrollDone && !prefersReduced ? (
            <SkeletonNumber size="lg" />
          ) : noCashOut ? (
            <p className="text-5xl font-extrabold tracking-tight text-navy tabular-nums md:text-6xl">
              —
            </p>
          ) : (
            <p
              className="text-5xl font-extrabold tracking-tight text-navy tabular-nums md:text-6xl"
              aria-label={`Cash at close: $${cashMid.toLocaleString('en-US')}`}
            >
              ${Math.round(cashDisplay).toLocaleString('en-US')}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-gray-500">
            {!drumrollDone && !prefersReduced
              ? 'calculating…'
              : noCashOut
                ? 'No cash to pull at this LTV — talk to your LO about options'
                : lowCashOut
                  ? 'Modest cash-out — your LO can talk timing'
                  : reveal.cashLineLabel}
          </p>
        </div>

        <div className="my-6 h-px w-full bg-gray-200" />

        {/* ========================================================
              CASH FLOW
            ======================================================== */}
        <div>
          {!drumrollDone && !prefersReduced ? (
            <SkeletonNumber size="md" />
          ) : (
            <p
              className={`text-3xl font-extrabold tracking-tight tabular-nums md:text-4xl ${
                tightFlow ? 'text-red-accent' : 'text-success'
              }`}
              aria-label={`Monthly cash flow: ${flowSign}$${flowAbs.toLocaleString(
                'en-US'
              )} per month`}
            >
              {flowSign}${Math.round(flowDisplay).toLocaleString('en-US')}/mo
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-gray-500">
            {!drumrollDone && !prefersReduced
              ? ' '
              : tightFlow
                ? 'Tight cash flow — your LO can run interest-only options'
                : reveal.cashFlowLineLabel}
          </p>
        </div>

        <div className="my-6 h-px w-full bg-gray-200" />

        {/* ========================================================
              TIMELINE — SVG draw-on
            ======================================================== */}
        <div>
          <TimelineDraw
            label={reveal.timelineLine}
            delayMs={TIMELINE_DELAY}
            prefersReduced={prefersReduced}
          />
        </div>

        <p className="mt-6 text-[11px] italic leading-snug text-gray-500">
          * {reveal.asterisk}
        </p>
      </motion.div>

      <button
        type="button"
        onClick={handleLockIn}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-accent px-8 py-4 text-base font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:max-w-md"
      >
        <span>{reveal.ctaLabel}</span>
        <span aria-hidden="true">→</span>
      </button>
    </motion.div>
  );
}

/* ==============================================================
     SkeletonNumber — drumroll shimmer block while calculating.
   ============================================================== */
function SkeletonNumber({ size }: { size: 'lg' | 'md' }) {
  const height = size === 'lg' ? 'h-14 md:h-16' : 'h-10 md:h-12';
  const width = size === 'lg' ? 'w-60 md:w-72' : 'w-40 md:w-48';
  return (
    <div
      className={`drumroll-shimmer mx-auto ${height} ${width} rounded-lg bg-gray-100`}
      aria-hidden="true"
    />
  );
}

/* ==============================================================
     TimelineDraw — SVG stroke-dasharray draw-on for the timeline line.
   ============================================================== */
function TimelineDraw({
  label,
  delayMs,
  prefersReduced,
}: {
  label: string;
  delayMs: number;
  prefersReduced: boolean;
}) {
  const [visible, setVisible] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs, prefersReduced]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 260 12"
        className="h-3 w-full max-w-xs"
        fill="none"
        aria-hidden="true"
      >
        <motion.line
          x1="4"
          y1="6"
          x2="256"
          y2="6"
          stroke="#B8922A"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: prefersReduced ? 1 : 0 }}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.6, ease: 'easeOut' }}
        />
        <motion.circle
          cx="4"
          cy="6"
          r="4"
          fill="#B8922A"
          initial={{ opacity: prefersReduced ? 1 : 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2, delay: prefersReduced ? 0 : 0.1 }}
        />
        <motion.circle
          cx="256"
          cy="6"
          r="4"
          fill="#B8922A"
          initial={{ opacity: prefersReduced ? 1 : 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2, delay: prefersReduced ? 0 : 0.6 }}
        />
      </svg>
      <motion.p
        className="text-base font-bold text-ink"
        initial={{ opacity: prefersReduced ? 1 : 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3, delay: prefersReduced ? 0 : 0.3 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
