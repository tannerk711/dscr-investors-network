import { useStore } from '@nanostores/react';
import { thankYou } from '@content/index';
import {
  cashCardStore,
  selectFinalResult,
} from '../store/cashCardStore';
import { formatUsd, formatMonthly } from '../format';

/**
 * Success / thank-you screen.
 *
 * Leads with the company logo + a personal "{firstName}, great to meet you!"
 * Re-displays the locked Cash Card (range, matching the reveal card exactly),
 * then social proof. No time promise is made here on purpose: the team
 * reaches out "shortly"; the speed-to-lead cadence lives in the
 * Zapier/Salesforce flow, not in copy.
 */
export function SuccessScreen() {
  const state = useStore(cashCardStore);
  const result = selectFinalResult(state);

  // Match the reveal card exactly: range rounded to the nearest $1K.
  const cashLow = result ? Math.max(0, Math.round(result.cashLow / 1000) * 1000) : 0;
  const cashHigh = result ? Math.max(0, Math.round(result.cashHigh / 1000) * 1000) : 0;
  const monthlyCashFlow = result ? Math.round(result.monthlyCashFlow / 10) * 10 : 0;
  const firstName = state.firstName?.trim() || 'there';

  return (
    <div className="text-center">
      {/* Company logo */}
      <img
        src={thankYou.logoUrl}
        alt="DSCR Investors Network"
        className="mx-auto h-10 w-auto sm:h-12"
      />

      {/* Animated check */}
      <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-success"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="mt-6 text-3xl font-extrabold leading-tight text-ink md:text-4xl">
        {firstName}, great to meet you!
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
        {thankYou.subheadline}
      </p>

      {/* Re-display the locked Cash Card — matches the reveal card exactly */}
      {result && result.hardKickout === null && (
        <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border-2 border-navy bg-gradient-to-br from-white to-off-white p-6 shadow-xl md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-navy">
            Your Estimate
          </p>
          <p className="mt-2 text-4xl font-extrabold tabular-nums text-navy md:text-5xl">
            {formatUsd(cashLow)}
            <span className="text-2xl text-gray-400"> – </span>
            {formatUsd(cashHigh)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            cash in your pocket at close
          </p>

          <div className="my-5 h-px w-full bg-gray-200" />

          <p className="text-2xl font-extrabold text-success md:text-3xl">
            {formatMonthly(monthlyCashFlow)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            new cash flow after the loan
          </p>

          <div className="my-5 h-px w-full bg-gray-200" />

          <p className="text-base font-bold text-ink">
            ~15 business days from yes to wired
          </p>
        </div>
      )}

      {/* Social proof */}
      <div className="mx-auto mt-12 w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Investors we've funded
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {thankYou.testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <img
                src={t.photoUrl}
                alt={t.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <blockquote className="mt-4 text-sm leading-relaxed text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold text-ink">
                {t.name}
              </figcaption>
              <div
                className="mt-2 text-gold"
                aria-label="5 out of 5 stars"
              >
                {'★★★★★'}
              </div>
            </figure>
          ))}
        </div>
      </div>

      <p className="mt-10 text-sm text-gray-500">{thankYou.fallbackContactLine}</p>
    </div>
  );
}
