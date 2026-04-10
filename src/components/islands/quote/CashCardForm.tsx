import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { formSteps } from '@content/index';
import {
  cashCardStore,
  cashCardActions,
  STEP_ORDER,
  selectFinalResult,
  type StepKey,
} from './store/cashCardStore';
import { CashCardPreview } from './CashCardPreview';
import { ResumeToast } from './ResumeToast';
import { ExitIntentModal } from './ExitIntentModal';
import { useExitIntent } from './useExitIntent';
import { firePixelEvent, cashMidpoint } from './pixel';
import { Step0State } from './steps/Step0State';
import { Step1PropertyType } from './steps/Step1PropertyType';
import { Step2PropertyValue } from './steps/Step2PropertyValue';
import { Step3LoanBalance } from './steps/Step3LoanBalance';
import { Step4MonthlyRent } from './steps/Step4MonthlyRent';
import { Step5FICO } from './steps/Step5FICO';
import { Step6CashCardReveal } from './steps/Step6CashCardReveal';
import { Step7Contact } from './steps/Step7Contact';
import { SuccessScreen } from './steps/SuccessScreen';

/**
 * Root React island for the 4-Question Cash Card form.
 *
 * Architecture decisions:
 *  - Single nanostore atom (`cashCardStore`) is the only source of truth.
 *    Steps are pure renderers; they read state via `useStore` and dispatch
 *    via `cashCardActions`. No prop drilling.
 *  - Step transitions use Framer Motion's <AnimatePresence mode="wait">.
 *    Each step slides in from the right, exits to the left.
 *  - The sticky preview bar lives ABOVE the AnimatePresence so it does NOT
 *    re-mount on every step change.
 *  - Mobile is full-bleed within the section; desktop caps at max-w-2xl.
 *  - Progress dots show 6 dots (state, Q1, Q2, Q3, Q4, Q5). Reveal/contact
 *    intentionally don't get dots — they're not "questions".
 */
/**
 * Directional slide variants for step transitions.
 *
 * Forward nav: incoming step slides in from the right (+24 → 0), exiting
 * step slides out to the left (0 → -24). Back nav flips both axes so the
 * page feels like it's reversing. The `custom` prop on AnimatePresence
 * threads the current direction into each variant.
 *
 * Timing: 0.26s on ease-out-cubic. Wave 2 shipped 0.3s and it felt a
 * touch draggy on mobile when rapidly tapping through tile-select steps,
 * so this polish pass tightens it by ~15% without going full-snap.
 */
const slideVariants = {
  enter: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 24 : -24,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -24 : 24,
  }),
};

const STEP_TRANSITION = { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] } as const;
const STEP_TRANSITION_REDUCED = { duration: 0.15, ease: 'linear' } as const;

const FORM_QUESTION_STEPS: StepKey[] = ['state', 'q1', 'q2', 'q3', 'q4', 'q5'];

