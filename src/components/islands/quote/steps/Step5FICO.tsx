import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { ficoIdToBracket } from '../ficoIdMap';

/**
 * Q5: FICO bracket. 5 tile cards (740+, 700-739, 660-699, 620-659, <620).
 *
 * Selecting "Below 620" routes to a soft kick-out modal: our team reviews
 * sub-620 files personally, so this is a contact-capture path, not a hard
 * rejection. The store still records the FICO bracket so the lead webhook
 * can flag the file as special-handling.
 */
export function Step5FICO() {
  const state = useStore(cashCardStore);
  const { q5Fico } = formSteps;
  const [below620Open, setBelow620Open] = useState(false);
  const [kickoutEmail, setKickoutEmail] = useState('');
  const [kickoutSubmitted, setKickoutSubmitted] = useState(false);

  function handleSelect(id: string) {
    const bracket = ficoIdToBracket(id);
    if (!bracket) return;
    cashCardActions.setFicoBracket(bracket);
    if (id === 'below620') {
      setBelow620Open(true);
      return;
    }
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
        {q5Fico.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">{q5Fico.microcopy}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q5Fico.brackets.map((b) => {
          const bracket = ficoIdToBracket(b.id);
          const selected = state.ficoBracket === bracket;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelect(b.id)}
              className={`flex items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                selected
                  ? 'border-navy bg-navy text-white shadow-md'
                  : 'border-gray-200 bg-white text-ink hover:border-navy hover:shadow-sm'
              }`}
            >
              <span className="text-lg font-bold">{b.label}</span>
              {b.sublabel && (
                <span
                  className={`text-xs font-medium ${selected ? 'text-white/80' : 'text-gray-400'}`}
                >
                  {b.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {below620Open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="below620-heading"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 id="below620-heading" className="text-lg font-bold text-ink">
              {kickoutSubmitted
                ? 'We have it.'
                : "Below 620 — let's still try."}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {kickoutSubmitted
                ? 'Our team reviews these files personally. Expect a direct email or text within one business day.'
                : q5Fico.below620KickoutCopy}
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
                  Send to Our Team
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setBelow620Open(false);
                setKickoutSubmitted(false);
              }}
              className="mt-4 w-full text-sm text-gray-500 underline hover:text-navy"
            >
              Pick a different bracket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
