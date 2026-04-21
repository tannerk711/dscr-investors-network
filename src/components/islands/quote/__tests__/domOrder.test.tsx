// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react';
import CashCardForm from '../CashCardForm';
import { cashCardActions, cashCardStore } from '../store/cashCardStore';

/**
 * G2 gate test (master-build-plan §10): the reveal screen MUST render in the
 * DOM BEFORE the contact form mounts. This is the load-bearing UX guarantee
 * from the Apr 9 pivot — the whole pitch is "see the numbers, then ask
 * for contact info." If a future refactor accidentally swaps the order
 * (e.g. by inlining contact fields into the reveal), this test fails.
 */
describe('Quote form: DOM order — reveal precedes contact', () => {
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

  it('reveal step renders estimate headline without any contact form fields', () => {
    act(() => {
      cashCardActions.setStep('reveal');
    });
    render(<CashCardForm />);

    // The estimate reveal must be present.
    const estimateHeading = screen.getByRole('heading', {
      name: /Your Cash Out Estimate/i,
    });
    expect(estimateHeading).toBeTruthy();

    // The CTA to get an exact quote must be visible.
    const quoteCta = screen.getByRole('button', { name: /Get an exact quote/i });
    expect(quoteCta).toBeTruthy();

    // The contact submit button MUST NOT exist yet.
    const submitButton = screen.queryByRole('button', {
      name: /Lock In My Numbers/i,
    });
    expect(submitButton).toBeNull();

    // None of the contact inputs should be in the DOM either.
    expect(screen.queryByLabelText(/First name/i)).toBeNull();
    expect(screen.queryByLabelText(/Last name/i)).toBeNull();
    expect(screen.queryByLabelText(/Mobile phone/i)).toBeNull();
    expect(screen.queryByLabelText(/Email/i)).toBeNull();
    expect(screen.queryByLabelText(/Property address/i)).toBeNull();
  });

  it('contact step renders ALL contact fields and the estimate heading is gone', () => {
    act(() => {
      cashCardActions.setStep('contact');
    });
    render(<CashCardForm />);

    // The estimate headline from the reveal must NOT be on screen.
    expect(
      screen.queryByRole('heading', { name: /Your Cash Out Estimate/i })
    ).toBeNull();

    // The contact submit + every contact input must now be present.
    expect(
      screen.getByRole('button', { name: /Lock In My Numbers/i })
    ).toBeTruthy();
    expect(screen.getByLabelText(/First name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Last name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Mobile phone/i)).toBeTruthy();
    expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    expect(screen.getByLabelText(/Property address/i)).toBeTruthy();
  });

  it('reveal step appears earlier than contact step in STEP_ORDER', async () => {
    const { STEP_ORDER } = await import('../store/cashCardStore');
    const revealIdx = STEP_ORDER.indexOf('reveal');
    const contactIdx = STEP_ORDER.indexOf('contact');
    expect(revealIdx).toBeGreaterThanOrEqual(0);
    expect(contactIdx).toBeGreaterThanOrEqual(0);
    expect(revealIdx).toBeLessThan(contactIdx);
  });

  it('store cannot be at contact step until reveal has been visited via next()', () => {
    cashCardActions.setStep('q5');
    cashCardActions.next();
    expect(cashCardStore.get().step).toBe('reveal');
    cashCardActions.next();
    expect(cashCardStore.get().step).toBe('contact');
  });

  it('ResumeToast does NOT render when lastTouchedAt is null (empty resume)', () => {
    cashCardActions.reset();
    cashCardActions.setStep('state');
    render(<CashCardForm />);

    const toast = screen.queryByTestId('resume-toast');
    expect(toast).toBeNull();
  });
});
