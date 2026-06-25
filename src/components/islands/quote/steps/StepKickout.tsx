import { formSteps } from '@content/index';
import { cashCardActions } from '../store/cashCardStore';

/**
 * Terminal kick-out for non-owners. Reached only from the ownership gate
 * when the user says they do NOT own the property. By product decision this
 * is a HARD dead-end: no contact info is captured, no lead is created. The
 * point of the gate is to keep the lead list to people who actually hold a
 * rental we can refinance, so capturing the non-owner here would defeat it.
 *
 * The copy stays warm and leaves the door open ("come back when you own
 * one") so we don't burn the brand with someone who may convert later.
 */
export function StepKickout() {
  const { ownership } = formSteps;

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-navy/5">
        <svg
          className="h-6 w-6 text-navy"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold leading-tight text-ink md:text-3xl">
        {ownership.kickoutHeadline}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
        {ownership.kickoutBody}
      </p>
      <button
        type="button"
        onClick={() => cashCardActions.reset()}
        className="mt-7 inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Start over</span>
      </button>
    </div>
  );
}
