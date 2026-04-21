import type { LeadPayloadWithMeta } from './payloadSchema';
import type { PipelineResult } from './types';

/**
 * POST the validated lead payload to the Zapier webhook.
 *
 * URL comes from ZAPIER_WEBHOOK_URL env var. Empty URL is a soft failure
 * so dev environments compile without crashing.
 *
 * 8s hard timeout — webhook latency above 8s almost always means we're
 * stuck behind a queue we'll never escape.
 *
 * Never throws. The route handler uses Promise.allSettled but this is
 * still defensive.
 */
export async function postToZapier(
  payload: LeadPayloadWithMeta
): Promise<PipelineResult> {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('[zapier] config_missing (ZAPIER_WEBHOOK_URL not set)');
    return { ok: false, reason: 'config_missing' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }

    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore
    }
    return { ok: false, reason: 'non_2xx', status: res.status, body };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'unknown';
    return { ok: false, reason: 'network_error', error };
  }
}
