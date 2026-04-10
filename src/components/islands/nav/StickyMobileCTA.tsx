import { useEffect, useState } from 'react';

/**
 * StickyMobileCTA — a bottom-pinned "Show Me My Cash →" button that
 * appears on mobile once the user scrolls past the hero + form, and
 * hides again when the form section comes back into view.
 *
 * Why: 85% of Meta traffic is mobile. Once a scroller is below the
 * form, the only way back is to scroll-to-top or tap a link. This
 * gives them a persistent, one-thumb re-entry point to the Cash Card
 * without nagging them while they're already in the form.
 *
 * Visibility rules:
 *   - Only renders on viewports < 768px (mobile)
 *   - Hidden until the user has scrolled past the BOTTOM of the
 *     #cash-card-form section (i.e. they abandoned or missed it)
 *   - Hidden again while the form section is actively in view
 *     (IntersectionObserver on #cash-card-form)
 *   - Respects prefers-reduced-motion by skipping the slide-up animation
 *
 * Brand constraints: uses the same "Show Me My Cash →" CTA string from
 * the hero content file (via data attribute rendered by the Astro
 * wrapper), anchors to #cash-card-form. No phone number, no timer.
 */

interface Props {
  label: string;
}

export function StickyMobileCTA({ label }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run on mobile. matchMedia is cheaper than resize listeners
    // and fires when the viewport crosses the breakpoint.
    const mq = window.matchMedia('(max-width: 767px)');
    let isMobile = mq.matches;

    const target = document.getElementById('cash-card-form');
    if (!target) {
      return;
    }

    let formInView = false;
    let pastForm = false;

    const update = () => {
      // Show only on mobile, AND only if the user has scrolled past the
      // form AND the form itself isn't currently visible on screen.
      setVisible(isMobile && pastForm && !formInView);
    };

    // IntersectionObserver tells us when the form section is in view.
    // threshold 0 means "any pixel of the section is visible."
    const io = new IntersectionObserver(
      ([entry]) => {
        formInView = entry.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: '0px 0px -20% 0px' }
    );
    io.observe(target);

    // A scroll listener updates "have we scrolled past the form?"
    // rather than relying on the observer alone. pastForm is sticky —
    // once true, it stays true unless the user scrolls back above the
    // form's top. This prevents flicker when the form is in view and
    // the user is deciding whether to engage.
    const handleScroll = () => {
      const rect = target.getBoundingClientRect();
      // "Past the form" = the form's bottom is above the top of the
      // viewport (fully scrolled past).
      pastForm = rect.bottom < 0;
      update();
    };

    const handleMqChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
      update();
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    mq.addEventListener('change', handleMqChange);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', handleScroll);
      mq.removeEventListener('change', handleMqChange);
    };
  }, []);

  // SSR-safe: render nothing until mounted so the server HTML and the
  // first client paint match. The element is absent from the DOM
  // entirely until we know we're on mobile and past the form.
  if (!mounted) return null;

  return (
    <div
      className={`sticky-cta fixed inset-x-0 bottom-0 z-40 md:hidden ${
        visible ? 'sticky-cta--visible' : 'sticky-cta--hidden'
      }`}
      aria-hidden={!visible}
    >
      {/* Safe-area padding so the button clears the iOS home indicator */}
      <div
        className="border-t border-white/10 bg-ink/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <a
          href="#cash-card-form"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-accent px-6 py-4 text-base font-bold tracking-wide text-white shadow-lg transition-transform duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          tabIndex={visible ? 0 : -1}
        >
          <span>{label}</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
