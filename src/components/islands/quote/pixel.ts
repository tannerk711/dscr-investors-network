/**
 * Thin wrapper around `window.fbq` for the Meta Pixel.
 *
 * The base code is injected in `BaseLayout.astro` as a <script is:inline>
 * block — it reads PUBLIC_META_PIXEL_ID and boots fbq + fires PageView
 * automatically. This module only wraps the CUSTOM events that the form
 * fires at specific funnel moments.
 *
 * Event taxonomy:
 *   - Lead_FormStart       — user advances past the state gate into Q1
 *   - Lead_RevealReached   — user reaches the Cash Card reveal (high intent)
 *   - Lead                 — standard Meta event, fires on SuccessScreen mount
 *                            (NOT on contact submit — submit could 500 and
 *                            we'd over-count the lead)
 *
 * Dedup: every event carries an `eventID` (third arg to fbq). The server
 * mirrors the same id in the CAPI payload. Meta collapses the two fires.
 *
 * QA escape hatch: append `?disable_pixel=1` to the URL to no-op every
 * call on the client. Used for Lighthouse + manual QA runs so we don't
 * pollute Meta's Events Manager with synthetic traffic.
 */

export type PixelEventName =
  | 'Lead'
  | 'Lead_FormStart'
  | 'Lead_RevealReached';

interface FbqFn {
  (cmd: 'init', pixelId: string): void;
  (cmd: 'track', eventName: string, params?: Record<string, unknown>, opts?: { eventID?: string }): void;
  (
    cmd: 'trackCustom',
    eventName: string,
    params?: Record<string, unknown>,
    opts?: { eventID?: string }
  ): void;
  (cmd: string, ...args: unknown[]): void;
  loaded?: boolean;
  disablePushState?: boolean;
  queue?: unknown[];
}

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    __dscrinPixelDisabled?: boolean;
  }
}

/**
 * Check whether the pixel is disabled this session. Checked on every
 * call (not cached) so the QA hatch is honored even if the URL param
 * is removed after page load.
 */
function isPixelDisabled(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.__dscrinPixelDisabled === true) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('disable_pixel') === '1') {
      window.__dscrinPixelDisabled = true;
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Fire a standard or custom Meta Pixel event. Safe to call in any
 * environment — no-ops if fbq isn't loaded (e.g. ad blocker) or if the
 * pixel is disabled via the QA hatch.
 *
 * The `eventID` is the dedup key. Pass the same id to the server-side
 * CAPI fire for this event so Meta collapses the two.
 */
export function firePixelEvent(
  eventName: PixelEventName,
  params: Record<string, unknown> = {},
  eventId?: string
): void {
  if (typeof window === 'undefined') return;
  if (isPixelDisabled()) return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;

  try {
    const opts = eventId ? { eventID: eventId } : undefined;
    // `Lead` is a standard Meta event; everything else is custom.
    if (eventName === 'Lead') {
      fbq('track', 'Lead', params, opts);
    } else {
      fbq('trackCustom', eventName, params, opts);
    }
  } catch {
    /* never throw from analytics */
  }
}

/**
 * Compute the "value" the pixel should attach to a Cash Card event.
 * We report the midpoint of the low/high range so Meta has a stable
 * single number to bid on, and clamp to zero for edge cases.
 */
export function cashMidpoint(
  cashLow: number | null | undefined,
  cashHigh: number | null | undefined
): number {
  const low = typeof cashLow === 'number' && Number.isFinite(cashLow) ? cashLow : null;
  const high = typeof cashHigh === 'number' && Number.isFinite(cashHigh) ? cashHigh : null;
  if (low !== null && high !== null) {
    return Math.max(0, Math.round((low + high) / 2));
  }
  if (high !== null) return Math.max(0, Math.round(high));
  if (low !== null) return Math.max(0, Math.round(low));
  return 0;
}
