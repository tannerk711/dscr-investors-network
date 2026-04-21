import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import { ficoIdToBracket } from '../ficoIdMap';

/**
 * Q5: FICO bracket. 5 tile cards (740+, 700-739, 660-699, 620-659, <620).
 *
 * All brackets proceed to the reveal — below 620 gets 50% LTV.
 */
export function Step5FICO() {
  const state = useStore(cashCardStore);
  const { q5Fico } = formSteps;

  function handleSelect(id: string) {
    const bracket = ficoIdToBracket(id);
    if (!bracket) return;
    cashCardActions.setFicoBracket(bracket);
    cashCardActions.next();
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
    </div>
  );
}
