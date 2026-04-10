import { useEffect, useRef } from 'react';

/**
 * ScrollProgress — a 3px gold→red gradient bar pinned to the top of the
 * viewport that fills from 0% → 100% as the user scrolls the page.
 *
 * Why: gives a low-intent Meta scroller a subtle dopamine cue that they're
 * "making progress" through the page without showing a big obtrusive
 * progress widget. It also hints at how much more there is to read — a
 * small commitment device that nudges them toward the final CTA.
 *
 * Implementation notes:
 *   - The bar width is written to a CSS custom property (`--scroll-progress`)
 *     on the inner `<div class="scroll-progress__bar">`. React doesn't
 *     re-render on scroll — the frame loop writes the style prop directly.
 *   - Uses requestAnimationFrame to throttle scroll events to 60fps.
 *   - Respects prefers-reduced-motion: no CSS transition on the width,
 *     but the value still updates so the bar remains useful as a cue.
 *   - z-index 50 keeps it above the sticky header but below any modals.
 */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollable = doc.scrollHeight - window.innerHeight;

      // Guard against pages shorter than the viewport (where scrollable
      // is 0) so we don't divide by zero and paint NaN% into the CSS.
      if (scrollable <= 0) {
        if (barRef.current) {
          barRef.current.style.setProperty('--scroll-progress', '0%');
        }
        return;
      }

      const pct = Math.max(0, Math.min(1, scrollTop / scrollable));
      if (barRef.current) {
        barRef.current.style.setProperty(
          '--scroll-progress',
          `${(pct * 100).toFixed(2)}%`
        );
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    // Paint an initial value so the bar shows the correct progress if
    // the user lands on a deep-linked hash (e.g., #cash-card-form).
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="scroll-progress" role="presentation" aria-hidden="true">
      <div ref={barRef} className="scroll-progress__bar" />
    </div>
  );
}
