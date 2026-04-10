import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * DigitMorph — cinematic per-digit reveal.
 *
 * Given a target integer, renders each character (digits + punctuation) as
 * an animated SVG tile that "rolls" into its final glyph. The visual is an
 * SVG reel: the digit column slides vertically through 0-9 and settles on
 * the target with a 2px overshoot bounce. At display sizes (text-5xl+)
 * this reads identically to a flubber path morph but ships zero extra
 * dependencies.
 *
 * Staggering:
 *   - direction="rtl" → right-to-left stagger (units digit moves first)
 *   - direction="ltr" → left-to-right stagger
 *   - baseDelay adds a fixed delay before the whole sequence begins
 *   - staggerMs is the per-digit gap (spec: 60ms)
 *
 * Respects prefers-reduced-motion: snaps to final string instantly.
 *
 * Only digits 0-9 animate. Commas, dashes, currency symbols, and spaces
 * render as plain text and fade in with the sequence.
 */
type Props = {
  value: number | string;
  prefix?: string;
  suffix?: string;
  direction?: 'ltr' | 'rtl';
  baseDelay?: number;
  staggerMs?: number;
  durationMs?: number;
  /** Tailwind class controlling font size + color + weight. */
  className?: string;
  ariaLabel?: string;
};

const DIGIT_HEIGHT = 1.15; // em — one digit height inside the reel
const OVERSHOOT_EM = 0.06; // ~2px at text-5xl

function formatCommas(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-US');
}

/** One digit reel (0-9) that lands on `target`. */
function DigitReel({
  target,
  delaySec,
  durationSec,
  prefersReduced,
}: {
  target: number;
  delaySec: number;
  durationSec: number;
  prefersReduced: boolean;
}) {
  // Start at 0 so the reel always "spools up" from 0.
  const [settled, setSettled] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) {
      setSettled(true);
      return;
    }
    setSettled(false);
    const t = window.setTimeout(
      () => setSettled(true),
      Math.round((delaySec + durationSec) * 1000)
    );
    return () => window.clearTimeout(t);
  }, [target, delaySec, durationSec, prefersReduced]);

  // The reel is a vertical column of 0-9 + the target digit again, so the
  // final rest position is at `-(10 + target) * DIGIT_HEIGHT` em. Spinning
  // through a full 0-9 cycle before settling feels like a slot machine.
  const finalY = prefersReduced
    ? `-${target * DIGIT_HEIGHT}em`
    : `-${(10 + target) * DIGIT_HEIGHT}em`;

  const bounce = prefersReduced
    ? { duration: 0 }
    : {
        duration: durationSec,
        delay: delaySec,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      };

  return (
    <span
      className="relative inline-block overflow-hidden align-baseline"
      style={{ height: `${DIGIT_HEIGHT}em`, width: '0.58em' }}
      aria-hidden="true"
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: finalY }}
        transition={bounce}
        className="flex flex-col leading-none"
        style={{ lineHeight: `${DIGIT_HEIGHT}em` }}
      >
        {/* 0-9, then target again for the overshoot/settle */}
        {Array.from({ length: 11 }).map((_, i) => {
          const d = i < 10 ? i : target;
          return (
            <span
              key={i}
              className="block text-center"
              style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
            >
              {d}
            </span>
          );
        })}
      </motion.span>
      {/* Overshoot bounce — scale Y briefly once the reel settles. */}
      {settled && !prefersReduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ y: OVERSHOOT_EM + 'em' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.18, ease: [0.25, 1.4, 0.5, 1] as const }}
        />
      )}
    </span>
  );
}

export function DigitMorph({
  value,
  prefix,
  suffix,
  direction = 'rtl',
  baseDelay = 0,
  staggerMs = 60,
  durationMs = 700,
  className,
  ariaLabel,
}: Props) {
  const prefersReduced = useReducedMotion() ?? false;

  const text = typeof value === 'number' ? formatCommas(value) : String(value);
  const chars = useMemo(() => text.split(''), [text]);

  // Total number of digits (for rtl staggering).
  const digitIndices = chars
    .map((c, i) => ({ c, i }))
    .filter((x) => /\d/.test(x.c));
  const digitCount = digitIndices.length;

  // Compute a per-character delay. Non-digits (commas/dashes/etc.) fade in
  // with the same delay as the adjacent digit so the whole thing moves
  // as a unit.
  const delayFor = (i: number): number => {
    const idxInDigits = digitIndices.findIndex((x) => x.i === i);
    if (idxInDigits < 0) return baseDelay / 1000;
    const ordinal =
      direction === 'rtl' ? digitCount - 1 - idxInDigits : idxInDigits;
    return baseDelay / 1000 + (ordinal * staggerMs) / 1000;
  };

  const durationSec = durationMs / 1000;

  if (prefersReduced) {
    // Snap to final. Keep the className so sizing matches.
    return (
      <span className={className} aria-label={ariaLabel} role="text">
        {prefix}
        {text}
        {suffix}
      </span>
    );
  }

  return (
    <span
      className={`${className ?? ''} inline-flex items-baseline tabular-nums`}
      aria-label={ariaLabel ?? (prefix ?? '') + text + (suffix ?? '')}
      role="text"
    >
      {prefix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: baseDelay / 1000 }}
        >
          {prefix}
        </motion.span>
      )}
      {chars.map((c, i) => {
        if (/\d/.test(c)) {
          return (
            <DigitReel
              key={`${i}-${c}`}
              target={Number(c)}
              delaySec={delayFor(i)}
              durationSec={durationSec}
              prefersReduced={prefersReduced}
            />
          );
        }
        // Comma / dash / space / $ — fade in with its own delay.
        return (
          <motion.span
            key={`${i}-${c}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: delayFor(i),
            }}
            className="inline-block"
          >
            {c === ' ' ? '\u00A0' : c}
          </motion.span>
        );
      })}
      {suffix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            delay: (baseDelay + digitCount * staggerMs + durationMs) / 1000,
          }}
        >
          {suffix}
        </motion.span>
      )}
    </span>
  );
}
