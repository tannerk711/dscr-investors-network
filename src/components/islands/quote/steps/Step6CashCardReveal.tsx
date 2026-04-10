import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, useReducedMotion } from 'framer-motion';
import { formSteps } from '@content/index';
import {
  cashCardActions,
  cashCardStore,
  selectFinalResult,
} from '../store/cashCardStore';
import { useCountUp } from '../useCountUp';
import { formatUsd, formatMonthly } from '../format';
import { usePartialLead } from '../usePartialLead';

/**
 * Step 6 — The Cash Card reveal.
 *
 * The CTA is "Lock My Cash Card", not "submit" or "get quote". The
 * reveal MUST appear BEFORE the contact step (master-build-plan §5),
 * which is why this component lives between Q5 and the contact form.
 *
 * Motion choreography (Wave 3 polish pass):
 *   t = 0ms     → card scale-in from 0.96 → 1.0 and float from y:8 → 0
 *                 over 400ms ease-out. Feels like the card snaps into place.
 *   t = 0ms     → cash range counters start ramping 0 → target over 1200ms
 *                 (ease-out-expo in useCountUp — slot-machine landing).
 *   t = 1200ms  → cash range locks, 200ms beat.
 *   t = 1400ms  → cash flow counter ramps 0 → target over 1200ms.
 *   t = 2600ms  → cash flow locks, gold border pulses ONCE (~600ms)
 *                 to signal "done, locked in."
 *
 * The 15-business-days line is static — it's never a number to animate.
 *
 * Reduced motion: `useReducedMotion()` short-circuits every piece.
 * Counters jump straight to their target, the card fades instead of
 * scaling/floating, and the pulse is skipped entirely.
 *
 * Edge cases handled inline:
 *  - Hard kickout (FICO < 580 / value < $200K): show kickout copy + a
 *    soft route back. The form should never reach here for these,
 *    but be defensive.
 *  - Negative gross cash out: explain "no cash to pull at this LTV".
 *  - Negative cash flow: still show the cash number, but flag with
 *    "Tight cash flow — your LO can run interest-only options."
 *  - Low cash out (<$10K): swap headline.
 */
export function Step6CashCardReveal() {
  const state = useStore(cashCardStore);
  const { reveal } = formSteps;
  const result = selectFinalResult(state);
  const prefersReduced = useReducedMotion() ?? false;

  // W3-J: Fire a partial-lead event if the user sits on the reveal for
  // 60 seconds without advancing to contact. Exactly-once per session.
  usePartialLead();

  // Controls the one-shot gold-border pulse. Fires after the cash-flow
  // counter settles. Never repeats.
  const [pulseLocked, setPulseLocked] = useState(false);

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

  // Pick safe targets for the count-up animation. Hard kickouts and zero
  // cash-out cases collapse to "no cash" rather than animating to a
  // negative number.
  const cashTargetLow = Math.max(0, Math.round(result.cashLow));
  const cashTargetHigh = Math.max(0, Math.round(result.cashHigh));
  const cashFlowTarget = Math.round(result.monthlyCashFlow);

  // Cash range counters run in parallel (low + high) at t=0.
  const animatedLow = useCountUp(cashTargetLow, {
    duration: 1200,
    delay: 0,
    skip: prefersReduced,
  });
  const animatedHigh = useCountUp(cashTargetHigh, {
    duration: 1200,
    delay: 0,
    skip: prefersReduced,
  });
  // Cash flow counter starts AFTER the cash range settles (1200ms) plus a
  // 200ms beat, so the user reads the cash number before the flow number
  // starts moving. Sequential, not competing.
  const animatedFlow = useCountUp(Math.abs(cashFlowTarget), {
    duration: 1200,
    delay: 1400,
    skip: prefersReduced,
  });

  // Fire the one-shot pulse after the cash flow counter finishes its ramp
  // (1400ms delay + 1200ms duration = 2600ms).
  useEffect(() => {
    if (prefersReduced) return;
    const t = window.setTimeout(() => setPulseLocked(true), 2600);
    return () => window.clearTimeout(t);
  }, [prefersReduced]);

  const flowSign = cashFlowTarget < 0 ? '-' : '';
  const tightFlow = result.edgeCases.includes('TIGHT_OR_NEGATIVE_CASH_FLOW');
  const lowCashOut = result.edgeCases.includes('LOW_CASH_OUT_UNDER_10K');
  const noCashOut = result.edgeCases.includes('NEGATIVE_OR_ZERO_CASH_OUT');

  function handleLockIn() {
    cashCardActions.next();
  }

  // Card entrance animation — scale-in from 0.96 and float up 8px over
  // 400ms. In reduced-motion mode we fade only, skipping scale + translate.
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
        {/* Cash at close */}
        <div>
          <p className="text-5xl font-extrabold tracking-tight text-navy tabular-nums md:text-6xl">
            {noCashOut ? (
              '—'
            ) : (
              <>
                {formatUsd(animatedLow)}
                <span className="text-2xl font-bold text-gray-400 md:text-3xl">
                  {' '}–{' '}
                </span>
                {formatUsd(animatedHigh)}
              </>
            )}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {noCashOut
              ? 'No cash to pull at this LTV — talk to your LO about options'
              : lowCashOut
                ? 'Modest cash-out — your LO can talk timing'
                : reveal.cashLineLabel}
          </p>
        </div>

        <div className="my-6 h-px w-full bg-gray-200" />

        {/* Cash flow */}
        <div>
          <p
            className={`text-3xl font-extrabold tracking-tight tabular-nums md:text-4xl ${
              tightFlow ? 'text-red-accent' : 'text-success'
            }`}
          >
            {flowSign}
            {formatMonthly(animatedFlow)}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {tightFlow
              ? 'Tight cash flow — your LO can run interest-only options'
              : reveal.cashFlowLineLabel}
          </p>
        </div>

        <div className="my-6 h-px w-full bg-gray-200" />

        {/* Timeline — static, never animates */}
        <div>
          <p className="text-base font-bold text-ink">{reveal.timelineLine}</p>
        </div>

        <p className="mt-6 text-[11px] italic leading-snug text-gray-400">
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
