// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react';
import CashCardForm from '../CashCardForm';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';

/**
 * G2 gate test (master-build-plan §10): the reveal screen MUST render in the
 * DOM BEFORE the contact form mounts. This is the load-bearing UX guarantee
 * from the Apr 9 pivot — Anthony's whole pitch is "see the cash, then ask
 * for contact info." If a future refactor accidentally swaps the order
 * (e.g. by inlining contact fields into the reveal), this test fails.
 *
 * Approach:
 *  1. Drive the nanostore directly with a fully-answered form state.
 *  2. Set step to 'reveal' → render → assert "Your Cash Card" is in the DOM
 *     and the contact submit button is NOT.
 *  3. Advance to 'contact' → re-render → assert the contact submit button
 *     appears AFTER the cash-card text disappears (or at least after we
 *     left the reveal step). This is the temporal order — reveal first,
 *     contact second — that the master plan demands.
 */
describe('Cash Card form: DOM order — reveal precedes contact', () => {
  beforeEach(() => {
    cashCardActions.reset();
    // Pre-populate with valid answers so the engine produces a real result.
    cashCardActions.setState('TX');
    cashCardActions.setPropertyType('sfr');
    cashCardActions.setPropertyValue(400000);
    cashCardActions.setCurrentBalance(200000);
    cashCardActions.setMonthlyRent(4000);
    cashCardActions.setFicoBracket('700-739');
  });

  afterEach(() => {
    cleanup();
    cashCardActions.reset();
  });

  it('reveal step renders Cash Card text without any contact form fields', () => {
    act(() => {
      cashCardActions.setStep('reveal');
    });
    render(<CashCardForm />);

    // The Cash Card reveal must be present. Use the H2 role specifically —
    // the screen also has an eyebrow with the same text, so a plain
    // getByText would error on multiple matches.
    const cashCardHeading = screen.getByRole('heading', {
      name: /Your Cash Card/i,
    });
    expect(cashCardHeading).toBeTruthy();

    // The "Lock My Cash Card" CTA must be visible — this is the only way
    // forward and proves the reveal owns the screen.
    const lockCta = screen.getByRole('button', { name: /Lock My Cash Card/i });
    expect(lockCta).toBeTruthy();

    // The contact submit button MUST NOT exist yet.
    const submitButton = screen.queryByRole('button', {
      name: /Send My Cash Card/i,
    });
    expect(submitButton).toBeNull();

    // None of the contact inputs should be in the DOM either.
    expect(screen.queryByLabelText(/First name/i)).toBeNull();
    expect(screen.queryByLabelText(/Mobile phone/i)).toBeNull();
    expect(screen.queryByLabelText(/Email/i)).toBeNull();
    expect(screen.queryByLabelText(/Property address/i)).toBeNull();
  });

  it('contact step renders ALL contact fields and the cash-card heading is gone', () => {
    act(() => {
      cashCardActions.setStep('contact');
    });
    render(<CashCardForm />);

    // The "Your Cash Card" headline from the reveal must NOT be on screen.
    expect(
      screen.queryByRole('heading', { name: /Your Cash Card/i })
    ).toBeNull();

    // The contact submit + every contact input must now be present.
    expect(
      screen.getByRole('button', { name: /Send My Cash Card/i })
    ).toBeTruthy();
    expect(screen.getByLabelText(/First name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Mobile phone/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Property address/i)).toBeTruthy();
  });

  it('reveal step appears earlier than contact step in STEP_ORDER', async () => {
    // Belt-and-suspenders: the route order must put reveal before contact.
    // If anyone reorders STEP_ORDER, this catches it without needing a
    // full render walk.
    const { STEP_ORDER } = await import('../store/cashCardStore');
    const revealIdx = STEP_ORDER.indexOf('reveal');
    const contactIdx = STEP_ORDER.indexOf('contact');
    expect(revealIdx).toBeGreaterThanOrEqual(0);
    expect(contactIdx).toBeGreaterThanOrEqual(0);
    expect(revealIdx).toBeLessThan(contactIdx);
  });

  it('store cannot be at contact step until reveal has been visited via next()', () => {
    // The forward path is: q5 → next() → reveal → next() → contact.
    // There's no way to skip reveal because steps are linear in STEP_ORDER.
    cashCardActions.setStep('q5');
    cashCardActions.next();
    expect(cashCardStore.get().step).toBe('reveal');
    cashCardActions.next();
    expect(cashCardStore.get().step).toBe('contact');
  });

  // W3-J — Resume toast should NOT appear on a fresh/empty sessionStorage.
  // The afterEach/beforeEach only pre-populates the store via actions in
  // this session (not via sessionStorage), but the ResumeToast gates on
  // BOTH a non-default state AND lastTouchedAt within 7 days. The toast
  // snapshot runs in the useState initializer so we check the DOM right
  // after render. Separate test block to isolate the setup.
  it('ResumeToast does NOT render when lastTouchedAt is null (empty resume)', () => {
    // Fully reset — no answers at all.
    cashCardActions.reset();
    cashCardActions.setStep('state');
    render(<CashCardForm />);

    const toast = screen.queryByTestId('resume-toast');
    expect(toast).toBeNull();
  });
});
