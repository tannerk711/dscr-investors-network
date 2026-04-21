import type { APIRoute } from 'astro';
import { LeadPayloadSchema, type LeadPayloadWithMeta } from '@lib/lead-pipeline/payloadSchema';
import { postToZapier } from '@lib/lead-pipeline/zapier';
import { postLeadEvent } from '@lib/lead-pipeline/metaCapi';
import type {
  LeadWebhookResponse,
  PipelineResult,
  ResultStatus,
} from '@lib/lead-pipeline/types';

/**
 * POST /api/lead-webhook
 *
 * Contract:
 * 1. Validates inbound JSON against LeadPayloadSchema (Zod). 400 on parse fail.
 * 2. Enriches with server-side `ipAddress` and `userAgent`.
 * 3. Fans out to Zapier + Meta CAPI via Promise.allSettled —
 *    either one failing does NOT block the other.
 * 4. Returns 200 if at least one side-effect succeeded. Returns 502 if
 *    both failed so the client can retry once.
 * 5. Never echoes the payload back to the client (PII).
 */
export const prerender = false;

function statusOf(result: PromiseSettledResult<PipelineResult>): ResultStatus {
  if (result.status === 'fulfilled' && result.value.ok) return 'ok';
  return 'error';
}

function getClientIp(request: Request): string | undefined {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return undefined;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  const parsed = LeadPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid_payload' }, 400);
  }

  const payload: LeadPayloadWithMeta = {
    ...parsed.data,
    ipAddress: getClientIp(request),
    userAgent:
      parsed.data.userAgent ?? request.headers.get('user-agent') ?? undefined,
  };

  const [zapierResult, capiResult] = await Promise.allSettled([
    postToZapier(payload),
    postLeadEvent(payload),
  ]);

  const results: LeadWebhookResponse['results'] = {
    zapier: statusOf(zapierResult),
    capi: statusOf(capiResult),
  };

  const anyOk = results.zapier === 'ok' || results.capi === 'ok';

  if (!anyOk) {
    return jsonResponse({ ok: false, results }, 502);
  }

  return jsonResponse({ ok: true, results }, 200);
};
