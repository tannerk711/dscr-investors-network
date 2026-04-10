export type PropertyType = 'sfr' | 'multi' | 'condo' | 'str';

export type FicoBracket = '740+' | '700-739' | '660-699' | '620-659' | '<620';

export type CashCardInput = {
  state: string;
  propertyType: PropertyType;
  propertyValue: number;
  currentBalance: number;
  monthlyRent: number;
  ficoBracket: FicoBracket;
  trailing12Revenue?: number;
};

export type EdgeCase =
  | 'NEGATIVE_OR_ZERO_CASH_OUT'
  | 'TIGHT_OR_NEGATIVE_CASH_FLOW'
  | 'LOW_CASH_OUT_UNDER_10K';

export type HardKickoutReason = 'FICO_BELOW_580' | 'PROPERTY_VALUE_BELOW_200K';

export type CashCardResult = {
  ltvCap: number;
  newLoanAmount: number;
  grossCashOut: number;
  cashLow: number;
  cashHigh: number;
  estimatedPITI: number;
  rentForDscr: number;
  monthlyCashFlow: number;
  cashFlowLow: number;
  cashFlowHigh: number;
  edgeCases: EdgeCase[];
  hardKickout: HardKickoutReason | null;
};
