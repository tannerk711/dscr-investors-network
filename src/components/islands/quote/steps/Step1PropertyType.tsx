import { useStore } from '@nanostores/react';
import { formSteps } from '@content/index';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';
import type { PropertyType } from '@lib/cash-engine/types';

/**
 * Q1: Property type — now the first question the user sees.
 *
 * Tiles use a NewPad-style layout: compact inline icon + bold label per
 * card. "Other" link below opens a soft kick-out modal for modular /
 * mobile / 5+ acres — these don't qualify but we still capture the email.
 */
function PropertyIcon({ id, selected }: { id: PropertyType; selected: boolean }) {
  const cls = `h-5 w-5 flex-shrink-0 ${selected ? 'text-white' : 'text-navy'}`;
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: cls,
    'aria-hidden': true,
  };
  switch (id) {
    case 'sfr':
      return (
        <svg {...common}>
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      );
    case 'multi':
      return (
        <svg {...common}>
          <rect x="3" y="8" width="7" height="13" rx="1" />
          <rect x="14" y="4" width="7" height="17" rx="1" />
          <path d="M6 12h1M6 16h1M17 8h1M17 12h1M17 16h1" />
        </svg>
      );
    case 'condo':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
        </svg>
      );
    case 'str':
      return (
        <svg {...common}>
          <circle cx="8" cy="15" r="4" />
          <path d="M10.85 12.15L20 3" />
          <path d="M15 8l3 3" />
          <path d="M17 6l3 3" />
        </svg>
      );
    default:
      return null;
  }
}

export function Step1PropertyType() {
  const state = useStore(cashCardStore);
  const { q1PropertyType } = formSteps;

  function handleSelect(id: PropertyType) {
    cashCardActions.setPropertyType(id);
    cashCardActions.next();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {q1PropertyType.headline}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Pick the closest match — your loan officer will confirm.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {q1PropertyType.options.map((opt) => {
          const selected = state.propertyType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                selected
                  ? 'border-navy bg-navy text-white shadow-md'
                  : 'border-gray-200 bg-white text-ink hover:border-navy hover:shadow-sm'
              }`}
            >
              <PropertyIcon id={opt.id} selected={selected} />
              <span className="text-base font-bold leading-tight">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
