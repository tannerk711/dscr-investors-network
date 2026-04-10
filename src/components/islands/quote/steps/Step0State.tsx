import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';

/**
 * Pre-step state gate. Active target states + an "Other state" tile.
 *
 * Selecting an in-list state advances to Q1 immediately.
 * Selecting "Other" swaps the screen to a polite exit + email capture.
 *
 * `TODO_CLIENT` placeholder labels are hidden from the grid until the
 * real list is pinned — we don't want to show "TODO_CLIENT" to a real user.
 */
export function Step0State() {
  const state = useStore(cashCardStore);
  const { stateGate } = formSteps;
  const [otherMode, setOtherMode] = useState(false);
  const [exitEmail, setExitEmail] = useState('');
  const [exitSubmitted, setExitSubmitted] = useState(false);

  const realStates = stateGate.states.filter(
    (s) => !s.code.startsWith('TODO_CLIENT')
  );

  function handleSelectState(code: string) {
    cashCardActions.setState(code);
    cashCardActions.next();
  }

  function handleExitSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!exitEmail) return;
    // TODO W3-J: wire to a partial-lead endpoint for off-state email capture.
    // Right now the primary lead-fallback API requires a full LeadPayload, so
    // we acknowledge in the UI and the email is captured locally for now.
    setExitSubmitted(true);
  }

  if (otherMode) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
          {exitSubmitted ? "We'll be in touch." : 'Not your state — yet.'}
        </h2>
        <p className="mt-3 text-base text-gray-500">
          {exitSubmitted
            ? `As soon as we open your state, you'll be the first to know.`
            : stateGate.offStateExitCopy}
        </p>

        {!exitSubmitted && (
          <form onSubmit={handleExitSubmit} className="mt-8 flex flex-col gap-3">
            <label className="sr-only" htmlFor="off-state-email">
              Email
            </label>
            <input
              id="off-state-email"
              type="email"
              required
              autoComplete="email"
              value={exitEmail}
              onChange={(e) => setExitEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
            <button
              type="submit"
              className="rounded-xl bg-navy px-6 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              Notify Me When You Open My State
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setOtherMode(false);
            setExitSubmitted(false);
          }}
          className="mt-6 text-sm text-gray-500 underline hover:text-navy"
        >
          {state.state ? 'Pick a different state' : 'Back to state list'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {stateGate.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Tap your state to start.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {realStates.map((s) => {
          const selected = state.state === s.code;
          return (
            <button
              key={s.code}
              type="button"
              onClick={() => handleSelectState(s.code)}
              className={`flex flex-col items-center justify-center rounded-xl border-2 px-4 py-5 text-base font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                selected
                  ? 'border-navy bg-navy text-white shadow-md'
                  : 'border-gray-200 bg-white text-ink hover:border-navy hover:shadow-sm'
              }`}
            >
              <span className="text-xl">{s.code}</span>
              <span className="mt-1 text-xs font-medium opacity-80">
                {s.label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setOtherMode(true)}
          className="col-span-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-off-white px-4 py-5 text-sm font-medium text-gray-500 transition-all duration-200 hover:border-navy hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:col-span-1"
        >
          Other state
        </button>
      </div>
    </div>
  );
}
