import type { CashEngineConfig } from '../../content/schemas';

export function applyFeesHaircut(
  grossCashOut: number,
  haircut: CashEngineConfig['feesHaircut']
): { netCashLow: number; netCashHigh: number } {
  const clamped = grossCashOut > 0 ? grossCashOut : 0;
  return {
    netCashLow: Math.round(clamped * haircut.low),
    netCashHigh: Math.round(clamped * haircut.high),
  };
}
