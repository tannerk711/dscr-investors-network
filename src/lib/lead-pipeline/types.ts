/**
 * Shared types for the lead pipeline (Zapier + Meta CAPI).
 * The canonical inbound payload shape is defined in `payloadSchema.ts`
 * as a Zod schema; this file re-exports the inferred TS types plus the
 * uniform result envelope returned by every side-effect module.
 */

import type { LeadPayload, LeadPayloadWithMeta } from './payloadSchema';

export type { LeadPayload, LeadPayloadWithMeta };

/**
 * Uniform result envelope for any side-effect in the pipeline.
 * Every module (zapier, metaCapi) returns this shape so the
 * orchestrating route can aggregate them with Promise.allSettled.
 */
export type PipelineResult =
  | { ok: true; status?: number }
  | {
      ok: false;
      reason: 'config_missing' | 'network_error' | 'non_2xx' | 'unknown';
      status?: number;
      body?: string;
      error?: string;
    };

/**
 * The compact status string returned to the client so the form JS
 * knows which downstream systems succeeded.
 */
export type ResultStatus = 'ok' | 'error';

export interface LeadWebhookResponse {
  ok: boolean;
  results: {
    zapier: ResultStatus;
    capi: ResultStatus;
  };
}
