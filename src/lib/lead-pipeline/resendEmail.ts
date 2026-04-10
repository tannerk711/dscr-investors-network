import type { LeadPayloadWithMeta, PipelineResult } from './types';

/**
 * Send the operator notification email via Resend.
 *
 * This is the always-on fallback — if Salesforce silently drops a lead,
 * Tanner/Anthony still have a plain-text record of the submission in
 * their inbox. Sent for EVERY lead, not just when Salesforce fails.
 *
 * Plain text (not HTML) on purpose: the point is durability and instant
 * forward-ability, not marketing polish.
 */

function fmtCurrency(n: number): string {
  try {
    return `$${Math.round(n).toLocaleString('en-US')}`;
  } catch {
    return `$${n}`;
  }
}

function buildTextBody(payload: LeadPayloadWithMeta): string {
  const lines: string[] = [
    'New DSCR lead from dscrinvestors.net',
    '',
    `Submitted: ${payload.submittedAt}`,
    `Landing variant: ${payload.landingPageVariant}`,
    '',
    '--- CONTACT ---',
    `First name: ${payload.firstName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Property address: ${payload.propertyAddress}`,
    '',
    '--- DEAL ---',
    `State: ${payload.state}`,
    `Property type: ${payload.propertyType}`,
    `Property value: ${fmtCurrency(payload.propertyValue)}`,
    `Current balance: ${fmtCurrency(payload.currentBalance)}`,
    `Monthly rent: ${fmtCurrency(payload.monthlyRent)}`,
    `FICO bracket: ${payload.ficoBracket}`,
    '',
    '--- CASH CARD (calculated ranges) ---',
    `Cash at close: ${fmtCurrency(payload.calculatedCashLow)} - ${fmtCurrency(payload.calculatedCashHigh)}`,
    `Cash flow: ${fmtCurrency(payload.calculatedCashFlowLow)} - ${fmtCurrency(payload.calculatedCashFlowHigh)}`,
    '',
    '--- ATTRIBUTION ---',
    `utm_source: ${payload.utmSource ?? '-'}`,
    `utm_campaign: ${payload.utmCampaign ?? '-'}`,
    `fbclid: ${payload.fbclid ?? '-'}`,
    `fbp: ${payload.fbp ?? '-'}`,
    `fbc: ${payload.fbc ?? '-'}`,
    `User agent: ${payload.userAgent ?? '-'}`,
    `IP address: ${payload.ipAddress ?? '-'}`,
  ];
  return lines.join('\n');
}

export async function sendLeadFallbackEmail(
  payload: LeadPayloadWithMeta
): Promise<PipelineResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.RESEND_FALLBACK_TO_EMAIL;

  if (!apiKey) {
    console.warn('[resendEmail] config_missing (RESEND_API_KEY not set)');
    return { ok: false, reason: 'config_missing' };
  }
  if (!fromEmail || !toEmail) {
    console.warn('[resendEmail] config_missing (RESEND_FROM_EMAIL or RESEND_FALLBACK_TO_EMAIL not set)');
    return { ok: false, reason: 'config_missing' };
  }

  const subject = `New DSCR lead: ${payload.firstName} — ${fmtCurrency(
    payload.calculatedCashHigh
  )} cash potential`;

  const body = {
    from: fromEmail,
    to: [toEmail],
    subject,
    text: buildTextBody(payload),
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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
