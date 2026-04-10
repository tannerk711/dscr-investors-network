import type { APIRoute } from 'astro';
import { LeadPayloadSchema, type LeadPayloadWithMeta } from '@lib/lead-pipeline/payloadSchema';
import { postToSalesforce } from '@lib/lead-pipeline/salesforce';
import { postLeadEvent } from '@lib/lead-pipeline/metaCapi';
import { sendLeadFallbackEmail } from '@lib/lead-pipeline/resendEmail';
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
 * 3. Fans out to Salesforce + Meta CAPI + Resend via Promise.allSettled —
 *    any one failing does NOT block the others.
 * 4. Returns 200 if at least one side-effect succeeded (Tanner still has the
 *    email even if Salesforce dies). Returns 502 if ALL three failed so the
 *    client can retry once.
 * 5. Never echoes the payload back to the client (PII).
 *
 * The Vercel adapter picks up this route as a serverless function because
 * of `export const prerender = false;` below — this works in Astro 5's
 * `output: 'static'` mode via @astrojs/vercel v8+.
 */
export const prerender = false;

function statusOf(result: PromiseSettledResult<PipelineResult>): ResultStatus {
  if (result.status === 'fulfilled' && result.value.ok) return 'ok';
  return 'error';
}

function getClientIp(request: Request): string | undefined {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // first entry is the client; the rest are upstream proxies
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
  // 1. Parse body safely
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  // 2. Validate against Zod schema (strict). Don't echo the body on failure.
  const parsed = LeadPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid_payload' }, 400);
  }

  // 3. Enrich with server-side metadata
  const payload: LeadPayloadWithMeta = {
    ...parsed.data,
    ipAddress: getClientIp(request),
    userAgent:
      parsed.data.userAgent ?? request.headers.get('user-agent') ?? undefined,
  };

  // 4. Fan out — each call is independent, allSettled so one failure doesn't
  //    block the others. The fetch wrappers never throw, but allSettled is
  //    defensive in case an unexpected error slips through.
  const [sfResult, capiResult, emailResult] = await Promise.allSettled([
    postToSalesforce(payload),
    postLeadEvent(payload),
    sendLeadFallbackEmail(payload),
  ]);

  const results: LeadWebhookResponse['results'] = {
    salesforce: statusOf(sfResult),
    capi: statusOf(capiResult),
    email: statusOf(emailResult),
  };

  const anyOk =
    results.salesforce === 'ok' ||
    results.capi === 'ok' ||
    results.email === 'ok';

  // 5. If every leg failed, return 502 so the client retries once
  if (!anyOk) {
    return jsonResponse({ ok: false, results }, 502);
  }

  return jsonResponse({ ok: true, results }, 200);
};
