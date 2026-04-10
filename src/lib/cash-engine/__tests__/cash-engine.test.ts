import { describe, it, expect } from 'vitest';
import {
  calculateCash,
  calculateCashWithFicoAdjusted,
} from '../calculateCash';
import type { CashCardInput } from '../types';

describe('cash engine — 10 canonical scenarios', () => {
  // Test 1 — Anthony's verbatim example
  // 700-739 → adj 700 → 0.75 LTV
  // newLoan = 400000 * 0.75 = 300000
  // gross = 300000 - 200000 = 100000
  // cashLow = 100000 * 0.80 = 80000; cashHigh = 100000 * 0.90 = 90000
  // PITI = (300000/100000) * 1000 = 3000
  // cashFlow = 4000 - 3000 = 1000
  // cashFlowLow = 1000 * 0.85 = 850; cashFlowHigh = 1000 * 1.15 = 1150
  it("1. Anthony's verbatim example", () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 400000,
      currentBalance: 200000,
      monthlyRent: 4000,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.75);
    expect(r.newLoanAmount).toBe(300000);
    expect(r.grossCashOut).toBe(100000);
    expect(r.cashLow).toBe(80000);
    expect(r.cashHigh).toBe(90000);
    expect(r.estimatedPITI).toBe(3000);
    expect(r.rentForDscr).toBe(4000);
    expect(r.monthlyCashFlow).toBe(1000);
    expect(r.cashFlowLow).toBeCloseTo(850, 5);
    expect(r.cashFlowHigh).toBeCloseTo(1150, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 2 — High-equity Tampa SFR
  // 740+ → adj 740 → 0.75 LTV
  // newLoan = 375000; gross = 275000
  // cashLow = 220000; cashHigh = 247500
  // PITI = 3750; cashFlow = 4500 - 3750 = 750
  // cashFlowLow = 637.5; cashFlowHigh = 862.5
  it('2. High-equity Tampa SFR', () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 500000,
      currentBalance: 100000,
      monthlyRent: 4500,
      ficoBracket: '740+',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.75);
    expect(r.newLoanAmount).toBe(375000);
    expect(r.grossCashOut).toBe(275000);
    expect(r.cashLow).toBe(220000);
    expect(r.cashHigh).toBe(247500);
    expect(r.estimatedPITI).toBe(3750);
    expect(r.monthlyCashFlow).toBe(750);
    expect(r.cashFlowLow).toBeCloseTo(637.5, 5);
    expect(r.cashFlowHigh).toBeCloseTo(862.5, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 3 — Free-and-clear Indianapolis duplex
  // 700-739 → adj 700 → 0.75 LTV
  // newLoan = 262500; gross = 262500
  // cashLow = 210000; cashHigh = 236250
  // PITI = 2625; cashFlow = 3200 - 2625 = 575
  // cashFlowLow = 488.75; cashFlowHigh = 661.25
  it('3. Free-and-clear Indy duplex', () => {
    const input: CashCardInput = {
      state: 'IN',
      propertyType: 'multi',
      propertyValue: 350000,
      currentBalance: 0,
      monthlyRent: 3200,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.75);
    expect(r.newLoanAmount).toBe(262500);
    expect(r.grossCashOut).toBe(262500);
    expect(r.cashLow).toBe(210000);
    expect(r.cashHigh).toBe(236250);
    expect(r.estimatedPITI).toBe(2625);
    expect(r.monthlyCashFlow).toBe(575);
    expect(r.cashFlowLow).toBeCloseTo(488.75, 5);
    expect(r.cashFlowHigh).toBeCloseTo(661.25, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 4 — STR Nashville cabin
  // 740+ → adj 740 → 0.75 LTV
  // newLoan = 450000; gross = 200000
  // cashLow = 160000; cashHigh = 180000
  // PITI = 4500
  // rentForDscr = (90000 / 12) * 0.95 = 7500 * 0.95 = 7125
  // cashFlow = 7125 - 4500 = 2625
  // cashFlowLow = 2231.25; cashFlowHigh = 3018.75
  it('4. STR Nashville cabin (trailing12 path)', () => {
    const input: CashCardInput = {
      state: 'TN',
      propertyType: 'str',
      propertyValue: 600000,
      currentBalance: 250000,
      monthlyRent: 0,
      trailing12Revenue: 90000,
      ficoBracket: '740+',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.75);
    expect(r.newLoanAmount).toBe(450000);
    expect(r.grossCashOut).toBe(200000);
    expect(r.cashLow).toBe(160000);
    expect(r.cashHigh).toBe(180000);
    expect(r.estimatedPITI).toBe(4500);
    expect(r.rentForDscr).toBeCloseTo(7125, 5);
    expect(r.monthlyCashFlow).toBeCloseTo(2625, 5);
    expect(r.cashFlowLow).toBeCloseTo(2231.25, 5);
    expect(r.cashFlowHigh).toBeCloseTo(3018.75, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 5 — 660 grey zone
  // 660-699 → adj 660 → 0.65 LTV
  // newLoan = 400000 * 0.65 = 260000
  // gross = 110000; cashLow = 88000; cashHigh = 99000
  // PITI = 2600; cashFlow = 3500 - 2600 = 900
  // cashFlowLow = 765; cashFlowHigh = 1035
  it('5. 660 grey zone (65% LTV)', () => {
    const input: CashCardInput = {
      state: 'OH',
      propertyType: 'sfr',
      propertyValue: 400000,
      currentBalance: 150000,
      monthlyRent: 3500,
      ficoBracket: '660-699',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.65);
    expect(r.newLoanAmount).toBe(260000);
    expect(r.grossCashOut).toBe(110000);
    expect(r.cashLow).toBe(88000);
    expect(r.cashHigh).toBe(99000);
    expect(r.estimatedPITI).toBe(2600);
    expect(r.monthlyCashFlow).toBe(900);
    expect(r.cashFlowLow).toBeCloseTo(765, 5);
    expect(r.cashFlowHigh).toBeCloseTo(1035, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 6 — Under-rented property
  // 700-739 → adj 700 → 0.75 LTV
  // newLoan = 300000; gross = 200000
  // PITI = 3000; cashFlow = 2000 - 3000 = -1000 → TIGHT_OR_NEGATIVE_CASH_FLOW
  it('6. Under-rented property (negative cash flow flagged)', () => {
    const input: CashCardInput = {
      state: 'TX',
      propertyType: 'sfr',
      propertyValue: 400000,
      currentBalance: 100000,
      monthlyRent: 2000,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.grossCashOut).toBe(200000);
    expect(r.cashLow).toBe(160000);
    expect(r.cashHigh).toBe(180000);
    expect(r.monthlyCashFlow).toBe(-1000);
    expect(r.edgeCases).toContain('TIGHT_OR_NEGATIVE_CASH_FLOW');
    expect(r.edgeCases).not.toContain('NEGATIVE_OR_ZERO_CASH_OUT');
    expect(r.edgeCases).not.toContain('LOW_CASH_OUT_UNDER_10K');
  });

  // Test 7 — $200K minimum boundary
  // 700-739 → adj 700 → 0.75 LTV
  // newLoan = 150000; gross = 100000
  // cashLow = 80000; cashHigh = 90000
  // PITI = 1500; cashFlow = 1000; range 850 / 1150
  it('7. $200K minimum (boundary pass)', () => {
    const input: CashCardInput = {
      state: 'GA',
      propertyType: 'sfr',
      propertyValue: 200000,
      currentBalance: 50000,
      monthlyRent: 2500,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.newLoanAmount).toBe(150000);
    expect(r.grossCashOut).toBe(100000);
    expect(r.cashLow).toBe(80000);
    expect(r.cashHigh).toBe(90000);
    expect(r.estimatedPITI).toBe(1500);
    expect(r.monthlyCashFlow).toBe(1000);
    expect(r.cashFlowLow).toBeCloseTo(850, 5);
    expect(r.cashFlowHigh).toBeCloseTo(1150, 5);
    expect(r.edgeCases).toEqual([]);
  });

  // Test 8a — '<620' bracket boundary (adj 580) passes at 50% LTV
  // 600 - 20 = 580 → 0.50 LTV (not a kick-out)
  // newLoan = 200000; gross = 100000; cashLow = 80000; cashHigh = 90000
  // PITI = 2000; cashFlow = 3000 - 2000 = 1000
  // Test 8b — forced sub-580 via calculateCashWithFicoAdjusted triggers FICO_BELOW_580
  it("8a. '<620' bracket boundary passes at 50% LTV (adj 580)", () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 400000,
      currentBalance: 100000,
      monthlyRent: 3000,
      ficoBracket: '<620',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.ltvCap).toBe(0.5);
    expect(r.newLoanAmount).toBe(200000);
    expect(r.grossCashOut).toBe(100000);
    expect(r.cashLow).toBe(80000);
    expect(r.cashHigh).toBe(90000);
    expect(r.estimatedPITI).toBe(2000);
    expect(r.monthlyCashFlow).toBe(1000);
  });

  it('8b. Forced ficoAdjusted < 580 returns FICO_BELOW_580', () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 400000,
      currentBalance: 100000,
      monthlyRent: 3000,
      ficoBracket: '<620',
    };
    const r = calculateCashWithFicoAdjusted(input, 579);
    expect(r.hardKickout).toBe('FICO_BELOW_580');
    expect(r.ltvCap).toBe(0);
    expect(r.newLoanAmount).toBe(0);
    expect(r.grossCashOut).toBe(0);
    expect(r.cashLow).toBe(0);
    expect(r.cashHigh).toBe(0);
    expect(r.cashFlowLow).toBe(0);
    expect(r.cashFlowHigh).toBe(0);
  });

  // Test 9 — Hard kick-out: property value below $200K
  it('9. Hard kick-out: property value below $200K', () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 150000,
      currentBalance: 50000,
      monthlyRent: 2000,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBe('PROPERTY_VALUE_BELOW_200K');
    expect(r.ltvCap).toBe(0);
    expect(r.newLoanAmount).toBe(0);
    expect(r.grossCashOut).toBe(0);
    expect(r.cashLow).toBe(0);
    expect(r.cashHigh).toBe(0);
  });

  // Test 10 — Low cash out under $10K
  // 700-739 → adj 700 → 0.75 LTV
  // newLoan = 250000 * 0.75 = 187500; gross = 187500 - 180000 = 7500
  // cashLow = round(7500 * 0.80) = 6000; cashHigh = round(7500 * 0.90) = 6750
  // PITI = 1875; cashFlow = 2500 - 1875 = 625
  // Edge: LOW_CASH_OUT_UNDER_10K (gross > 0 but < 10000)
  it('10. Low cash out under $10K flagged', () => {
    const input: CashCardInput = {
      state: 'FL',
      propertyType: 'sfr',
      propertyValue: 250000,
      currentBalance: 180000,
      monthlyRent: 2500,
      ficoBracket: '700-739',
    };
    const r = calculateCash(input);
    expect(r.hardKickout).toBeNull();
    expect(r.newLoanAmount).toBe(187500);
    expect(r.grossCashOut).toBe(7500);
    expect(r.cashLow).toBe(6000);
    expect(r.cashHigh).toBe(6750);
    expect(r.estimatedPITI).toBe(1875);
    expect(r.monthlyCashFlow).toBe(625);
    expect(r.edgeCases).toContain('LOW_CASH_OUT_UNDER_10K');
    expect(r.edgeCases).not.toContain('NEGATIVE_OR_ZERO_CASH_OUT');
    expect(r.edgeCases).not.toContain('TIGHT_OR_NEGATIVE_CASH_FLOW');
  });
});
