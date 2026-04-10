import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cashCardStore, selectPreviewResult } from './store/cashCardStore';
import { formatUsdK, formatMonthly } from './format';
import { useCountUp } from './useCountUp';

/**
 * Sticky live preview bar at the top of the form.
 *
 * Wave-4 update (Item #1): a LIVE RUNNING ballpark cash number tracks
 * the user in real time as they answer Q2 (property value) and Q3 (loan
 * balance), using the simplified ballpark formula
 *   ballpark = max(0, propertyValue * 0.75 - currentBalance)
 * and count-up easing via `useCountUp`. Once rent + FICO are set, the
 * number locks onto the real cash-engine `cashMid` value (same shape,
 * different source — so the transition is smooth).
 *
 * Activation rules (master-build-plan §5):
 *   - Hidden until the user has answered Q2 (property value).
 *   - Shows soft headline + live cash number the moment Q2 is set.
 *   - After Q4 (rent) fires a 3s teachable-moment flash of the rule of
 *     thumb, then fades.
 *   - Bar is hidden on reveal / contact / success — the reveal screen
 *     IS the preview at full size.
 */

/** Simplified ballpark — matches the live-preview assumption of 75% LTV
 *  at 720 FICO. The final reveal uses the real cash engine with fees.  */
function ballpark(propertyValue: number | null, balance: number | null): number {
  if (propertyValue === null || propertyValue <= 0) return 0;
  const bal = balance ?? 0;
  return Math.max(0, Math.round(propertyValue * 0.75 - bal));
}

export function CashCardPreview() {
  const state = useStore(cashCardStore);
  const prefersReduced = useReducedMotion() ?? false;

  const showBar =
    state.step !== 'state' &&
    state.step !== 'q1' &&
    state.step !== 'reveal' &&
    state.step !== 'contact' &&
    state.step !== 'success';

  // Rule-of-thumb flash — shows once after the user answers Q4 (monthly
  // rent), then fades. We gate on monthlyRent being non-null AND the user
  // having advanced past Q4 at least once. A ref guards against re-firing
  // on every store update (e.g. FICO tile selection).
  const [showRule, setShowRule] = useState(false);
  const firedRef = useRef(false);
  const hasRent = state.monthlyRent !== null;
  const pastQ4 = state.step === 'q5';

  useEffect(() => {
    if (firedRef.current) return;
    if (!hasRent || !pastQ4) return;
    firedRef.current = true;
    setShowRule(true);
    const t = window.setTimeout(() => setShowRule(false), 3000);
    return () => window.clearTimeout(t);
  }, [hasRent, pastQ4]);

  // Live ballpark target — the number the count-up hook tweens to.
  // While we have rent + FICO we pull the midpoint of the real cash-engine
  // range so the displayed number is consistent with what the reveal will
  // show. Otherwise we fall back to the simplified ballpark.
  const result = selectPreviewResult(state);
  const hasFico = state.ficoBracket !== null;

  let liveTarget = ballpark(state.propertyValue, state.currentBalance);
  let postRentBand = false;
  if (result && result.hardKickout === null && hasRent) {
    liveTarget = Math.max(
      0,
      Math.round((result.cashLow + result.cashHigh) / 2)
    );
    postRentBand = true;
  }
  const animatedCash = useCountUp(liveTarget, {
    duration: 600,
    delay: 0,
    skip: prefersReduced,
  });

  if (!showBar) return null;

  // Headline copy — keep the master-plan softening but swap in the LIVE number.
  //   q2 (property value being dragged): "Running ballpark: $XXK"
  //   q3 (balance being dragged):          same line, updated mid-drag
  //   q4 (rent being dragged):             "Cash at close: ~$XXK (sharpens with rent)"
  //   q5 (FICO):                            "Cash at close: $XXK-$XXK"
  let cashLine: string;
  if (state.step === 'q2') {
    cashLine = `Running ballpark: ${formatUsdK(animatedCash)}`;
  } else if (state.step === 'q3') {
    cashLine = `Running ballpark: ${formatUsdK(animatedCash)}`;
  } else if (state.step === 'q4') {
    cashLine = `Cash at close: ~${formatUsdK(animatedCash)} (sharpens with rent)`;
  } else {
    // q5 — we have rent; show soft range if no FICO, concrete if FICO set.
    if (result && result.hardKickout === null) {
      if (result.grossCashOut <= 0) {
        cashLine = 'No cash to pull at this LTV';
      } else if (hasFico) {
        cashLine = `Cash at close: ${formatUsdK(result.cashLow)} – ${formatUsdK(result.cashHigh)}`;
      } else {
        cashLine = `Cash at close: ~${formatUsdK(animatedCash)} (sharpens with FICO)`;
      }
    } else {
      cashLine = `Cash at close: ~${formatUsdK(animatedCash)}`;
    }
  }

  let flowLine = '';
  if (result && result.hardKickout === null && postRentBand) {
    flowLine = hasFico
      ? `Cash flow: ${formatMonthly(result.monthlyCashFlow)} • 15 business days`
      : `Cash flow: ~${formatMonthly(result.monthlyCashFlow)} (sharpens with FICO)`;
  }

  const barTransition = prefersReduced
    ? { duration: 0.15, ease: 'linear' as const }
    : { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const };

  return (
    <AnimatePresence>
      <motion.div
        key="preview-bar"
        initial={{ opacity: 0, y: prefersReduced ? 0 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReduced ? 0 : -20 }}
        transition={barTransition}
        className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 px-4 py-3 text-white shadow-lg backdrop-blur md:px-8"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold tracking-tight tabular-nums sm:text-base">
            {cashLine}
          </p>
          {flowLine && (
            <p className="text-xs text-gray-300 tabular-nums sm:text-sm">
              {flowLine}
            </p>
          )}
        </div>

        {/* Rule-of-thumb teachable flash — appears once, 3s, then fades.
            AnimatePresence handles enter/exit; the container is collapsed
            to 0 height when hidden so nothing jumps. */}
        <AnimatePresence>
          {showRule && (
            <motion.p
              key="rule-of-thumb"
              initial={{ opacity: 0, y: prefersReduced ? 0 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -4 }}
              transition={{
                duration: prefersReduced ? 0.15 : 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="mx-auto mt-1 max-w-3xl text-[11px] italic text-gold sm:text-xs"
            >
              Rule of thumb: $1K/mo rent per $100K loan = breakeven.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
