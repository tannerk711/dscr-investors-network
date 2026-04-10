// @vitest-environment jsdom
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { StrictMode } from 'react';
import {
  usePartialLead,
  PARTIAL_FIRED_KEY,
  __clearPartialLeadTimerForTests,
} from '../usePartialLead';
import { cashCardActions } from '../store/cashCardStore';

/**
 * W3-J — Partial-lead hook tests.
 *
 * Contract the hook must honor:
 *   1. Fires the endpoint exactly ONCE per session even when rendered
 *      inside React.StrictMode (which double-invokes effects on mount
 *      in dev to surface side-effect bugs).
 *   2. Never fires if the sessionStorage flag `dscrin.partial.fired`
 *      is already set at mount time.
 *   3. Fires after the configured delay (tests use 10ms instead of 60s).
 *   4. Does not fire if the component unmounts before the timeout.
 */

type PosterFn = (payload: unknown) => Promise<boolean>;
type PixelFireFn = (
  name: string,
  params: Record<string, unknown>,
  id?: string
) => void;

function TestComponent({
  poster,
  pixelFire,
}: {
  poster: PosterFn;
  pixelFire?: PixelFireFn;
}) {
  usePartialLead({
    delayMs: 10,
    // The hook signature declares a narrower payload type; we widen to
    // `unknown` in the test so we can inspect the posted shape freely.
    poster: poster as Parameters<typeof usePartialLead>[0] extends {
      poster?: infer P;
    }
      ? NonNullable<P>
      : never,
    pixelFire,
  });
  return null;
}

describe('usePartialLead hook', () => {
  beforeEach(() => {
    __clearPartialLeadTimerForTests();
    cashCardActions.reset();
    // Pre-populate the store so the payload builder has something to work with
    cashCardActions.setState('TX');
    cashCardActions.setPropertyType('sfr');
    cashCardActions.setPropertyValue(400000);
    cashCardActions.setCurrentBalance(200000);
    cashCardActions.setMonthlyRent(4000);
    cashCardActions.setFicoBracket('700-739');
    // Clear sessionStorage keys so each test starts clean
    try {
      window.sessionStorage.removeItem(PARTIAL_FIRED_KEY);
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    cleanup();
    __clearPartialLeadTimerForTests();
    cashCardActions.reset();
    try {
      window.sessionStorage.removeItem(PARTIAL_FIRED_KEY);
    } catch {
      /* ignore */
    }
    vi.restoreAllMocks();
  });

  it('fires exactly ONCE even when rendered inside StrictMode (double-mount)', async () => {
    const poster = vi.fn<(payload: unknown) => Promise<boolean>>(
      async () => true
    );
    const pixelFire =
      vi.fn<
        (name: string, params: Record<string, unknown>, id?: string) => void
      >();

    render(
      <StrictMode>
        <TestComponent poster={poster} pixelFire={pixelFire} />
      </StrictMode>
    );

    // Wait past the 10ms delay
    await new Promise((r) => setTimeout(r, 60));

    expect(poster).toHaveBeenCalledTimes(1);
    expect(pixelFire).toHaveBeenCalledTimes(1);

    // And the sessionStorage flag is set after firing
    expect(window.sessionStorage.getItem(PARTIAL_FIRED_KEY)).toBe('1');

    // The pixel fire should carry the event name
    const pixelArgs = pixelFire.mock.calls[0]!;
    expect(pixelArgs[0]).toBe('Lead_PartialLead');
    const params = pixelArgs[1] as Record<string, unknown>;
    expect(params.currency).toBe('USD');
    expect(params.partial_source).toBe('reveal_timeout');
  });

  it('never fires if dscrin.partial.fired is already set in sessionStorage', async () => {
    window.sessionStorage.setItem(PARTIAL_FIRED_KEY, '1');

    const poster = vi.fn<(payload: unknown) => Promise<boolean>>(
      async () => true
    );
    const pixelFire =
      vi.fn<
        (name: string, params: Record<string, unknown>, id?: string) => void
      >();

    render(<TestComponent poster={poster} pixelFire={pixelFire} />);
    await new Promise((r) => setTimeout(r, 60));

    expect(poster).not.toHaveBeenCalled();
    expect(pixelFire).not.toHaveBeenCalled();
  });

  it('does not fire if the user submits the full lead before the timeout elapses', async () => {
    const poster = vi.fn<(payload: unknown) => Promise<boolean>>(
      async () => true
    );
    const pixelFire =
      vi.fn<
        (name: string, params: Record<string, unknown>, id?: string) => void
      >();

    render(<TestComponent poster={poster} pixelFire={pixelFire} />);

    // Simulate a successful submit happening before the timer fires —
    // this flips submittedAt to a timestamp, which the timer callback
    // checks at fire time and early-returns on.
    cashCardActions.setSubmittedAt(new Date().toISOString());

    await new Promise((r) => setTimeout(r, 60));

    expect(poster).not.toHaveBeenCalled();
    expect(pixelFire).not.toHaveBeenCalled();
    // The flag stays unset because the fire was short-circuited
    expect(window.sessionStorage.getItem(PARTIAL_FIRED_KEY)).toBeNull();
  });

  it('carries the store answers through to the posted payload', async () => {
    const poster = vi.fn<(payload: unknown) => Promise<boolean>>(
      async () => true
    );
    const pixelFire =
      vi.fn<
        (name: string, params: Record<string, unknown>, id?: string) => void
      >();

    render(<TestComponent poster={poster} pixelFire={pixelFire} />);
    await new Promise((r) => setTimeout(r, 60));

    expect(poster).toHaveBeenCalledTimes(1);
    const payload = poster.mock.calls[0]![0] as Record<string, unknown>;
    expect(payload.state).toBe('TX');
    expect(payload.propertyType).toBe('sfr');
    expect(payload.propertyValue).toBe(400000);
    expect(payload.partialSource).toBe('reveal_timeout');
    expect(payload.landingPageVariant).toBe('cash-card-v1');
    // calculatedCashLow/High should be populated because all inputs exist
    expect(typeof payload.calculatedCashLow).toBe('number');
    expect(typeof payload.calculatedCashHigh).toBe('number');
  });
});
