import type { LeadPayload } from '@lib/lead-pipeline/payloadSchema';
import type { CashCardFormState } from './store/cashCardStore';
import { selectFinalResult } from './store/cashCardStore';

/**
 * Build the LeadPayload from the current cash card store state and POST it
 * to /api/lead-webhook with a single retry on 5xx, falling back to
 * /api/lead-fallback if the primary path returns non-2xx after retry.
 *
 * Returns `{ ok: true }` on any successful side-effect (the webhook fans
 * out to Salesforce + CAPI + email; any one succeeding is enough), and
 * `{ ok: false, error }` only when ALL paths failed.
 */

function readUtm(): {
  utmSource?: string;
  utmCampaign?: string;
  fbclid?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
      fbclid: params.get('fbclid') ?? undefined,
    };
  } catch {
    return {};
  }
}

function readMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  const out: { fbp?: string; fbc?: string } = {};
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const [k, ...rest] = c.trim().split('=');
    const v = rest.join('=');
    if (k === '_fbp') out.fbp = v;
    if (k === '_fbc') out.fbc = v;
  }
  return out;
}

export function buildLeadPayload(
  state: CashCardFormState,
  variant = 'cash-card-v1'
): LeadPayload | null {
  const result = selectFinalResult(state);
  if (
    !result ||
    state.propertyType === null ||
    state.propertyValue === null ||
    state.currentBalance === null ||
    state.monthlyRent === null ||
    state.ficoBracket === null ||
    !state.state
  ) {
    return null;
  }

  const utm = readUtm();
  const cookies = readMetaCookies();

  return {
    firstName: state.firstName,
    phone: state.phone,
    email: state.email,
    propertyAddress: state.propertyAddress,
    state: state.state,
    propertyType: state.propertyType,
    propertyValue: state.propertyValue,
    currentBalance: state.currentBalance,
    monthlyRent: state.monthlyRent,
    ficoBracket: state.ficoBracket,
    calculatedCashLow: result.cashLow,
    calculatedCashHigh: result.cashHigh,
    calculatedCashFlowLow: result.cashFlowLow,
    calculatedCashFlowHigh: result.cashFlowHigh,
    utmSource: utm.utmSource,
    utmCampaign: utm.utmCampaign,
    fbclid: utm.fbclid,
    fbp: cookies.fbp,
    fbc: cookies.fbc,
    landingPageVariant: variant,
    submittedAt: new Date().toISOString(),
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    // W3-J: mirror the pixel `Lead` event_id so Meta dedupes the
    // client-side and server-side Lead fires. Undefined means the
    // user never reached the reveal (shouldn't happen in the normal
    // flow — contact is only reachable via reveal.next()) but we leave
    // the field optional for defensiveness.
    eventId: state.eventId ?? undefined,
  };
}

async function postOnce(url: string, payload: LeadPayload): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function submitLead(
  state: CashCardFormState
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = buildLeadPayload(state);
  if (!payload) {
    return { ok: false, error: 'Missing required answers' };
  }

  // Primary attempt
  try {
    const res = await postOnce('/api/lead-webhook', payload);
    if (res.ok) return { ok: true };
    if (res.status >= 500) {
      // Single retry
      try {
        const retry = await postOnce('/api/lead-webhook', payload);
        if (retry.ok) return { ok: true };
      } catch {
        /* swallow — fall through to fallback */
      }
      // Fallback: email-only path
      try {
        const fallback = await postOnce('/api/lead-fallback', payload);
        if (fallback.ok) return { ok: true };
      } catch {
        /* swallow */
      }
      return { ok: false, error: 'Network error. Please try again.' };
    }
    return { ok: false, error: 'Submission rejected. Please check your info.' };
  } catch {
    // Network failure on primary — try the fallback once
    try {
      const fallback = await postOnce('/api/lead-fallback', payload);
      if (fallback.ok) return { ok: true };
    } catch {
      /* swallow */
    }
    return { ok: false, error: 'Network error. Please try again.' };
  }
}
