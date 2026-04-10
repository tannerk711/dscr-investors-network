/**
 * Display formatters for the Cash Card form. Centralized so the
 * sticky preview bar, the reveal screen, and the PDF all speak the
 * same language.
 */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  return usd.format(Math.round(n));
}

/** "$78K" style — used in tight spots like the sticky preview bar */
export function formatUsdK(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  const k = Math.round(n / 1000);
  return `$${k.toLocaleString('en-US')}K`;
}

/** "$78K – $92K" range */
export function formatUsdKRange(low: number, high: number): string {
  return `${formatUsdK(low)} – ${formatUsdK(high)}`;
}

/** "$78,000 – $92,000" range used on the reveal screen */
export function formatUsdRange(low: number, high: number): string {
  return `${formatUsd(low)} – ${formatUsd(high)}`;
}

/** "$980/mo" — round to nearest $10 to match the "directional" framing */
export function formatMonthly(n: number): string {
  if (!Number.isFinite(n)) return '$0/mo';
  const rounded = Math.round(n / 10) * 10;
  return `${formatUsd(rounded)}/mo`;
}

export function formatMonthlyRange(low: number, high: number): string {
  return `${formatMonthly(low)} – ${formatMonthly(high)}`;
}
