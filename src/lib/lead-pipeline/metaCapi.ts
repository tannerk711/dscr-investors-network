import { createHash } from 'node:crypto';
import type {
  LeadPayloadWithMeta,
} from './payloadSchema';
import type { PipelineResult } from './types';

/**
 * Post a server-side event to the Meta Conversions API.
 *
 * Why server-side: iOS 14.5+ ATT + Safari ITP kill a meaningful chunk of
 * pixel-only events. CAPI restores attribution for that slice. The fbp/fbc
 * cookies (forwarded from the client) let Meta dedupe CAPI and pixel events,
 * and the `event_id` parameter (a UUID minted on the client and mirrored
 * on the server) is the primary dedup key.
 *
 * Hashing rules (per Meta CAPI v18):
 * - Email: lowercased + trimmed, SHA-256
 * - Phone: digits only, SHA-256 (no country code normalization here —
 *   we assume 10-digit US since all traffic is US-state-gated)
 * - First name: lowercased + trimmed, SHA-256
 * - client_ip_address and client_user_agent are passed in plaintext
 *
 * Supports `Lead` and `Lead_RevealReached` via the `eventName` parameter,
 * and takes an optional `event_id` for pixel↔CAPI deduplication.
 */
function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

export function hashPhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  return sha256(digits);
}

export function hashFirstName(firstName: string): string {
  return sha256(firstName.trim().toLowerCase());
}

export function hashLastName(lastName: string): string {
  return sha256(lastName.trim().toLowerCase());
}

export type MetaEventName = 'Lead' | 'Lead_RevealReached';

interface MetaUserData {
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
}

interface MetaEventBody {
  data: Array<{
    event_name: MetaEventName;
    event_time: number;
    event_id?: string;
    action_source: 'website';
    event_source_url: string;
    user_data: MetaUserData;
    custom_data: {
      value?: number;
      currency?: 'USD';
      lead_event_source: string;
      content_category: string;
    };
  }>;
  test_event_code?: string;
}

type AnyLeadPayload = LeadPayloadWithMeta;

export interface PostMetaEventOptions {
  eventName?: MetaEventName;
  eventId?: string;
  /**
   * Override the event's "value" field. Defaults to the midpoint of
   * calculatedCashLow/High on the payload, falling back to
   * calculatedCashHigh, falling back to 0.
   */
  value?: number;
}

function computeValue(payload: AnyLeadPayload, override?: number): number {
  if (typeof override === 'number' && Number.isFinite(override)) {
    return Math.max(0, Math.round(override));
  }
  const low =
    typeof payload.calculatedCashLow === 'number'
      ? payload.calculatedCashLow
      : null;
  const high =
    typeof payload.calculatedCashHigh === 'number'
      ? payload.calculatedCashHigh
      : null;
  if (low !== null && high !== null) {
    return Math.max(0, Math.round((low + high) / 2));
  }
  if (high !== null) return Math.max(0, Math.round(high));
  if (low !== null) return Math.max(0, Math.round(low));
  return 0;
}

/**
 * Build the user_data block. All identity fields are SHA-256 hashed before
 * being sent. Missing fields are simply omitted (partial leads often only
 * have an email).
 */
function buildUserData(payload: AnyLeadPayload): MetaUserData {
  const userData: MetaUserData = {};

  if (payload.email) {
    userData.em = [hashEmail(payload.email)];
  }
  if (payload.phone) {
    userData.ph = [hashPhone(payload.phone)];
  }
  if (payload.firstName) {
    userData.fn = [hashFirstName(payload.firstName)];
  }
  if (payload.lastName) {
    userData.ln = [hashLastName(payload.lastName)];
  }
  if (payload.ipAddress) userData.client_ip_address = payload.ipAddress;
  if (payload.userAgent) userData.client_user_agent = payload.userAgent;
  if (payload.fbc) userData.fbc = payload.fbc;
  if (payload.fbp) userData.fbp = payload.fbp;

  return userData;
}

export async function postMetaEvent(
  payload: AnyLeadPayload,
  options: PostMetaEventOptions = {}
): Promise<PipelineResult> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn(
      '[metaCapi] config_missing (META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set)'
    );
    return { ok: false, reason: 'config_missing' };
  }

  const eventName: MetaEventName = options.eventName ?? 'Lead';
  const userData = buildUserData(payload);
  const value = computeValue(payload, options.value);

  const body: MetaEventBody = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: 'https://dscrinvestors.net',
        user_data: userData,
        custom_data: {
          value,
          currency: 'USD',
          lead_event_source: 'dscrinvestors_landing',
          content_category: 'dscr_refi',
        },
      },
    ],
  };

  if (options.eventId) {
    body.data[0]!.event_id = options.eventId;
  }

  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(
    pixelId
  )}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }

    let respBody = '';
    try {
      respBody = await res.text();
    } catch {
      // ignore
    }
    return { ok: false, reason: 'non_2xx', status: res.status, body: respBody };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'unknown';
    return { ok: false, reason: 'network_error', error };
  }
}

/**
 * Back-compat wrapper — the webhook used to call `postLeadEvent(payload)`
 * with no options. It now forwards to the generic poster, pulling the
 * eventId from the payload so dedup works when the client also fired a
 * pixel `Lead` event with the same id.
 */
export async function postLeadEvent(
  payload: LeadPayloadWithMeta
): Promise<PipelineResult> {
  return postMetaEvent(payload, {
    eventName: 'Lead',
    eventId: payload.eventId,
  });
}

