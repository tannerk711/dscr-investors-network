import type { PartialLeadPayload } from '@lib/lead-pipeline/payloadSchema';
import type { CashCardFormState } from './store/cashCardStore';
import { selectFinalResult } from './store/cashCardStore';

/**
 * Client-side helper for firing partial-lead events to /api/partial-lead.
 *
 * Unlike `submitLead`, this helper does NOT retry, does NOT fall back to
 * the email endpoint, and tolerates missing fields. Partial leads are
 * fire-and-forget — the caller only cares that the fetch completed.
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

export interface BuildPartialLeadOptions {
  source: 'reveal_timeout' | 'exit_intent';
  emailOverride?: string;
  variant?: string;
  eventId?: string;
}

export function buildPartialLeadPayload(
  state: CashCardFormState,
  options: BuildPartialLeadOptions
): PartialLeadPayload {
  const result = selectFinalResult(state);
  const utm = readUtm();
  const cookies = readMetaCookies();

  const payload: PartialLeadPayload = {
    landingPageVariant: options.variant ?? 'cash-card-v1',
    submittedAt: new Date().toISOString(),
    partialSource: options.source,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // Fill in whatever the user has answered so far
  if (state.firstName) payload.firstName = state.firstName;
  if (state.phone) payload.phone = state.phone;

  const email = options.emailOverride || state.email;
  if (email) payload.email = email;

  if (state.propertyAddress) payload.propertyAddress = state.propertyAddress;
  if (state.state) payload.state = state.state;
  if (state.propertyType) payload.propertyType = state.propertyType;
  if (state.propertyValue !== null)
    payload.propertyValue = state.propertyValue;
  if (state.currentBalance !== null)
    payload.currentBalance = state.currentBalance;
  if (state.monthlyRent !== null) payload.monthlyRent = state.monthlyRent;
  if (state.ficoBracket) payload.ficoBracket = state.ficoBracket;

  if (result) {
    payload.calculatedCashLow = result.cashLow;
    payload.calculatedCashHigh = result.cashHigh;
    payload.calculatedCashFlowLow = result.cashFlowLow;
    payload.calculatedCashFlowHigh = result.cashFlowHigh;
  }

  if (utm.utmSource) payload.utmSource = utm.utmSource;
  if (utm.utmCampaign) payload.utmCampaign = utm.utmCampaign;
  if (utm.fbclid) payload.fbclid = utm.fbclid;
  if (cookies.fbp) payload.fbp = cookies.fbp;
  if (cookies.fbc) payload.fbc = cookies.fbc;
  if (options.eventId) payload.eventId = options.eventId;

  return payload;
}

export async function postPartialLead(
  payload: PartialLeadPayload
): Promise<boolean> {
  try {
    const res = await fetch('/api/partial-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Keepalive lets the browser flush the request even if the page
      // is unloading — matches exit-intent semantics.
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}
