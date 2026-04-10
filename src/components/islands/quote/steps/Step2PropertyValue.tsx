import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { CurrencySlider } from '../CurrencySlider';

/**
 * Q2: Property value. Slider $200K → $2M, default $400K, $25K snaps.
 *
 * The sticky preview bar activates after this step (master-build-plan §5).
 * Floor enforced at $200K — typing lower triggers the snap-back tooltip.
 */
export function Step2PropertyValue() {
  const state = useStore(cashCardStore);
  const { q2PropertyValue } = formSteps;

  const value = state.propertyValue ?? q2PropertyValue.default;

  function handleNext() {
    if (state.propertyValue === null) {
      cashCardActions.setPropertyValue(q2PropertyValue.default);
    }
    cashCardActions.next();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {q2PropertyValue.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Drag, or tap the number to type your own.
      </p>

      <div className="mt-8">
        <CurrencySlider
          value={value}
          onChange={(n) => cashCardActions.setPropertyValue(n)}
          min={q2PropertyValue.min}
          max={q2PropertyValue.max}
          step={q2PropertyValue.step}
          enforcedMin={q2PropertyValue.min}
          minTooltip={q2PropertyValue.minTooltip}
          ariaLabel="Property value"
          helperHint={q2PropertyValue.helperHint}
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
