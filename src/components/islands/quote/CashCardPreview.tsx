import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cashCardStore, selectPreviewResult } from './store/cashCardStore';
import { formatUsdKRange, formatUsdK, formatMonthly } from './format';

/**
 * Sticky live preview bar at the top of the form.
 *
 * Activation rules (master-build-plan §5):
 *   - Hidden until the user has answered Q2 (property value).
 *   - Shows "Calculating your Cash Card..." after Q2 with no balance/rent yet.
 *   - After Q3 (balance) and before Q4 (rent), shows a SOFT line:
 *       "Cash at close: ~$XXK (estimate sharpens with rent)"
 *     — never a final number, never a range, until Q4 pins rent.
 *   - After Q4 (rent), the bar flashes the "$1K/mo rent per $100K
 *     loan = breakeven" rule of thumb for 3 seconds, then fades out.
 *     Master plan §3A's teachable moment migrated INTO the form so the
 *     user sees it while staring at their OWN numbers.
 *   - On Q5 (FICO) the bar shows the FINAL number, not the preview default.
 *
 * The bar is intentionally hidden once the reveal screen is active —
 * the reveal IS the preview at full size, no need to double-render.
 */
export function CashCardPreview() {
  const state = useStore(cashCardStore);
  const prefersReduced = useReducedMotion() ?? false;

  const showBar =
    state.step !== 'state' &&
    state.step !== 'q1' &&
    state.step !== 'q2' &&
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

  if (!showBar) return null;

  const result = selectPreviewResult(state);
  const hasFico = state.ficoBracket !== null;

  // Preview copy logic — softened per the master plan:
  //
  //   step=q3 (just set property value, no balance yet) → "Calculating…"
  //   step=q4 (balance known, rent not yet)             → "~$XXK (estimate sharpens with rent)"
  //   step=q5 (rent known, no FICO)                     → "Cash at close: $XXK-$XXK • cash flow sharpens with FICO"
  //   step=q5 (FICO chosen before reveal nav)           → final line
  //
  // "~" prefix on the pre-rent number communicates roughness. A final
  // locked number at this stage would lie to the user because the LTV
  // cap and fee haircut haven't been applied against the real rent yet.
  let cashLine = 'Calculating your Cash Card…';
  let flowLine = '';

  if (result && result.hardKickout === null) {
    if (result.grossCashOut <= 0) {
      cashLine = 'No cash to pull at this LTV';
    } else if (!hasRent) {
      // Step q4 is about to ask for rent. Use the cash MIDPOINT with a ~
      // so we don't lock a range before the rent moves the PITI math.
      const midCash = (result.cashLow + result.cashHigh) / 2;
      cashLine = `Cash at close: ~${formatUsdK(midCash)} (estimate sharpens with rent)`;
    } else {
      cashLine = `Cash at close: ${formatUsdKRange(result.cashLow, result.cashHigh)}`;
    }
    if (hasRent) {
      flowLine = hasFico
        ? `Cash flow: ${formatMonthly(result.monthlyCashFlow)} • 15 business days`
        : `Cash flow: ~${formatMonthly(result.monthlyCashFlow)} (sharpens with FICO)`;
    }
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
