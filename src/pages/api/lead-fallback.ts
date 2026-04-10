import type { APIRoute } from 'astro';
import { LeadPayloadSchema, type LeadPayloadWithMeta } from '@lib/lead-pipeline/payloadSchema';
import { sendLeadFallbackEmail } from '@lib/lead-pipeline/resendEmail';

/**
 * POST /api/lead-fallback
 *
 * JS-side emergency fallback. The form calls this endpoint ONLY when
 * /api/lead-webhook has already returned a 5xx after its single retry.
 *
 * Only sends the Resend email. Does not attempt Salesforce or CAPI —
 * the whole point is that those primary paths are degraded and we're
 * making sure the lead at least shows up in Tanner/Anthony's inbox.
 *
 * Same Zod validation as the primary webhook. Returns 200 on success,
 * 502 on email failure.
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

  const result = await sendLeadFallbackEmail(payload);

  if (result.ok) {
    return jsonResponse({ ok: true }, 200);
  }

  return jsonResponse({ ok: false }, 502);
};
