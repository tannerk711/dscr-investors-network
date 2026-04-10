import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { CurrencySlider } from '../CurrencySlider';

/**
 * Q3: Current loan balance. Slider $0 → propertyValue (Q2 cap), $10K snaps.
 *
 * If user owns it free and clear, dragging to $0 triggers the "Own it free
 * and clear?" copy. The slider max is dynamic — bound to whatever Q2 set.
 */
export function Step3LoanBalance() {
  const state = useStore(cashCardStore);
  const { q3LoanBalance } = formSteps;

  const propertyValue = state.propertyValue ?? 0;
  // Default to a sane fraction (50%) of property value if user hasn't set
  // a balance yet — feels less alarming than starting at $0 or at the cap.
  const defaultBalance = Math.min(
    q3LoanBalance.default,
    Math.round(propertyValue * 0.5)
  );
  const value = state.currentBalance ?? defaultBalance;

  function handleNext() {
    if (state.currentBalance === null) {
      cashCardActions.setCurrentBalance(defaultBalance);
    }
    cashCardActions.next();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {q3LoanBalance.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Approximate is fine. Your loan officer will pull the exact payoff.
      </p>

      <div className="mt-8">
        <CurrencySlider
          value={value}
          onChange={(n) => cashCardActions.setCurrentBalance(n)}
          min={0}
          max={Math.max(propertyValue, 10000)}
          step={q3LoanBalance.step}
          ariaLabel="Current loan balance"
          freeAndClearCopy={q3LoanBalance.freeAndClearCopy}
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="mt-10 w-full rounded-xl bg-navy px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-ink hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        Next →
      </button>
    </div>
  );
}
