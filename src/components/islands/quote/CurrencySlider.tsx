import { useEffect, useRef, useState } from 'react';
import { formatUsd } from './format';

/**
 * Native-range-input slider with a synced "type-override" currency input.
 *
 * Why a native input over Radix Slider for now: Wave 2 shipped in 6 days
 * and the native range covers everything we need (keyboard nav, ARIA,
 * iOS haptic, snap step). Radix is in the design spec but only buys us
 * custom thumb styling, which the master plan didn't gate launch on.
 *
 * Wave 3 polish pass additions:
 *  - The thumb scales to 1.15 on :active / :focus-visible via the
 *    .cash-slider CSS in global.css (haptic-feeling drag).
 *  - The fill bar left of the thumb is painted navy via a CSS custom
 *    property `--range-progress` the component sets inline; right side
 *    stays gray-200.
 *  - Snap increments ($25K / $10K / $100) are enforced by the `step`
 *    prop on the native range input AND on commit from the type-override
 *    (we round to the nearest step when the user types a value).
 *  - Focus ring on the type-override input uses navy/30 so it reads as a
 *    "you can type here" affordance rather than an error.
 *  - Out-of-range type-overrides clamp + surface a NEUTRAL (gray) note,
 *    not a red error — master-build-plan §5 Q2 specifies the tone.
 *
 * Behaviors:
 *  - `value` is the source of truth from the parent (store-backed).
 *  - When the user drags the slider OR types a number, we call `onChange`.
 *  - Type-override is debounced via local state so backspacing works.
 *  - Min enforcement: if the user types below `enforcedMin` we snap back
 *    and surface `minTooltip` for ~3s.
 */
type Props = {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  enforcedMin?: number;
  minTooltip?: string;
  ariaLabel: string;
  helperHint?: string;
  freeAndClearCopy?: string;
};

export function CurrencySlider({
  value,
  onChange,
  min,
  max,
  step,
  enforcedMin,
  minTooltip,
  ariaLabel,
  helperHint,
  freeAndClearCopy,
}: Props) {
  const [inputText, setInputText] = useState(formatUsd(value));
  const [showMinTooltip, setShowMinTooltip] = useState(false);
  const tooltipTimer = useRef<number | null>(null);
  const lastValueRef = useRef(value);

  // Sync external value back into the local input text whenever the parent
  // changes the value (e.g. user dragged the slider, or store reset).
  useEffect(() => {
    if (value !== lastValueRef.current) {
      setInputText(formatUsd(value));
      lastValueRef.current = value;
    }
  }, [value]);

  function snapToStep(n: number): number {
    if (step <= 0) return n;
    return Math.round(n / step) * step;
  }

  function clamp(n: number): { value: number; snapped: boolean } {
    const floor = enforcedMin ?? min;
    if (n < floor) return { value: floor, snapped: true };
    if (n > max) return { value: max, snapped: false };
    return { value: n, snapped: false };
  }

  function commitNumber(n: number) {
    const { value: clamped, snapped } = clamp(n);
    // Snap-to-step even for type-override values so power users can't
    // bypass the $25K / $10K / $100 grid by typing $347,852.
    const snappedToStep = snapToStep(clamped);
    // Re-clamp after stepping — snapping up from the min could exceed max.
    const { value: finalValue } = clamp(snappedToStep);
    if (snapped) {
      setShowMinTooltip(true);
      if (tooltipTimer.current) window.clearTimeout(tooltipTimer.current);
      tooltipTimer.current = window.setTimeout(() => setShowMinTooltip(false), 3000);
    }
    onChange(finalValue);
    setInputText(formatUsd(finalValue));
    lastValueRef.current = finalValue;
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Native range inputs already enforce `step`, so we don't need to
    // re-snap here — just pass through.
    const n = Number(e.target.value);
    if (Number.isFinite(n)) {
      onChange(n);
      setInputText(formatUsd(n));
      lastValueRef.current = n;
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function handleTextBlur() {
    const digits = inputText.replace(/[^0-9]/g, '');
    if (!digits) {
      // Empty → reset to current store value
      setInputText(formatUsd(value));
      return;
    }
    commitNumber(Number(digits));
  }

  function handleTextKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }

  // Progress fraction for the fill bar (left of thumb = navy, right = gray).
  // Use the visual range so the fill tracks what the slider actually shows.
  const clampedForProgress = Math.min(Math.max(value, min), max);
  const progressPct =
    max > min ? ((clampedForProgress - min) / (max - min)) * 100 : 0;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={inputText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKey}
          aria-label={`${ariaLabel} (type to override)`}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-center text-3xl font-bold tabular-nums text-ink shadow-sm transition-colors focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/20 md:text-4xl"
        />
        {showMinTooltip && minTooltip && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-500"
          >
            {minTooltip}
          </div>
        )}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampedForProgress}
        onChange={handleSliderChange}
        aria-label={ariaLabel}
        className="cash-slider mt-5 w-full"
        style={{ ['--range-progress' as string]: `${progressPct}%` }}
      />

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400 tabular-nums">
        <span>{formatUsd(min)}</span>
        <span>{formatUsd(max)}</span>
      </div>

      {helperHint && (
        <p className="mt-3 text-center text-xs text-gray-500">{helperHint}</p>
      )}
      {freeAndClearCopy && value === 0 && (
        <p className="mt-3 text-center text-xs font-medium text-success">
          {freeAndClearCopy}
        </p>
      )}
      {freeAndClearCopy && value > 0 && (
        <p className="mt-3 text-center text-xs text-gray-500">
          {freeAndClearCopy}
        </p>
      )}
    </div>
  );
}
