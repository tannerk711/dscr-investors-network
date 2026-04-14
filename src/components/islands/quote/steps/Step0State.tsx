import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';

/**
 * Step: which state is the property in?
 *
 * Dropdown of the 10 funded states. No "Other" / off-state capture — the
 * Apr 13 pass decided to keep the form lean and let paid traffic handle
 * state targeting instead.
 */
export function Step0State() {
  const state = useStore(cashCardStore);
  const { stateGate } = formSteps;

  const realStates = stateGate.states.filter(
    (s) => !s.code.startsWith('TODO_CLIENT')
  );

  function handleChange(e: { target: { value: string } }) {
    const code = e.target.value;
    if (!code) return;
    cashCardActions.setState(code);
  }

  function handleContinue() {
    if (!state.state) return;
    cashCardActions.next();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {stateGate.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        We currently fund deals in 10 states.
      </p>

      <div className="mt-6">
        <label className="sr-only" htmlFor="state-select">
          State
        </label>
        <div className="relative">
          <select
            id="state-select"
            value={state.state ?? ''}
            onChange={handleChange}
            className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-4 pr-12 text-base font-semibold text-ink shadow-sm transition-colors hover:border-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
          >
            <option value="" disabled>
              Select a state…
            </option>
            {realStates.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!state.state}
        className="mt-6 w-full rounded-xl bg-navy px-6 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-ink disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        Continue
      </button>
    </div>
  );
}
