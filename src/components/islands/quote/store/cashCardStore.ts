/**
 * Cash Card form state — single nanostore atom that survives across step
 * components. Persists to sessionStorage so a user who taps away mid-form
 * can resume on return (Section 8 edge case in master-build-plan.md).
 *
 * The store ONLY holds raw user inputs. Calculated cash/cash-flow numbers
 * are derived on demand by `selectResult()` so we never have to keep two
 * sources of truth in sync.
 */
import { atom } from 'nanostores';
import { calculateCash } from '@lib/cash-engine/calculateCash';
import type {
  CashCardInput,
  CashCardResult,
  FicoBracket,
  PropertyType,
} from '@lib/cash-engine/types';

export type StepKey =
  | 'state'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'reveal'
  | 'contact'
  | 'success';

export const STEP_ORDER: StepKey[] = [
  'state',
  'q1',
  'q2',
  'q3',
  'q4',
  'q5',
  'reveal',
  'contact',
  'success',
];

/**
 * The 4-question + state-gate inputs the user fills in.
 * `null` means "not yet answered" — important for the live preview bar
 * which only activates after Q2 (property value).
 */
export type NavDirection = 'forward' | 'back';

export type CashCardFormState = {
  step: StepKey;
  /**
   * Direction of the last step transition — feeds the AnimatePresence
   * variants in CashCardForm so forward-nav slides left and back-nav
   * slides right. Not persisted (transient UI hint).
   */
  direction: NavDirection;
  // Pre-step
  state: string | null;
  // Q1
  propertyType: PropertyType | null;
  // Q2
  propertyValue: number | null;
  // Q3
  currentBalance: number | null;
  // Q4
  monthlyRent: number | null;
  trailing12Revenue: number | null;
  // Q5
  ficoBracket: FicoBracket | null;
  // Contact (filled at Step 6)
  firstName: string;
  phone: string;
  email: string;
  propertyAddress: string;
  // Submission
  submitting: boolean;
  submitError: string | null;
  submittedAt: string | null;

  // W3-J: last time the user interacted with the store — used by the
  // ResumeToast to decide whether to show the "pick up where you left off"
  // prompt (only if within the last 7 days).
  lastTouchedAt: string | null;

  // W3-J: client-minted UUID used to dedup the pixel `Lead` event against
  // the CAPI `Lead` event. Generated lazily when the user first reaches
  // the reveal step (so we have a stable id across pixel/capi fires).
  eventId: string | null;
};

const STORAGE_KEY = 'dscrin.cashcard.v1';

const initialState: CashCardFormState = {
  step: 'state',
  direction: 'forward',
  state: null,
  propertyType: null,
  propertyValue: null,
  currentBalance: null,
  monthlyRent: null,
  trailing12Revenue: null,
  ficoBracket: null,
  firstName: '',
  phone: '',
  email: '',
  propertyAddress: '',
  submitting: false,
  submitError: null,
  submittedAt: null,
  lastTouchedAt: null,
  eventId: null,
};

function loadInitial(): CashCardFormState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<CashCardFormState>;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export const cashCardStore = atom<CashCardFormState>(loadInitial());

if (typeof window !== 'undefined') {
  cashCardStore.subscribe((next) => {
    try {
      // Don't persist transient submission flags
      const { submitting, submitError, ...persisted } = next;
      void submitting;
      void submitError;
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* sessionStorage may be disabled — silently ignore */
    }
  });
}

// ---------- mutators ----------

/**
 * Fields whose mutation should bump `lastTouchedAt` — i.e. the user
 * actively answered something meaningful. Pure navigation (step, direction,
 * transient submitting/submitError flags) does not count as "touched".
 */
const TOUCH_FIELDS: ReadonlyArray<keyof CashCardFormState> = [
  'state',
  'propertyType',
  'propertyValue',
  'currentBalance',
  'monthlyRent',
  'trailing12Revenue',
  'ficoBracket',
  'firstName',
  'phone',
  'email',
  'propertyAddress',
];

function patch(p: Partial<CashCardFormState>) {
  const touches = TOUCH_FIELDS.some((k) => k in p);
  const next = {
    ...cashCardStore.get(),
    ...p,
    ...(touches ? { lastTouchedAt: new Date().toISOString() } : {}),
  };
  cashCardStore.set(next);
}

