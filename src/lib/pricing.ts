/**
 * pricing.ts — small shared façade over the cash-engine for UI widgets
 * that don't have all four form answers yet (hero scrubber, rule-of-thumb
 * teeter, sticky preview). The canonical source of truth is still
 * `@lib/cash-engine/calculateCash`; this file just offers convenience
 * wrappers with sensible defaults so marketing-side components don't
 * have to reach into the engine internals.
 */
import { calculateCash } from './cash-engine/calculateCash';
import type { CashCardResult } from './cash-engine/types';

/**
 * Hero equity scrubber assumptions:
 *   - FICO 720 (mid-bracket) → 75% LTV cap
 *   - Free & clear (no existing balance) — max demo upside
 *   - Rent assumed at 80% of breakeven (`value * 0.75 / 100 * 0.80`) so
 *     cash flow reads as a modest positive across the slider's range
 *   - Anthony's $1K/$100K rule is baked into the PITI assumption
 *
 * Returns rounded values suitable for display (nearest $100 / nearest $10).
 */
export function heroScrubberQuote(propertyValue: number): {
  cashAtClose: number;
  monthlyCashFlow: number;
} {
  // Use the real cash engine so the hero math stays consistent with the
  // reveal. We fake a free-and-clear property and an 80% rent cover.
  const newLoan = propertyValue * 0.75;
  const piti = (newLoan / 100000) * 1000;
  const rent = Math.round(piti * 1.2); // 120% of PITI → ~$1K/mo positive

  const res: CashCardResult = calculateCash({
    state: '',
    propertyType: 'sfr',
    propertyValue,
    currentBalance: 0,
    monthlyRent: rent,
    ficoBracket: '700-739',
  });

  const cashMid = (res.cashLow + res.cashHigh) / 2;
  return {
    cashAtClose: Math.max(0, Math.round(cashMid / 100) * 100),
    monthlyCashFlow: Math.max(0, Math.round(res.monthlyCashFlow / 10) * 10),
  };
}

/**
 * Breakeven teeter math — no fees, pure rule-of-thumb:
 *   monthlyCashFlow = rent - (loan / 100)
 * Positive → green tilt right, negative → red tilt left.
 */
export function teeterCashFlow(loanAmount: number, monthlyRent: number): number {
  const piti = loanAmount / 100;
  return Math.round(monthlyRent - piti);
}

/**
 * Simplified ballpark used by the sticky preview when we don't yet have
 * rent or FICO — matches the live-preview formula in CashCardPreview
 * (`value * 0.75 - balance`). Centralized here so the hero, the preview,
 * and any future surface share the same number.
 */
export function simpleBallpark(
  propertyValue: number,
  currentBalance: number
): number {
  if (propertyValue <= 0) return 0;
  return Math.max(0, Math.round(propertyValue * 0.75 - currentBalance));
}