function ProgressDots({ current }: { current: StepKey }) {
  const idx = FORM_QUESTION_STEPS.indexOf(current);
  if (idx < 0) return null;
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-valuenow={idx + 1}
      aria-valuemin={1}
      aria-valuemax={FORM_QUESTION_STEPS.length}
      aria-label={`Step ${idx + 1} of ${FORM_QUESTION_STEPS.length}`}
    >
      {FORM_QUESTION_STEPS.map((s, i) => (
        <span
          key={s}
          className={`h-2 w-2 rounded-full transition-colors ${
            i <= idx ? 'bg-navy' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function BackButton({ current }: { current: StepKey }) {
  const idx = STEP_ORDER.indexOf(current);
  // Hide on first step, on success, and on reveal (the reveal's CTA is the only forward path)
  if (idx <= 0 || current === 'success' || current === 'reveal') return null;
  return (
    <button
      type="button"
      onClick={() => cashCardActions.back()}
      className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      aria-label="Go back to previous question"
    >
      <span aria-hidden="true">&larr;</span>
      <span>Back</span>
    </button>
  );
}

function StepRenderer({ step }: { step: StepKey }) {
  switch (step) {
    case 'state':
      return <Step0State />;
    case 'q1':
      return <Step1PropertyType />;
    case 'q2':
      return <Step2PropertyValue />;
    case 'q3':
      return <Step3LoanBalance />;
    case 'q4':
      return <Step4MonthlyRent />;
    case 'q5':
      return <Step5FICO />;
    case 'reveal':
      return <Step6CashCardReveal />;
    case 'contact':
      return <Step7Contact />;
    case 'success':
      return <SuccessScreen />;
    default:
      return null;
  }
}

/**
 * W3-J — Analytics side-effects hook.
 *
 * Watches the current step and fires the appropriate client-side pixel
 * events at the right funnel moments:
 *
 *   - state → q1 transition     => Lead_FormStart
 *   - reveal step reached       => Lead_RevealReached (+ mint eventId)
 *   - success step reached      => Lead (the standard Meta event)
 *
 * Each fire is guarded by a ref so StrictMode double-mounts and step
 * re-renders don't double-count. The `Lead` fire happens on success
 * NOT on contact submit — submit can 500 and we don't want to over-report.
 */
function useStepAnalytics(step: StepKey): void {
  const firedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const fired = firedRef.current;
    const snap = cashCardStore.get();

    if (step === 'q1' && !fired.formStart) {
      fired.formStart = true;
      firePixelEvent('Lead_FormStart', {
        content_category: 'dscr_refi',
      });
    }

    if (step === 'reveal' && !fired.reveal) {
      fired.reveal = true;
      const eventId = cashCardActions.ensureEventId();
      const result = selectFinalResult(snap);
      const value = result ? cashMidpoint(result.cashLow, result.cashHigh) : 0;
      firePixelEvent(
        'Lead_RevealReached',
        {
          value,
          currency: 'USD',
          content_category: 'dscr_refi',
        },
        eventId
      );
    }

    if (step === 'success' && !fired.lead) {
      fired.lead = true;
      const result = selectFinalResult(snap);
      const value = result ? cashMidpoint(result.cashLow, result.cashHigh) : 0;
      firePixelEvent(
        'Lead',
        {
          value,
          currency: 'USD',
          content_category: 'dscr_refi',
        },
        snap.eventId ?? undefined
      );
    }
  }, [step]);
}

export default function CashCardForm() {
  const state = useStore(cashCardStore);
  const prefersReduced = useReducedMotion();

  // Force the contract guarantee from form-steps.json into the runtime — if
  // anyone ever changes the JSON without updating the schema, this throws
  // here instead of in a leaf component.
  void formSteps;

  // Fire client-side pixel events at the right funnel moments.
  useStepAnalytics(state.step);

  // Exit-intent modal — only armed once the user has reached Q3 or later
  // (they've answered enough to be worth saving) and only fires once
  // per session (enforced inside the hook via sessionStorage).
  const stepIdx = STEP_ORDER.indexOf(state.step);
  const q3Idx = STEP_ORDER.indexOf('q3');
  const successIdx = STEP_ORDER.indexOf('success');
  const exitIntentEnabled =
    stepIdx >= q3Idx && stepIdx < successIdx && state.submittedAt === null;
  const { triggered: exitIntentOpen, dismiss: dismissExitIntent } = useExitIntent({
    enabled: exitIntentEnabled,
  });

  // In reduced-motion mode the slide-left/slide-right translation is
  // actively distracting, so we collapse to a simple opacity crossfade.
  const variants = prefersReduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : slideVariants;

  const transition = prefersReduced ? STEP_TRANSITION_REDUCED : STEP_TRANSITION;

  return (
    <div className="relative w-full">
      <CashCardPreview />

      <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-8 md:px-8 md:pt-12">
        {/* W3-J: "Welcome back — pick up where you left off?" toast.
            Self-gates on sessionStorage contents, so this is a no-op
            render for most page loads. */}
        <ResumeToast />

        {/* Header bar: back + dots */}
        <div className="mb-8 flex items-center justify-between">
          <BackButton current={state.step} />
          <ProgressDots current={state.step} />
        </div>

        <AnimatePresence mode="wait" initial={false} custom={state.direction}>
          <motion.div
            key={state.step}
            custom={state.direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            <StepRenderer step={state.step} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* W3-J: Exit-intent modal. Renders null unless `exitIntentOpen` is true.
          Armed only when the user is on Q3 or later and hasn't submitted. */}
      <ExitIntentModal open={exitIntentOpen} onClose={dismissExitIntent} />
    </div>
  );
}
