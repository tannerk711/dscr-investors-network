import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import type { PropertyType } from '@lib/cash-engine/types';

/**
 * Q1: Property type. 4 large tile cards (SFR / 2-4 unit / Condo / STR).
 *
 * "Other" link below opens a soft kick-out modal for modular / mobile /
 * 5+ acres / farmland — these properties don't qualify but we still
 * capture an email so the team can route them later when programs change.
 */
export function Step1PropertyType() {
  const state = useStore(cashCardStore);
  const { q1PropertyType } = formSteps;
  const [otherOpen, setOtherOpen] = useState(false);
  const [kickoutEmail, setKickoutEmail] = useState('');
  const [kickoutSubmitted, setKickoutSubmitted] = useState(false);

  function handleSelect(id: PropertyType) {
    cashCardActions.setPropertyType(id);
    cashCardActions.next();
  }

  function handleKickoutSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!kickoutEmail) return;
    // TODO W3-J: wire to partial-lead endpoint
    setKickoutSubmitted(true);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {q1PropertyType.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Pick the closest match — your loan officer will confirm.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q1PropertyType.options.map((opt) => {
          const selected = state.propertyType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`flex flex-col items-start gap-2 rounded-xl border-2 p-5 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                selected
                  ? 'border-navy bg-navy text-white shadow-md'
                  : 'border-gray-200 bg-white text-ink hover:border-navy hover:shadow-sm'
              }`}
            >
              <span className="text-base font-bold leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setOtherOpen(true)}
          className="text-sm text-gray-500 underline hover:text-navy"
        >
          Modular, mobile, or 5+ acres?
        </button>
      </div>

      {otherOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kickout-heading"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3
              id="kickout-heading"
              className="text-lg font-bold text-ink"
            >
              {kickoutSubmitted
                ? "We'll be in touch."
                : 'Not our usual file — yet.'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {kickoutSubmitted
                ? 'As soon as we open a program for that property type, you\'ll be the first to know.'
                : q1PropertyType.otherKickoutCopy}
            </p>

            {!kickoutSubmitted && (
              <form
                onSubmit={handleKickoutSubmit}
                className="mt-4 flex flex-col gap-3"
              >
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={kickoutEmail}
                  onChange={(e) => setKickoutEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-navy px-6 py-3 text-base font-bold text-white hover:bg-ink"
                >
                  Notify Me
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setOtherOpen(false);
                setKickoutSubmitted(false);
              }}
              className="mt-4 w-full text-sm text-gray-500 underline hover:text-navy"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
