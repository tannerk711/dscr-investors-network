import { useState } from 'react';
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
 * Re-displays the locked Cash Card so the user can screenshot it, plus
 * a download button that generates a PDF on demand. The PDF generator
 * is dynamically imported on click — @react-pdf/renderer is large, and
 * we don't want to ship it on initial form mount.
 */
export function SuccessScreen() {
  const state = useStore(cashCardStore);
  const result = selectFinalResult(state);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const cashLow = result ? Math.max(0, Math.round(result.cashLow)) : 0;
  const cashHigh = result ? Math.max(0, Math.round(result.cashHigh)) : 0;
  const monthlyCashFlow = result ? Math.round(result.monthlyCashFlow) : 0;

  async function handleDownload() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      // Dynamic import of the entire PDF module so neither @react-pdf/renderer
      // nor the document component land in the form's initial JS bundle.
      const [{ pdf }, { CashCardPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../CashCardPdf'),
      ]);
      const blob = await pdf(
        <CashCardPdfDocument
          data={{
            firstName: state.firstName || 'Investor',
            cashLow,
            cashHigh,
            monthlyCashFlow,
            generatedAt: state.submittedAt ?? new Date().toISOString(),
          }}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dscr-cash-out-estimate.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("Couldn't generate the PDF. Try again or check your email.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="text-center">
      {/* Animated check */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
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
        {thankYou.headline}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
        {thankYou.subheadline}
      </p>

      {/* Re-display the locked Cash Card */}
      {result && result.hardKickout === null && (
        <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border-2 border-navy bg-gradient-to-br from-white to-off-white p-6 shadow-xl md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-navy">
            Your Estimate
          </p>
          <p className="mb-2 text-lg font-bold tracking-wide text-success md:text-xl">
            Up to
          </p>
          <p className="text-4xl font-extrabold tabular-nums text-navy md:text-5xl">
            {formatUsd(cashLow)}
            <span className="text-xl text-gray-400"> – </span>
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
            ~20 business days from yes to wired
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-navy bg-white px-6 py-3 text-sm font-bold text-navy shadow-sm transition-all duration-200 hover:bg-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:opacity-60"
        >
          {pdfLoading ? 'Building PDF…' : 'Download My Estimate (PDF)'}
        </button>
        {pdfError && (
          <p role="alert" className="text-xs text-red-accent">
            {pdfError}
          </p>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-500">{thankYou.fallbackContactLine}</p>
    </div>
  );
}
