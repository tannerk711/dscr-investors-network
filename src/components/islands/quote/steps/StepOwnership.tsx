import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';

/**
 * Ownership gate — sits between the state gate and the property-value
 * questions. A cash-out refinance pulls equity from a rental the user
 * ALREADY owns, so anyone who doesn't own (aspiring buyers, primary-
 * residence seekers) is filtered out here BEFORE they invest effort in the
 * calculator. This is the single highest-leverage lead-quality change:
 * Facebook's "real estate investing" audience leaks owner-occupant and
 * aspiring-first-timer intent, and those people are the bulk of the dead
 * leads. Non-owners hit a hard kick-out (see StepKickout) with no capture.
 *
 * It also doubles as a diagnostic: the share of users who answer "No" here
 * quantifies exactly how much owner-occupant leakage the channel produces.
 */
export function StepOwnership() {
  const state = useStore(cashCardStore);
  const { ownership } = formSteps;

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {ownership.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">{ownership.subcopy}</p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => cashCardActions.setOwnership(true)}
          className={`flex flex-col items-start rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
            state.ownsProperty === true
              ? 'border-navy bg-navy text-white shadow-md'
              : 'border-gray-200 bg-white text-ink hover:border-navy hover:shadow-sm'
          }`}
        >
          <span className="text-base font-bold leading-tight">
            {ownership.ownLabel}
          </span>
          <span
            className={`mt-0.5 text-sm ${
              state.ownsProperty === true ? 'text-white/80' : 'text-gray-500'
            }`}
          >
            {ownership.ownSublabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => cashCardActions.setOwnership(false)}
          className="flex flex-col items-start rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-left text-ink transition-all duration-200 hover:border-navy hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <span className="text-base font-bold leading-tight">
            {ownership.dontOwnLabel}
          </span>
          <span className="mt-0.5 text-sm text-gray-500">
            {ownership.dontOwnSublabel}
          </span>
        </button>
      </div>
    </div>
  );
}
