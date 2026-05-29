import { cashEngineConfig } from '../../content';
import type { CashEngineConfig } from '../../content/schemas';
import { adjustFico } from './ficoBrackets';
import { ltvCapForFico } from './ltvBrackets';
import { applyFeesHaircut } from './feesHaircut';
import type { CashCardInput, CashCardResult, EdgeCase } from './types';

function emptyResult(
  hardKickout: CashCardResult['hardKickout']
): CashCardResult {
  return {
    ltvCap: 0,
    newLoanAmount: 0,
    grossCashOut: 0,
    cashLow: 0,
    cashHigh: 0,
    estimatedPITI: 0,
    rentForDscr: 0,
    monthlyCashFlow: 0,
    cashFlowLow: 0,
    cashFlowHigh: 0,
    edgeCases: [],
    hardKickout,
  };
}

export function calculateCashWithFicoAdjusted(
  input: CashCardInput,
  ficoAdjusted: number,
  config: CashEngineConfig = cashEngineConfig
): CashCardResult {
  if (input.propertyValue < config.edgeCaseThresholds.minPropertyValue) {
    return emptyResult('PROPERTY_VALUE_BELOW_200K');
  }

  if (ficoAdjusted < 580) {
    return emptyResult('FICO_BELOW_580');
  }

  const ltvCap = ltvCapForFico(ficoAdjusted, config.ltvBrackets);
  const newLoanAmount = input.propertyValue * ltvCap;
  const grossCashOut = newLoanAmount - input.currentBalance;

  const { netCashLow, netCashHigh } = applyFeesHaircut(
    grossCashOut,
    config.feesHaircut
  );

  const estimatedPITI = (newLoanAmount / 100000) * config.pitiPerHundredK;

  const rentForDscr =
    input.propertyType === 'str' && typeof input.trailing12Revenue === 'number'
      ? (input.trailing12Revenue / 12) * config.strRevenueDiscount
      : input.monthlyRent;

  // Never surface a negative cash flow to the user. The "$1K PITI per $100K"
  // rule over-prices the payment at the edges, and on untouched slider
  // defaults the rent can be too low for the loan size, producing a scary
  // negative that tanks the call. Floor the displayed cash flow at $0; the
  // specialist works out the real, structured number live.
  const rawMonthlyCashFlow = rentForDscr - estimatedPITI;
  const monthlyCashFlow = Math.max(0, rawMonthlyCashFlow);
  const cashFlowLow = monthlyCashFlow * (1 - config.cashFlowRangeFactor);
  const cashFlowHigh = monthlyCashFlow * (1 + config.cashFlowRangeFactor);

  const edgeCases: EdgeCase[] = [];
  if (grossCashOut <= 0) {
    edgeCases.push('NEGATIVE_OR_ZERO_CASH_OUT');
  } else if (grossCashOut < config.edgeCaseThresholds.minCashOutDollars) {
    edgeCases.push('LOW_CASH_OUT_UNDER_10K');
  }
  if (rawMonthlyCashFlow <= 0) {
    edgeCases.push('TIGHT_OR_NEGATIVE_CASH_FLOW');
  }

  return {
    ltvCap,
    newLoanAmount,
    grossCashOut,
    cashLow: netCashLow,
    cashHigh: netCashHigh,
    estimatedPITI,
    rentForDscr,
    monthlyCashFlow,
    cashFlowLow,
    cashFlowHigh,
    edgeCases,
    hardKickout: null,
  };
}

export function calculateCash(
  input: CashCardInput,
  config: CashEngineConfig = cashEngineConfig
): CashCardResult {
  const ficoAdjusted = adjustFico(input.ficoBracket, config.ficoAdjustment);
  return calculateCashWithFicoAdjusted(input, ficoAdjusted, config);
}
