import type { CashEngineConfig } from '../../content/schemas';

export function ltvCapForFico(
  ficoAdjusted: number,
  brackets: CashEngineConfig['ltvBrackets']
): number {
  for (const bracket of brackets) {
    if (ficoAdjusted >= bracket.minFico) {
      return bracket.ltvCap;
    }
  }
  return 0;
}
