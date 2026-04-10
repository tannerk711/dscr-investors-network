import { salesforceSchema } from '../../content';
import type { LeadPayloadWithMeta, PipelineResult } from './types';

/**
 * POST the validated lead payload to the Salesforce / Zapier webhook.
 *
 * Design notes:
 * - URL resolution order: process.env.SALESFORCE_WEBHOOK_URL (so prod can
 *   override) → salesforceSchema.webhookUrl from JSON content. The JSON
 *   currently points at the Zapier catch hook Anthony provided.
 * - Auth token is optional. Zapier catch hooks are open URLs and don't
 *   need a Bearer header. If SALESFORCE_AUTH_TOKEN is set we send it,
 *   otherwise we ship without an Authorization header.
 * - Empty / TODO_CLIENT URL is a soft failure — returns
 *   `{ ok: false, reason: 'config_missing' }` so dev environments compile
 *   without crashing.
 * - 8s hard timeout via AbortSignal.timeout — webhook latency above 8s
 *   almost always means we're stuck behind a queue we'll never escape.
 * - Never throws. The route handler uses Promise.allSettled but this is
 *   still defensive — a throw would break the uniform result envelope.
 */
export async function postToSalesforce(
  payload: LeadPayloadWithMeta
): Promise<PipelineResult> {
  const webhookUrl =
    process.env.SALESFORCE_WEBHOOK_URL || salesforceSchema.webhookUrl;
  const authToken = process.env.SALESFORCE_AUTH_TOKEN;

  if (!webhookUrl || webhookUrl.startsWith('TODO_')) {
    console.warn('[salesforce] config_missing (no webhook URL configured)');
    return { ok: false, reason: 'config_missing' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }

    // Non-2xx — capture body for debugging but don't log it (may echo PII).
    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore — body already consumed or unreadable
    }
    return { ok: false, reason: 'non_2xx', status: res.status, body };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'unknown';
    return { ok: false, reason: 'network_error', error };
  }
}
