import { useState, useEffect, useRef } from 'react';
import { cashCardStore } from './store/cashCardStore';
import { buildPartialLeadPayload, postPartialLead } from './submitPartialLead';
import { firePixelEvent, cashMidpoint } from './pixel';

/**
 * W3-J — Exit-intent modal.
 *
 * Rendered globally inside CashCardForm and shown when `useExitIntent`
 * fires (user mouse-leaves through the top of the viewport, or does a
 * rapid upward mobile scroll). The modal is gated to only appear once
 * the user has reached Step3 or later — prior to that we haven't
 * captured enough for a partial lead to be worth saving.
 *
 * On submit: fires the pixel `Lead_PartialLead` custom event AND posts
 * to /api/partial-lead with the store contents + the email entered in
 * the modal. Dedup via eventId carried on the store.
 *
 * The microcopy is W3-I's lane in general, but this file is in W3-J's
 * lane per the build plan — the two strings below ("Wait..." and
 * "Save My Cash Card") come directly from the W3-J task description.
 */

export interface ExitIntentModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExitIntentModal({ open, onClose }: ExitIntentModalProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus the email field when the modal opens so mobile keyboards
  // come up without an extra tap.
  useEffect(() => {
    if (open && emailInputRef.current) {
      const t = setTimeout(() => emailInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Escape key closes the modal — standard accessibility.
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);

    // Lightweight email validation — full Zod validation happens on the
    // server. We just block obviously bad input to save a round-trip.
    const trimmed = email.trim();
    if (!trimmed || !/.+@.+\..+/.test(trimmed)) {
      setError('Enter a valid email.');
      return;
    }

    setSubmitting(true);
    const state = cashCardStore.get();
    const payload = buildPartialLeadPayload(state, {
      source: 'exit_intent',
      emailOverride: trimmed,
      eventId: state.eventId ?? undefined,
    });

    // Fire the pixel event first — it's synchronous from the user's POV.
    try {
      firePixelEvent(
        'Lead_PartialLead',
        {
          value: cashMidpoint(payload.calculatedCashLow, payload.calculatedCashHigh),
          currency: 'USD',
          partial_source: 'exit_intent',
        },
        state.eventId ?? undefined
      );
    } catch {
      /* never throw */
    }

    await postPartialLead(payload);
    setSubmitting(false);
    setDone(true);

    // Auto-dismiss after a short confirmation beat.
    setTimeout(() => {
      onClose();
    }, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <h2 className="text-2xl font-extrabold leading-tight text-ink">
              Saved.
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We'll text you the second your locked numbers are ready.
            </p>
          </div>
        ) : (
          <>
            <h2
              id="exit-intent-title"
              className="text-2xl font-extrabold leading-tight text-ink md:text-3xl"
            >
              Wait — your Cash Card isn't saved yet.
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Drop your email and we'll text you the second your locked numbers are ready.
            </p>
            <form onSubmit={handleSubmit} className="mt-6">
              <label
                htmlFor="exit-intent-email"
                className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                Email
              </label>
              <input
                id="exit-intent-email"
                ref={emailInputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-ink focus:border-navy focus:outline-none"
                placeholder="you@example.com"
                required
              />
              {error && (
                <p role="alert" className="mt-2 text-xs text-red-accent">
                  {error}
                </p>
              )}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-red-accent px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : 'Save My Cash Card'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  No thanks
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
