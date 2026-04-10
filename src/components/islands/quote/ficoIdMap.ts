import type { FicoBracket } from '@lib/cash-engine/types';

/**
 * Maps the JSON content `id` field (`"740plus"`) to the engine `FicoBracket`
 * literal type (`"740+"`). The JSON ids exist because JSON keys can't include
 * `+` cleanly in CSS/JS identifiers, but the engine uses the human label.
 */
export const FICO_ID_TO_BRACKET: Record<string, FicoBracket> = {
  '740plus': '740+',
  '700to739': '700-739',
  '660to699': '660-699',
  '620to659': '620-659',
  below620: '<620',
};

export function ficoIdToBracket(id: string): FicoBracket | null {
  return FICO_ID_TO_BRACKET[id] ?? null;
}
