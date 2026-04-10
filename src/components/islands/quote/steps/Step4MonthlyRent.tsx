import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { CurrencySlider } from '../CurrencySlider';

/**
 * Q4: Monthly rent. $500 → $10,000, $100 snaps.
 *
 * If property type is STR (selected on Q1) the question swaps to
 * "trailing 12-month gross revenue" with a /12 hint. The store keeps
 * both fields separate so the user can switch back without losing data.
 */
export function Step4MonthlyRent() {
  const state = useStore(cashCardStore);
  const { q4MonthlyRent } = formSteps;
  const isStr = state.propertyType === 'str';

  // For STR mode use trailing12Revenue (range $6K → $120K), step $1K
  // The engine divides /12 and discounts to 95%, so user types annual.
  if (isStr) {
    const annualValue =
      state.trailing12Revenue ?? q4MonthlyRent.default * 12;

    function handleNext() {
      if (state.trailing12Revenue === null) {
        cashCardActions.setTrailing12Revenue(q4MonthlyRent.default * 12);
      }
      // Mirror an equivalent monthly value into monthlyRent for the
      // engine fallback path so non-STR consumers still see something.
      cashCardActions.setMonthlyRent(Math.round(annualValue / 12));
      cashCardActions.next();
    }

    return (
      <div>
        <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
          {q4MonthlyRent.strHeadline}
        </h2>
        <p className="mt-2 text-sm text-gray-500">{q4MonthlyRent.strHint}</p>

        <div className="mt-8">
          <CurrencySlider
            value={annualValue}
            onChange={(n) => {
              cashCardActions.setTrailing12Revenue(n);
              cashCardActions.setMonthlyRent(Math.round(n / 12));
            }}
            min={q4MonthlyRent.min * 12}
            max={q4MonthlyRent.max * 12}
            step={1000}
            ariaLabel="Trailing 12-month gross revenue"
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

  const value = state.monthlyRent ?? q4MonthlyRent.default;

  function handleNext() {
    if (state.monthlyRent === null) {
      cashCardActions.setMonthlyRent(q4MonthlyRent.default);
    }
    cashCardActions.next();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {q4MonthlyRent.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        What the property currently rents for, gross.
      </p>

      <div className="mt-8">
        <CurrencySlider
          value={value}
          onChange={(n) => cashCardActions.setMonthlyRent(n)}
          min={q4MonthlyRent.min}
          max={q4MonthlyRent.max}
          step={q4MonthlyRent.step}
          ariaLabel="Monthly rent"
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
