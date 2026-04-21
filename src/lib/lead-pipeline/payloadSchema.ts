import { z } from 'zod';

/**
 * Zod schema for the inbound lead POST body.
 *
 * Validates the lead POST body sent to /api/lead-webhook.
 * Includes Meta CAPI cookies (fbp, fbc) and tracking attribution fields.
 *
 * NOTE: `ipAddress` is NOT in this schema. The server fills it in from
 * the `x-forwarded-for` request header — never trust the client for IP.
 */
export const LeadPayloadSchema = z.object({
  // Contact
  firstName: z.string().min(1).max(80),
  phone: z.string().min(7).max(32),
  email: z.string().email().max(254),
  propertyAddress: z.string().min(1).max(300),

  // Deal shape
  state: z.string().min(2).max(2),
  propertyType: z.enum(['sfr', 'multi', 'condo', 'str']),
  propertyValue: z.number().finite().nonnegative(),
  currentBalance: z.number().finite().nonnegative(),
  monthlyRent: z.number().finite().nonnegative(),
  ficoBracket: z.enum(['740+', '700-739', '660-699', '620-659', '<620']),

  // Calculated ranges from the cash engine (client-side)
  calculatedCashLow: z.number().finite(),
  calculatedCashHigh: z.number().finite(),
  calculatedCashFlowLow: z.number().finite(),
  calculatedCashFlowHigh: z.number().finite(),

  // Attribution
  utmSource: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  fbclid: z.string().max(512).optional(),
  fbp: z.string().max(255).optional(),
  fbc: z.string().max(512).optional(),

  // Context
  landingPageVariant: z.string().min(1).max(120),
  submittedAt: z.string().min(1).max(64),
  userAgent: z.string().max(1024).optional(),

  // W3-J: client-generated UUID for pixel ↔ CAPI dedup.
  // Optional for backward compat with pre-W3-J submissions.
  eventId: z.string().min(1).max(128).optional(),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;

/**
 * The server-enriched payload — same as `LeadPayload` but with
 * `ipAddress` and a guaranteed `userAgent` filled in from request headers.
 */
export type LeadPayloadWithMeta = LeadPayload & {
  ipAddress?: string;
  userAgent?: string;
};

