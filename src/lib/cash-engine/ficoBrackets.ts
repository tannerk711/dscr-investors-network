import type { FicoBracket } from './types';

const BRACKET_MIDPOINTS: Record<FicoBracket, number> = {
  '740+': 760,
  '700-739': 720,
  '660-699': 680,
  '620-659': 640,
  '<620': 600,
};

export function bracketMidpoint(bracket: FicoBracket): number {
  return BRACKET_MIDPOINTS[bracket];
}

export function adjustFico(bracket: FicoBracket, adjustment: number): number {
  return bracketMidpoint(bracket) + adjustment;
}