export const cashCardActions = {
  setStep(step: StepKey, direction: NavDirection = 'forward') {
    patch({ step, direction });
  },
  next() {
    const cur = cashCardStore.get().step;
    const idx = STEP_ORDER.indexOf(cur);
    if (idx < 0 || idx >= STEP_ORDER.length - 1) return;
    patch({ step: STEP_ORDER[idx + 1] as StepKey, direction: 'forward' });
  },
  back() {
    const cur = cashCardStore.get().step;
    const idx = STEP_ORDER.indexOf(cur);
    if (idx <= 0) return;
    patch({ step: STEP_ORDER[idx - 1] as StepKey, direction: 'back' });
  },
  setState(state: string) {
    patch({ state });
  },
  setPropertyType(propertyType: PropertyType) {
    patch({ propertyType });
  },
  setPropertyValue(propertyValue: number) {
    // If the new property value is below the current balance, snap balance down
    const cur = cashCardStore.get();
    const nextBalance =
      cur.currentBalance !== null && cur.currentBalance > propertyValue
        ? propertyValue
        : cur.currentBalance;
    patch({ propertyValue, currentBalance: nextBalance });
  },
  setCurrentBalance(currentBalance: number) {
    patch({ currentBalance });
  },
  setMonthlyRent(monthlyRent: number) {
    patch({ monthlyRent });
  },
  setTrailing12Revenue(trailing12Revenue: number) {
    patch({ trailing12Revenue });
  },
  setFicoBracket(ficoBracket: FicoBracket) {
    patch({ ficoBracket });
  },
  setContact(p: {
    firstName: string;
    phone: string;
    email: string;
    propertyAddress: string;
  }) {
    patch(p);
  },
  setSubmitting(submitting: boolean) {
    patch({ submitting, submitError: submitting ? null : cashCardStore.get().submitError });
  },
  setSubmitError(submitError: string | null) {
    patch({ submitError, submitting: false });
  },
  setSubmittedAt(iso: string) {
    patch({ submittedAt: iso });
  },
  /**
   * W3-J: lazily mint an event_id for pixel↔CAPI dedup. Called from
   * Step6CashCardReveal on mount. Idempotent — returns the existing id
   * if one was already set this session.
   */
  ensureEventId(): string {
    const cur = cashCardStore.get();
    if (cur.eventId) return cur.eventId;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    cashCardStore.set({ ...cur, eventId: id });
    return id;
  },
  reset() {
    cashCardStore.set(initialState);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* noop */
      }
    }
  },
};

// ---------- selectors ----------

/**
 * Build the cash-engine input from current store state. Returns null if
 * we don't have enough answers yet to run the engine. The engine needs
 * propertyValue, currentBalance, monthlyRent, ficoBracket, and propertyType.
 */
export function selectEngineInput(state: CashCardFormState): CashCardInput | null {
  if (
    state.propertyValue === null ||
    state.currentBalance === null ||
    state.monthlyRent === null ||
    state.ficoBracket === null ||
    state.propertyType === null
  ) {
    return null;
  }
  return {
    state: state.state ?? '',
    propertyType: state.propertyType,
    propertyValue: state.propertyValue,
    currentBalance: state.currentBalance,
    monthlyRent: state.monthlyRent,
    ficoBracket: state.ficoBracket,
    trailing12Revenue: state.trailing12Revenue ?? undefined,
  };
}

/**
 * Run the cash engine in "preview" mode — uses a default 700-739 bracket
 * if FICO hasn't been chosen yet so the sticky preview bar can show
 * a meaningful number after Q2 instead of staying empty until Q5.
 */
export function selectPreviewResult(
  state: CashCardFormState
): CashCardResult | null {
  if (
    state.propertyValue === null ||
    state.currentBalance === null ||
    state.monthlyRent === null ||
    state.propertyType === null
  ) {
    return null;
  }
  const fico: FicoBracket = state.ficoBracket ?? '700-739';
  return calculateCash({
    state: state.state ?? '',
    propertyType: state.propertyType,
    propertyValue: state.propertyValue,
    currentBalance: state.currentBalance,
    monthlyRent: state.monthlyRent,
    ficoBracket: fico,
    trailing12Revenue: state.trailing12Revenue ?? undefined,
  });
}

/**
 * Final cash result for the reveal — requires all answers including FICO.
 */
export function selectFinalResult(
  state: CashCardFormState
): CashCardResult | null {
  const input = selectEngineInput(state);
  if (!input) return null;
  return calculateCash(input);
}
