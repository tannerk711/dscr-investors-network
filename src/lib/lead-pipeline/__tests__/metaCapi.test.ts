import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';
import type { LeadPayloadWithMeta } from '../payloadSchema';

/**
 * Meta Conversions API helper unit tests.
 *
 * Covers:
 *   1. Email / phone / first_name are SHA-256 hashed per Meta CAPI rules.
 *   2. The `event_id` param is forwarded to the CAPI payload for dedup.
 *   3. Missing env vars return `{ ok: false, reason: 'config_missing' }`
 *      instead of throwing (so a single bad deploy can't nuke lead capture).
 *   4. Every test mocks `fetch` so no real network calls ever happen.
 *
 * We re-import the module inside each test after resetting modules so the
 * env-var reads inside `postMetaEvent` pick up whatever `process.env` we
 * set for that scenario.
 */

const samplePayload: LeadPayloadWithMeta = {
  firstName: 'Tanner',
  phone: '(555) 867-5309',
  email: 'Tanner@Example.COM',
  propertyAddress: '123 Main St, Austin, TX',
  state: 'TX',
  propertyType: 'sfr',
  propertyValue: 400000,
  currentBalance: 200000,
  monthlyRent: 4000,
  ficoBracket: '740+',
  calculatedCashLow: 60000,
  calculatedCashHigh: 80000,
  calculatedCashFlowLow: 500,
  calculatedCashFlowHigh: 1500,
  utmSource: 'facebook',
  landingPageVariant: 'cash-card-v1',
  submittedAt: '2026-04-09T17:00:00.000Z',
  userAgent: 'Mozilla/5.0 (test)',
  ipAddress: '203.0.113.42',
  fbp: 'fb.1.1700000000000.1234567890',
  fbc: 'fb.1.1700000000000.AbCdEf',
};

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('metaCapi.postMetaEvent', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // Reset fetch mock each test
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"events_received":1}', { status: 200 }))
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('SHA-256 hashes email, phone, and firstName before sending', async () => {
    process.env.META_PIXEL_ID = 'test_pixel';
    process.env.META_CAPI_ACCESS_TOKEN = 'test_token';
    delete process.env.META_TEST_EVENT_CODE;

    const { postMetaEvent } = await import('../metaCapi');
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;

    const result = await postMetaEvent(samplePayload, { eventName: 'Lead' });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const callArgs = fetchMock.mock.calls[0]!;
    const url = callArgs[0] as string;
    const init = callArgs[1] as { body: string };

    expect(url).toContain('/v18.0/test_pixel/events');
    expect(url).toContain('access_token=test_token');

    const body = JSON.parse(init.body);
    const userData = body.data[0].user_data;

    // Email: lowercase + trim
    const expectedEmail = sha256Hex('tanner@example.com');
    expect(userData.em).toEqual([expectedEmail]);

    // Phone: digits-only
    const expectedPhone = sha256Hex('5558675309');
    expect(userData.ph).toEqual([expectedPhone]);

    // First name: lowercase + trim
    const expectedFn = sha256Hex('tanner');
    expect(userData.fn).toEqual([expectedFn]);

    // Plaintext pass-throughs
    expect(userData.client_ip_address).toBe('203.0.113.42');
    expect(userData.client_user_agent).toBe('Mozilla/5.0 (test)');
    expect(userData.fbp).toBe('fb.1.1700000000000.1234567890');
    expect(userData.fbc).toBe('fb.1.1700000000000.AbCdEf');

    // Plaintext email/phone/name should never appear anywhere in the body
    expect(init.body).not.toContain('Tanner@Example.COM');
    expect(init.body).not.toContain('tanner@example.com');
    expect(init.body).not.toContain('5558675309');
    expect(init.body).not.toContain('867-5309');
  });

  it('forwards the event_id parameter to the CAPI payload for dedup', async () => {
    process.env.META_PIXEL_ID = 'test_pixel';
    process.env.META_CAPI_ACCESS_TOKEN = 'test_token';

    const { postMetaEvent } = await import('../metaCapi');
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;

    const eventId = '11111111-2222-3333-4444-555555555555';
    await postMetaEvent(samplePayload, {
      eventName: 'Lead_RevealReached',
      eventId,
    });

    const init = fetchMock.mock.calls[0]![1] as { body: string };
    const body = JSON.parse(init.body);
    expect(body.data[0].event_id).toBe(eventId);
    expect(body.data[0].event_name).toBe('Lead_RevealReached');
  });

  it('returns { ok: false, reason: config_missing } when env vars are missing', async () => {
    delete process.env.META_PIXEL_ID;
    delete process.env.META_CAPI_ACCESS_TOKEN;

    const { postMetaEvent } = await import('../metaCapi');
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;

    // Swallow the expected console.warn so test output stays clean
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await postMetaEvent(samplePayload);

    expect(result).toEqual({ ok: false, reason: 'config_missing' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('never throws — network errors return { ok: false, reason: network_error }', async () => {
    process.env.META_PIXEL_ID = 'test_pixel';
    process.env.META_CAPI_ACCESS_TOKEN = 'test_token';

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNRESET');
      })
    );

    const { postMetaEvent } = await import('../metaCapi');
    const result = await postMetaEvent(samplePayload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('network_error');
      expect(result.error).toContain('ECONNRESET');
    }
  });

  it('postLeadEvent back-compat wrapper carries the payload.eventId through', async () => {
    process.env.META_PIXEL_ID = 'test_pixel';
    process.env.META_CAPI_ACCESS_TOKEN = 'test_token';

    const { postLeadEvent } = await import('../metaCapi');
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;

    await postLeadEvent({
      ...samplePayload,
      eventId: 'webhook-dedup-id-abc123',
    });

    const init = fetchMock.mock.calls[0]![1] as { body: string };
    const body = JSON.parse(init.body);
    expect(body.data[0].event_name).toBe('Lead');
    expect(body.data[0].event_id).toBe('webhook-dedup-id-abc123');
  });

});
