/**
 * pricing.ts — shared rule-of-thumb math for UI widgets that don't have
 * all form answers yet (breakeven teeter). The canonical source of truth
 * is still `@lib/cash-engine/calculateCash`; this file just offers a
 * convenience wrapper so marketing-side components don't reach into the
 * engine internals.
 */

/**
 * Breakeven teeter math — no fees, pure rule-of-thumb:
 *   monthlyCashFlow = rent - (loan / 100)
 * Positive → green tilt right, negative → red tilt left.
 */
export function teeterCashFlow(loanAmount: number, monthlyRent: number): number {
  const piti = loanAmount / 100;
  return Math.round(monthlyRent - piti);
}

