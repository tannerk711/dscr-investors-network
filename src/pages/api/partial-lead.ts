import type { APIRoute } from 'astro';
import {
  PartialLeadPayloadSchema,
  type PartialLeadPayloadWithMeta,
} from '@lib/lead-pipeline/payloadSchema';
import { postPartialLeadEvent } from '@lib/lead-pipeline/metaCapi';

/**
 * POST /api/partial-lead
 *
 * W3-J — partial-lead capture for retargeting.
 *
 * Called from two client triggers:
 *   1. usePartialLead — fires when a user reaches Step6CashCardReveal but
 *      doesn't submit contact within 60 seconds (abandon mid-reveal).
 *   2. useExitIntent / ExitIntentModal — fires when a user tries to leave
 *      after reaching Step3 or later and opts in via the modal.
 *
 * What this endpoint does:
 *   - Validates a RELAXED schema (all deal fields optional; only
 *     `submittedAt` + `landingPageVariant` are required)
 *   - Fires the Meta CAPI `Lead_PartialLead` server-side event for
 *     dedup against the client-side pixel fire of the same event_id
 *   - Logs to the serverless function stdout for Vercel log inspection
 *   - Returns `{ ok: true }` immediately — we explicitly DO NOT write to
 *     Salesforce because partial leads don't belong in the LO routing
 *     queue (Anthony's operation only takes fully-qualified leads).
 *
 * Latency target: < 200 ms. The CAPI fire is awaited but the 8s CAPI
 * timeout + the POST payload is small enough that p99 stays well under.
 */
export const prerender = false;

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

  const parsed = PartialLeadPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid_payload' }, 400);
  }

  const payload: PartialLeadPayloadWithMeta = {
    ...parsed.data,
    ipAddress: getClientIp(request),
    userAgent:
      parsed.data.userAgent ?? request.headers.get('user-agent') ?? undefined,
  };

  // Log for Vercel/console inspection. Never log PII in plaintext — we
  // only log the shape so Tanner can see the funnel in real time.
  console.info(
    '[partial-lead] received',
    JSON.stringify({
      source: payload.partialSource ?? 'unknown',
      hasEmail: Boolean(payload.email),
      hasPhone: Boolean(payload.phone),
      state: payload.state ?? null,
      variant: payload.landingPageVariant,
      eventId: payload.eventId ?? null,
    })
  );

  // Fire CAPI for retargeting. Never throw — partial-lead endpoint is
  // fire-and-forget from the client's perspective.
  const capiResult = await postPartialLeadEvent(payload);

  return jsonResponse({ ok: true, capi: capiResult.ok ? 'ok' : 'error' }, 200);
};
