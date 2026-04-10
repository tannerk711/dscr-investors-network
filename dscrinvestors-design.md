# DSCR Investors Network Design System
## Landing Page Design Reference for DSCRinvestors.net

> **⚠️ STATUS (2026-04-09): Largely superseded by `master-build-plan.md`.** The Apr 9 Zoom killed the rate-reveal 7-step form, Calendly flow, phone-number CTAs, founder-name branding, and "licensed in N states" trust badges that this doc prescribes. Use this file only for design-system primitives (colors, type, spacing, components, motion patterns) — NOT for copy, section architecture, or funnel flow. When in doubt, `master-build-plan.md` is canonical.
>
> **Customer-facing copy rules that override everything below:**
> - Never say "licensed," specific state counts, or individual team member names (Anthony, Ann, etc.). DSCR Investors Network is marketed as a company, not personalities. Internal operational truth: the team actively does deals across most of the U.S., but Meta ads are targeted to a 10-state subset for loan-size and close-rate reasons — that subset is NEVER surfaced to leads.
> - Never show rate, DSCR ratio, or LTV percentage. Only "cash in hand at close" and "monthly cash flow."
> - No phone number, no Calendly, no live transfer. Follow-up is Salesforce → Platinum LO outbound call within 2 business hours.

> Original intro (preserved for design-primitive context only): Design spec for the DSCR Investors Network refinance landing page. Built for Facebook paid ad traffic. Audience: 1-4 unit non-owner-occupied rental owners with equity locked up by tax write-offs. Network of 7 wholesale DSCR lenders, Salesforce CRM, Platinum-tier loan officers.

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Tech Stack](#tech-stack)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Border Radius](#border-radius)
7. [Shadows](#shadows)
8. [Transitions & Easing](#transitions--easing)
9. [CSS Foundation](#css-foundation)
10. [Component Patterns](#component-patterns)
11. [Animation System](#animation-system)
12. [Multistep Form System](#multistep-form-system)
13. [Page Section Order & Copy](#page-section-order--copy)
14. [Responsive Strategy](#responsive-strategy)
15. [Accessibility](#accessibility)
16. [Performance & SEO](#performance--seo)
17. [Micro-Interactions](#micro-interactions)
18. [Analytics & Tracking](#analytics--tracking)
19. [Quick Reference Table](#quick-reference-table)

---

## Design Philosophy

**Institutional. Directional. Investor-to-investor. No consumer mortgage softness.**

The aesthetic reads as capital markets, not retail bank branch. Dark navy anchors authority, white and off-white carry content, and a single red accent earns its place only on the primary CTA button (echoing the logo roof). Inter does all the typographic work across weights. The hero leads with a working rate engine, not a stock photo of a couple shaking hands.

**Core principles:**
- **Navy carries the authority, red only earns the CTA.** Red is demoted to accent-only use. It appears on the primary button and occasionally a trust-badge outline. Nowhere else. Navy #1B2E4B is darker and more directional than generic bank blue.
- **One dark section is a visual anchor.** The hero and the final CTA both sit on ink #0F1C02E. Everything else alternates white and navy-light to give the page rhythm.
- **Show the rate, do not hide it.** Competitors all force "Apply Now" with no value exchange. This page gives a real rate range above the fold in exchange for 6 form answers. The contact step is the gate, not the rate.
- **Generous whitespace, tight copy.** Sections breathe with 64-96px vertical padding. Copy is 12-16 word declarative sentences. No corporate throat-clearing.
- **Grounded radius, architectural icons.** 12-16px corners on cards and buttons. Icons are 1.5px outlined on a 24px grid. Nothing bubbly, nothing cartoony.
- **Motion that earns its presence.** Scroll reveals, form step slides, animated checkmark on success. Nothing decorative.
- **Mobile-first, form-first.** The instant quote calculator is visible above the fold on mobile, not collapsed into a modal or pushed below the headline. Facebook traffic is 85% mobile.

---

## Tech Stack

| Layer | Tool | Version | Purpose |
|-------|------|---------|---------|
| Framework | Astro | 5.x | Static-first output, React islands for interactive parts |
| UI Library | React | 19.x | Islands: instant quote form, FAQ accordion, any interactive component |
| Styling | Tailwind CSS | 4.x | Utility-first, all tokens defined in CSS `@theme` block |
| Scroll Animation | GSAP + ScrollTrigger | 3.14.x | Below-fold reveal animations, hero entrance timeline |
| Component Animation | Framer Motion | 12.x | Form step transitions, selection card animations, SVG paths |
| Form State | react-hook-form | 7.x | Contact step validation (name, phone, email, consent) |
| Number Formatting | react-number-format | 5.x | Currency inputs for property value, loan balance, rent |
| Sliders | @radix-ui/react-slider | 1.x | Accessible sliders for property value, loan balance, rent inputs |
| Accordion | @radix-ui/react-accordion | 1.x | FAQ accordion |
| State Management | Nanostores | 1.x | Lightweight form state with localStorage persistence |
| Validation | Zod | 3.x | Schema-based form validation |
| Deployment | Vercel | - | Static hosting with edge CDN |
| Build Plugin | @tailwindcss/vite | 4.x | Tailwind 4 Vite integration (no tailwind.config.mjs needed) |

**Removed from newpad base:** Embla Carousel (no image carousel on this page; if a testimonial carousel is added later, reintroduce it).

**Key architecture pattern:** Astro handles all static HTML. The instant quote form mounts as a React island via `client:load` (above-fold, must be interactive immediately). The FAQ accordion mounts via `client:visible`. GSAP runs in a vanilla `<script>` tag, not inside React. The pricing matrix for the quote engine lives as a static JSON object inside the form component. No backend API call required to generate the quote. Only the final lead submission hits the GoHighLevel webhook.

---

## Color System

### Brand Palette

| Token | Hex | Role |
|-------|-----|------|
| `navy` | `#1B2E4B` | Primary accent. Nav, active states, links, stat block numbers, button outlines, section labels |
| `navy-light` | `#EEF2F7` | Section tints, card backgrounds, subtle fills, alternating section bg |
| `navy-dark` | `#0D1A2B` | Deep footer background, muted text on dark sections |
| `ink` | `#0F1C2E` | Body text, dark headings, hero background, final CTA section background |
| `ink-light` | `#2A3F5A` | Hover states, secondary text on light bg |
| `red-accent` | `#C0392B` | CTA buttons only. Echoes the logo roof. Occasional use on trust badge outline |
| `success` | `#2D7A4F` | Checkmarks, approval indicators, progress bar fill |
| `gold` | `#B8922A` | Star ratings, trust badges, "$180M+ funded" indicator |
| `white` | `#FFFFFF` | Card surfaces, body background, input fields |
| `off-white` | `#F4F6F9` | Page section alternating bg, cool ice tone |

### Neutral Palette

| Token | Hex | Role |
|-------|-----|------|
| `gray-100` | `#F0F2F5` | Very light background fills |
| `gray-200` | `#D9DDE4` | Borders, dividers, unselected card borders, progress bar track |
| `gray-300` | `#B0B8C4` | Disabled button backgrounds, inactive states |
| `gray-400` | `#8491A3` | Muted body text, form placeholders, metadata labels |
| `gray-500` | `#5C6A7A` | Secondary body text, descriptions, subheadings |
| `gray-600` | `#3A4655` | Strong secondary text, body on light sections |

### Error/Validation Colors (system)

| Token | Hex | Role |
|-------|-----|------|
| `red-400` | `#EF4444` | Error border on invalid form fields |
| `red-500` | `#DC2626` | Error message text |

### Color Context Rules

**Light sections** (content, loan programs, real numbers, testimonials, FAQ):
- Background: `white` or `off-white` or `navy-light` (alternating)
- Text: `ink` (headings), `gray-600` to `gray-500` (body), `gray-400` (metadata)
- Cards: `white` with `gray-200` border and `shadow-md`
- Buttons: `red-accent` bg with `white` text (primary CTA), or `navy` bg with `white` text (secondary)

**Dark sections** (hero, final CTA, footer):
- Background: `ink` (hero and final CTA), `navy-dark` (footer)
- Text: `white` (headings), `gray-300` (body/muted)
- Buttons: `red-accent` bg with `white` text
- Icons/trust signals: `gray-300` strokes, `gold` for star ratings, `success` green for checkmarks

**Alternating section pattern (linear scroll):**
1. Hero (ink dark)
2. Trust Bar (navy-light)
3. Loan Programs (white)
4. Real Numbers (navy-light)
5. Testimonials (off-white)
6. FAQ (white)
7. Final CTA (ink dark)
8. Footer (navy-dark)

### Text Selection
```css
::selection {
  background-color: #1B2E4B; /* navy */
  color: #FFFFFF;
}
```

---

## Typography

### Font Stack

**Single font family:** Inter (Google Fonts)

```
'Inter', system-ui, -apple-system, sans-serif
```

Weights loaded: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

**Why one font:** Inter covers every role from display headlines at 800 weight to body text at 400. Screen-optimized, free, optically consistent across breakpoints. No font-swap jank, no managing multiple font files, faster loading. Professional without the corporate stiffness of Helvetica or the try-hard of Freight Display.

### Type Scale

| Token | Mobile | Desktop | Weight | Tracking | Line-Height |
|-------|--------|---------|--------|----------|-------------|
| display | 36px | 60px | 800 | -0.03em | 1.05 |
| h1 | 30px | 48px | 700 | -0.025em | 1.1 |
| h2 | 24px | 36px | 700 | -0.02em | 1.15 |
| h3 | 20px | 28px | 600 | -0.01em | 1.2 |
| h4 | 18px | 22px | 600 | 0 | 1.3 |
| body-lg | 17px | 18px | 400 | 0 | 1.65 |
| body | 15px | 16px | 400 | 0 | 1.7 |
| body-sm | 14px | 14px | 400 | 0.01em | 1.6 |
| caption | 12px | 12px | 500 | 0.04em | 1.5 |
| label | 11px | 12px | 600 | 0.08em | 1.4 |
| cta-text | 15px | 16px | 700 | 0.02em | 1 |

### Typography Rules
- Base `line-height: 1.7` on body, `1.65` on body-lg
- Headings use `tracking-tight` (`-0.02em` to `-0.03em`) for visual density
- Subheadings under H2s are `text-lg text-gray-500` with `leading-relaxed`
- Form labels/metadata: `text-xs text-gray-400`
- Error text: `text-xs text-red-500`
- Step indicator: `text-xs text-gray-300`
- `label` token is used as eyebrows above H2s (uppercase, tracked 0.08em)
- `tabular-nums` on all stat block numbers, rate displays, dollar figures
- Number formatting for rates: `6.875%` not `6.87%` (always round to nearest 0.125%)
- Dollar figures: `$450,000` with thousands separators, no decimals

### Font Loading Strategy
```html
<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Async load (non-render-blocking) -->
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
  rel="stylesheet" media="print" onload="this.media='all'" />

<!-- Fallback for no-JS -->
<noscript>
  <link href="...Inter..." rel="stylesheet" />
</noscript>
```

Font smoothing enabled globally:
```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Voice & Copy Rules

**Voice: Direct. Credible. Fluent. Lean. Decisive.**

- Short declarative sentences, 12-16 words
- Lead with outcome, not process
- Active present tense in headlines
- Investor-to-investor register
- Use insider language: DSCR, LTV, cash-out, rate-and-term, seasoning, doors, PITIA, BRRRR, portfolio, LLPA, no-doc, non-QM, LLC-vested, appraisal value, rent roll, step-down prepay, Fannie cap

**Example body paragraph:**
"A DSCR refi does not care what you made last year. It qualifies based on one number: does the gross monthly rent cover the PITIA? If the property pencils at 1.0x or better, you have a loan. We lend on single-family, 2-4 unit, condos, and short-term rentals up to 80% LTV on rate-and-term, 75% on cash-out. Entity vesting through an LLC or LP is standard, not an exception. No tax returns, no pay stubs, no employment verification. Just the appraisal, the lease or rental analysis, and 21 days to close."

**Banned words (never use in copy):** discover, unlock, elevate, seamlessly, leverage, cutting-edge, delve, comprehensive, transformative, robust, curated, tailored, empower, journey, simple, fast, easy, game-changer, hassle-free, one-stop shop, innovative, streamlined (unless describing a literal underwriting step), "your dreams", "wealth-building", "financial freedom", "we treat you like family".

**No em dashes.** Use periods, commas, or spaced hyphens.

---

## Spacing & Layout

### Container
```
max-width: 80rem (1280px) — max-w-7xl
horizontal padding: px-4 (16px) / sm:px-6 (24px) / lg:px-8 (32px)
centered: mx-auto
```

### Section Spacing

| Context | Mobile | Desktop |
|---------|--------|---------|
| Section vertical padding | `py-16` (64px) | `md:py-24` (96px) |
| Hero top padding | `pt-24` (96px) | `md:pt-32` (128px) - accounts for sticky header |
| Hero bottom padding | `pb-16` (64px) | `md:pb-24` (96px) |
| Trust bar padding | `py-8` (32px) | `md:py-10` (40px) |
| Footer padding | `py-10` (40px) | `md:py-12` (48px) |

### Content Spacing

| Element | Value | Tailwind |
|---------|-------|----------|
| Eyebrow label to H2 | 12px | `mt-3` |
| Section heading to subhead | 16px | `mt-4` |
| Subhead to content grid | 48px | `mt-12` |
| Content grid to CTA | 40px | `mt-10` |
| Card internal padding | 16-32px | `p-4 sm:p-6 md:p-8` |
| Grid gap (cards) | 24px | `gap-6` |
| Form field gap | 12px | `space-y-3` |
| Form step vertical rhythm | 20px | `space-y-5` |
| Inline element gap | 8-16px | `gap-2` to `gap-4` |

### Grid Patterns

**3-column loan program grid:**
```
grid gap-6 md:grid-cols-3
```

**2-column hero (headline + instant quote form):**
```
grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-16
```

Note: `items-start` (not `items-center`) because the form container is taller than the headline block and should align to the top.

**5-column trust bar (desktop):**
```
grid gap-6 grid-cols-2 md:grid-cols-5
```
Mobile collapses to 2-col grid. If 5 won't fit cleanly, show top 3.

**3-column real numbers grid:**
```
grid gap-6 md:grid-cols-3
```

**3-column testimonials grid:**
```
grid gap-6 md:grid-cols-3
```

**3-column footer:**
```
grid gap-8 md:grid-cols-3 md:items-start
```

**2-column form name fields (contact step):**
```
grid grid-cols-2 gap-3
```

### Section Centering Pattern
Most section text blocks are centered with max-width:
```
mx-auto max-w-3xl text-center
```

Exceptions: Hero (2-column asymmetric), Real Numbers (can be left-aligned with data tables).

---

## Border Radius

| Element | Value | Tailwind Class |
|---------|-------|----------------|
| Major cards (testimonials, program cards, form container) | 16px | `rounded-2xl` |
| Buttons (primary, secondary) | 12px | `rounded-xl` |
| Form inputs | 12px | `rounded-xl` |
| Selection cards (form) | 12px | `rounded-xl` |
| Icon containers | 8px | `rounded-lg` |
| Phone CTA button (header) | 8px | `rounded-lg` |
| Progress bar segments | 50% | `rounded-full` |
| Avatar circles | 50% | `rounded-full` |
| Status badges, rate pills | 50% | `rounded-full` |
| FAQ accordion items | 12px | `rounded-xl` |
| Slider track/thumb | 50% | `rounded-full` |

**Design rule:** Nothing is pill-shaped at the card/button level. The roundness is grounded and architectural. Only small indicators (progress dots, avatars, badges, rate range pill on quote screen) use full rounding.

---

## Shadows

All shadows use the brand's ink base color (ink: `rgb(15, 28, 46)`) at low opacity. This keeps shadows cool and directional rather than gray-default.

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(15, 28, 46, 0.10)` | Inputs, subtle lift, borders |
| `shadow-md` | `0 4px 12px rgba(15, 28, 46, 0.14)` | Cards at rest, sticky header on scroll, selection card selected |
| `shadow-lg` | `0 8px 24px rgba(15, 28, 46, 0.18)` | Card hover states, sticky nav, hero cards |
| `shadow-xl` | `0 16px 40px rgba(15, 28, 46, 0.22)` | Form container (hero), modal overlays, primary elevation |
| `shadow-focus` | `0 0 0 3px rgba(27, 46, 75, 0.30)` | Focus rings (navy at 30% opacity) |
| `shadow-inset` | `inset 0 1px 3px rgba(15, 28, 46, 0.12)` | Pressed states, slider track depressed state |

**Shadow transition pattern:**
```
Cards: shadow-md -> hover:shadow-lg
Buttons: no shadow -> hover:shadow-lg or hover:shadow-xl
Form container: shadow-xl (always elevated, hero prominence)
Header: no shadow at top -> shadow-md on scroll past 50px
```

**Custom shadow for CTA button pulse (when form is complete):** Used on the instant quote form's submit button when all fields are valid:
```
box-shadow: 0 0 0 6px rgba(192, 57, 43, 0.25) /* red-accent pulse at 25% */
```

---

## Transitions & Easing

### Easing Curves

| Name | Value | Usage |
|------|-------|-------|
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Standard UI transitions, CSS animations, form step slides |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot (used sparingly on success checkmark container) |
| `power2.out` | GSAP built-in | Scroll reveals, hero entrance |
| `power3.out` | GSAP built-in | Loan program cards stagger (slightly snappier) |
| `back.out(1.4)` | GSAP built-in | Final CTA button (subtle bounce) |
| `easeOut` | Framer Motion | SVG path animations (checkmark draw, circle) |
| `easeInOut` | Framer Motion | Pulsing shadow loop on submit button |

### Duration Table

| Animation Type | Duration | Notes |
|----------------|----------|-------|
| UI hover/focus | 300ms | `transition-all duration-300` or `transition-colors` |
| Button hover | 200ms | Slightly snappier for primary CTAs |
| CSS keyframe animations | 600ms | fadeUp, fadeIn, slideInLeft, slideInRight |
| Form step slide | 300ms | Framer Motion AnimatePresence |
| Selection card stagger | 300ms per card | 60ms delay between cards |
| Progress bar fill | 400ms | scaleX animation, 100ms delay on current step |
| Slider thumb drag | instant | Native Radix slider, no animation |
| Hero entrance timeline | 600-800ms per element | 200ms initial delay, elements overlap by 300-400ms |
| Scroll reveals | 800ms | GSAP default for all below-fold sections |
| Scroll reveal stagger | 150ms between items | 120ms for loan program tiles |
| Quote calc spinner | 1200ms | Simulated calculation before rate reveal |
| Rate range reveal | 600ms | scale + opacity fade-in on rate display |
| SVG checkmark draw | 300-500ms | Circle: 500ms, checkmark: 400ms with 400ms delay |
| Confetti burst | ~2500ms | 60 particles, physics-based decay |
| Submit button pulse | 2000ms | Infinite loop, box-shadow breathing |
| FAQ accordion expand | 250ms | Radix default, ease-out |

---

## CSS Foundation

### Global Styles (global.css)

```css
@import "tailwindcss";

@theme {
  /* Brand palette */
  --color-navy: #1B2E4B;
  --color-navy-light: #EEF2F7;
  --color-navy-dark: #0D1A2B;
  --color-ink: #0F1C2E;
  --color-ink-light: #2A3F5A;
  --color-red-accent: #C0392B;
  --color-success: #2D7A4F;
  --color-gold: #B8922A;
  --color-white: #FFFFFF;
  --color-off-white: #F4F6F9;

  /* Neutrals */
  --color-gray-100: #F0F2F5;
  --color-gray-200: #D9DDE4;
  --color-gray-300: #B0B8C4;
  --color-gray-400: #8491A3;
  --color-gray-500: #5C6A7A;
  --color-gray-600: #3A4655;

  /* Fonts */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;

  /* Type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;

  /* Spacing */
  --spacing-section: 6rem;
  --spacing-section-mobile: 4rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* Shadows using ink rgb(15, 28, 46) */
  --shadow-sm: 0 1px 3px rgba(15, 28, 46, 0.10);
  --shadow-md: 0 4px 12px rgba(15, 28, 46, 0.14);
  --shadow-lg: 0 8px 24px rgba(15, 28, 46, 0.18);
  --shadow-xl: 0 16px 40px rgba(15, 28, 46, 0.22);
  --shadow-focus: 0 0 0 3px rgba(27, 46, 75, 0.30);
  --shadow-inset: inset 0 1px 3px rgba(15, 28, 46, 0.12);

  /* Easing */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  color: var(--color-ink);
  background-color: var(--color-white);
  line-height: 1.7;
}

::selection {
  background-color: var(--color-navy);
  color: var(--color-white);
}

:focus-visible {
  outline: 2px solid var(--color-navy);
  outline-offset: 2px;
}

/* Tabular numerals on all numeric display */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

### CSS Keyframe Animations (fallbacks for non-JS)

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulseRed {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0); }
  50% { box-shadow: 0 0 0 6px rgba(192, 57, 43, 0.25); }
}

.animate-fade-up { animation: fadeUp 0.6s var(--ease-out) forwards; }
.animate-fade-in { animation: fadeIn 0.6s var(--ease-out) forwards; }
.animate-slide-in-left { animation: slideInLeft 0.6s var(--ease-out) forwards; }
.animate-slide-in-right { animation: slideInRight 0.6s var(--ease-out) forwards; }
.animate-pulse-red { animation: pulseRed 2s var(--ease-out) infinite; }

/* Stagger delays */
.animate-delay-100 { animation-delay: 100ms; opacity: 0; }
.animate-delay-200 { animation-delay: 200ms; opacity: 0; }
.animate-delay-300 { animation-delay: 300ms; opacity: 0; }
.animate-delay-400 { animation-delay: 400ms; opacity: 0; }
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

GSAP also checks `prefers-reduced-motion` and skips all animations, showing elements instantly. Framer Motion respects it automatically.

---

## Component Patterns

### Sticky Header

```
Position: fixed top-0 left-0 right-0 z-50
Height: h-16 (64px mobile) / md:h-20 (80px desktop)
Container: max-w-7xl, centered
Layout: flex justify-between items-center px-4 sm:px-6 lg:px-8
```

**Logo (left):**
- DSCR Investors Network logo (red house-roof silhouette, navy star inside, navy wordmark)
- Height: `h-9` mobile, `h-11` desktop
- Alt: "DSCR Investors Network"

**Right cluster:**
- NMLS number (hidden on mobile, visible `sm:`): `text-xs text-gray-500 tabular-nums`
- Phone CTA: `rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-ink-light transition-colors`
- Phone icon + number on mobile, "Call: (XXX) XXX-XXXX" on desktop

**Scroll behavior (vanilla JS, throttled via requestAnimationFrame):**
- Default (top): transparent background, no shadow, logo visible, white text on hero dark bg
- After 50px scroll: `bg-white/95 backdrop-blur-md shadow-md`, text switches to ink
- Transition: `transition-all duration-300`

**No navigation menu.** This is a pure ad landing page. Logo + phone CTA only.

### Hero Section

```
Layout: relative overflow-hidden bg-ink
Top padding: pt-24 md:pt-32 (clears sticky header)
Bottom padding: pb-16 md:pb-24
Grid: md:grid-cols-2, items-start, gap-8 md:gap-12 lg:gap-16
```

**Background:**
- Solid ink #0F1C2E base
- Optional: subtle navy radial gradient in top-right corner (`bg-gradient-to-br from-navy/20 via-transparent to-transparent`)
- No stock photography behind hero. The form carries the visual weight.

**Left column (headline block, `md:col-span-1`):**
- Eyebrow label: `text-xs font-semibold uppercase tracking-widest text-gray-300` - "DSCR Refinance"
- H1: `text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight`
- Subhead: `mt-5 text-lg text-gray-300 leading-relaxed max-w-xl`
- Trust badges: `mt-8 flex flex-wrap items-center gap-4`

**Right column (instant quote form, `md:col-span-1`):**
- Form container: `rounded-2xl bg-white p-5 sm:p-7 md:p-8 shadow-xl`
- Always visible on mobile. Never collapse into modal or accordion.

**Trust badges pattern (below hero subhead):**
```
flex flex-wrap items-center gap-4
Each badge: flex items-center gap-2 text-sm font-medium text-gray-300
Icon: h-4 w-4 text-success (checkmark circle SVG) or text-gold (star)
```

Five trust elements above fold:
1. Shield icon + "NMLS #[XXXXXX]"
2. Five gold stars + "4.9 (200+ Reviews)"
3. Bar chart icon + "$180M+ Funded"
4. Calendar icon + "21-Day Avg Close"
5. Map pin icon + "Licensed in 40 States"

### Section Pattern (repeated across all content sections)

```html
<section id="section-name" class="bg-white py-16 md:py-24">
  <!-- or bg-navy-light / bg-off-white for alternating sections -->
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Centered heading block -->
    <div class="mx-auto max-w-3xl text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-navy">Eyebrow Label</p>
      <h2 class="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">Section Heading</h2>
      <p class="mt-4 text-lg text-gray-500 leading-relaxed">Section subhead.</p>
    </div>
    <!-- Content grid -->
    <div class="mt-12 grid gap-6 md:grid-cols-3">...</div>
    <!-- CTA -->
    <div class="mt-10 text-center">...</div>
  </div>
</section>
```

### Card Pattern (Testimonial)

```html
<div class="flex flex-col rounded-2xl bg-white p-5 shadow-md
            transition-shadow hover:shadow-lg sm:p-6 md:p-8
            border border-gray-200">
  <!-- Stars row -->
  <div class="mb-4 flex gap-1">
    <!-- 5x gold star SVGs, h-5 w-5 text-gold, filled -->
  </div>
  <!-- Highlight quote -->
  <p class="mb-3 text-base font-semibold italic text-ink sm:text-lg leading-snug">
    "They closed my BRRRR refi in 19 days. No tax returns."
  </p>
  <!-- Full quote -->
  <p class="flex-1 text-sm leading-relaxed text-gray-500">
    "I'd been stuck with a hard money bridge at 12.5 percent for four months because no bank
    would touch my self-employed return. DSCR Investors Network qualified me on the rent roll,
    pulled 75 percent LTV cash-out, and closed in 19 days. Rate came in at 6.875."
  </p>
  <!-- Attribution -->
  <div class="mt-6 flex items-center gap-3 border-t border-gray-200 pt-4">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full bg-navy-light text-sm font-bold text-navy">
      MR
    </div>
    <div>
      <p class="font-semibold text-ink">Marcus R.</p>
      <p class="text-xs text-gray-400">12 doors, Indianapolis</p>
    </div>
  </div>
</div>
```

### Loan Program Card Pattern

```html
<div class="group relative flex flex-col rounded-2xl border border-gray-200
            bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg md:p-8">
  <!-- Icon container -->
  <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-light">
    <svg class="h-6 w-6 text-navy" stroke-width="1.5">
      <!-- Outlined icon: cash-out arrow / refi cycle / question mark -->
    </svg>
  </div>
  <!-- Title -->
  <h3 class="mt-5 text-xl font-bold text-ink md:text-2xl tracking-tight">
    Cash-Out Refinance
  </h3>
  <!-- Max LTV pill -->
  <p class="mt-2 inline-flex self-start rounded-full bg-navy-light px-3 py-1
            text-xs font-semibold text-navy tabular-nums">
    Up to 75% LTV
  </p>
  <!-- Description -->
  <p class="mt-4 flex-1 text-base leading-relaxed text-gray-500">
    Pull equity out of your rental without touching your personal income docs.
    Up to 75% LTV.
  </p>
  <!-- CTA link -->
  <a href="#quote" class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy
                          transition-transform group-hover:translate-x-1">
    Get My Rate
    <svg class="h-4 w-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  </a>
</div>
```

### Primary Button Patterns

**Red CTA button (primary, on light backgrounds):**
```
rounded-xl bg-red-accent px-7 py-4 text-base font-bold text-white
transition-all duration-200 hover:bg-[#A8331F] hover:shadow-lg
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-accent
```

**Red CTA button (primary, on dark backgrounds - final CTA):**
```
rounded-xl bg-red-accent px-8 py-4 text-lg font-bold text-white
transition-all duration-200 hover:bg-[#A8331F] hover:shadow-xl
```

**Navy secondary button (rare, mostly for header phone CTA):**
```
rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white
transition-colors hover:bg-ink-light
```

**Ghost button (on dark backgrounds, "Call Us Now" secondary):**
```
rounded-xl border-2 border-gray-300 px-6 py-3 text-base font-semibold text-white
transition-colors hover:bg-white/10
```

**All primary buttons include an arrow icon:**
```html
<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5">
  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
</svg>
```

**CTA button language options:**
1. "Get My Rate, No Credit Pull"
2. "Check DSCR Eligibility"
3. "See Today's Rate Sheet"
4. "Start My Refi Application"
5. "Get a Same-Day Quote"
6. "Run My Loan Scenario"
7. "Talk to a DSCR Specialist"
8. "Check If My Property Qualifies"

Primary hero CTA (on form submit inside quote engine): "Get My Rate, No Credit Pull"
Final CTA section button: "Get My DSCR Rate Now"

### Dark Section Pattern (Final CTA)

```html
<section class="bg-ink py-16 md:py-24 relative overflow-hidden">
  <!-- Subtle navy glow in corner -->
  <div class="absolute -top-20 -right-20 h-96 w-96 rounded-full
              bg-navy/20 blur-3xl pointer-events-none"></div>
  <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
    <p class="text-xs font-semibold uppercase tracking-widest text-gray-300">
      Your Rate Is Waiting
    </p>
    <h2 class="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
      Your Rate Is Waiting. Takes 90 Seconds to See It.
    </h2>
    <p class="mt-5 text-lg leading-relaxed text-gray-300">
      No W-2s. No income docs. Just the property's rent roll and 21 days to close.
    </p>
    <div class="mt-10">
      <a href="#quote" class="inline-flex items-center gap-3 rounded-xl bg-red-accent
                              px-8 py-4 text-lg font-bold text-white transition-all
                              hover:shadow-xl">
        Get My DSCR Rate Now
        <svg class="h-5 w-5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
      </a>
    </div>
    <!-- Trust signals -->
    <div class="mt-10 flex flex-wrap items-center justify-center gap-3
                text-sm text-gray-300 sm:gap-6">
      <span class="inline-flex items-center gap-2">
        <svg class="h-4 w-4 text-success"><!-- shield check --></svg>
        No hard credit pull
      </span>
      <span class="inline-flex items-center gap-2">
        <svg class="h-4 w-4 text-success"><!-- clock --></svg>
        90-second quote
      </span>
      <span class="inline-flex items-center gap-2">
        <svg class="h-4 w-4 text-success"><!-- lock --></svg>
        NMLS #[XXXXXX]
      </span>
    </div>
  </div>
</section>
```

### Footer Pattern

```
Background: navy-dark (#0D1A2B)
Text: gray-300 body, gray-400 metadata
Border-top: none (transitions from ink final CTA to navy-dark footer)
Padding: py-10 md:py-12
Grid: md:grid-cols-3 md:items-start
```

**Left column:**
- Logo (white-on-navy variant)
- Short paragraph: "DSCR Investors Network is a licensed mortgage broker serving non-owner-occupied investment property owners across 40 states."
- NMLS disclosure: `text-xs text-gray-400 tabular-nums` - "NMLS #[XXXXXX] | Equal Housing Lender"

**Center column:**
- "Contact" label
- Phone: `text-sm text-gray-300 hover:text-white`
- Email: `text-sm text-gray-300 hover:text-white`
- Business hours

**Right column:**
- "Legal" label
- Privacy Policy, Terms, Licensing Disclosures
- `text-xs text-gray-400 hover:text-white`

**Bottom bar:**
- `border-t border-navy/30 pt-6 mt-10`
- Centered copyright: `text-xs text-gray-400`
- State licensing disclosure: `text-xs text-gray-400 max-w-3xl mx-auto text-center leading-relaxed`

**Footer legal block (full disclaimer):**
"DSCR Investors Network is a licensed mortgage broker. NMLS #[XXXXXX]. Equal Housing Lender. Results from the instant quote tool are estimates for informational purposes only and do not constitute a commitment to lend, a loan approval, or a guarantee of any specific rate or terms. Actual rates and loan terms will vary based on creditworthiness, property appraisal, income verification, reserve requirements, and final underwriting review. All loans subject to lender approval. Not available in all states. Licensed in: [state list]."

---

## Animation System

### Hero Entrance (GSAP Timeline)

Runs on `DOMContentLoaded`. No ScrollTrigger needed (above the fold).

```
Initial state: all hero elements at opacity: 0, y: 30
Timeline delay: 200ms

1. Eyebrow:  0.5s, power2.out
2. Title:    0.7s, power2.out, starts -=0.3s
3. Subhead:  0.6s, power2.out, starts -=0.4s (overlapping)
4. Badges:   0.6s, power2.out, starts -=0.3s
5. Form:     0.8s, power2.out, starts -=0.3s
```

Elements are targeted via `data-hero` attributes:
```html
<p data-hero="eyebrow">...</p>
<h1 data-hero="title">...</h1>
<p data-hero="subhead">...</p>
<div data-hero="badges">...</div>
<div data-hero="form">...</div>
```

### Scroll Reveals (GSAP + ScrollTrigger)

All below-fold sections animate in when scrolled to `top 85%` of viewport.

**Pattern:** Elements start visible (no FOUC), GSAP sets them hidden on init, then animates them in when scrolled into view.

**Target elements via `data-gsap` attributes:**
```html
<p data-gsap="eyebrow">...</p>
<h2 data-gsap="heading">...</h2>
<p data-gsap="subhead">...</p>
<div data-gsap="card">...</div>
<div data-gsap="tile">...</div>
<div data-gsap="cta">...</div>
<div data-gsap="stat">...</div>
```

**Standard reveal (heading):**
```js
// Hidden state: opacity: 0, y: 30
// Animate to: opacity: 1, y: 0
// Duration: 0.8s, ease: power2.out
```

**Staggered reveal (cards/tiles):**
```js
// Hidden state: opacity: 0, y: 50 (cards) or y: 60 (tiles)
// Stagger: 0.15s between items (0.12s for program cards)
// Program cards use power3.out and 0.9s duration for snappier feel
```

**Stat counter reveal (Real Numbers section):**
```js
// Hidden state: opacity: 0, y: 20
// Animate to: opacity: 1, y: 0
// Count-up on numeric values: 0 -> target over 1.2s
// Fires when section reaches top 80%
```

**CTA button bounce (final section):**
```js
// Hidden state: opacity: 0, y: 20, scale: 0.95
// Animate to: opacity: 1, y: 0, scale: 1
// Ease: back.out(1.4) — subtle overshoot/bounce
// Delay: 0.3s after section enters
```

**onEnterBack handler:** When scrolling back up, elements re-show quickly (0.4s) so they don't look hidden.

### Form Step Transitions (Framer Motion)

```jsx
const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
  />
</AnimatePresence>
```

Direction is tracked (+1 forward, -1 backward) so slides come from the correct side.

### Quote Reveal Animation

Between step 7 (state) and the contact gate, the form runs a short "calculation" animation:

```
1. 1200ms calc spinner: rotating navy arc on white bg, "Running your scenario..."
2. Spinner fades out (200ms)
3. "Your Estimated Rate Range" label fades up (opacity + y)
4. Rate range number scales in: scale 0.9 -> 1, opacity 0 -> 1, 600ms, ease-out
5. Summary bullets stagger in: 80ms between, 400ms each
6. "Get My Exact Rate" expand CTA fades in, 600ms delay
```

---

## Multistep Form System

The instant quote form is the primary conversion engine. It lives inside the hero as a React island (`client:load`). It collects 6-7 data points, generates a real rate range from a static pricing matrix, shows the rate, and then gates the exact rate behind a contact capture step.

### Container
```
rounded-2xl bg-white p-5 shadow-xl sm:p-7 md:p-8
```

### Form Header
```
Eyebrow: text-xs font-semibold uppercase tracking-widest text-navy
         "Instant Rate Quote"
h2:      text-xl font-bold text-ink md:text-2xl tracking-tight mt-2
         "Get Your DSCR Refi Rate in 90 Seconds"
Subtitle: text-sm text-gray-500 mt-2
         "No credit pull. No obligation. Real rate range from our lender network."
```

### Progress Bar
- 7 segments (one per data step, not counting quote reveal or contact gate)
- Track: `h-1.5 rounded-full bg-gray-200`
- Fill: `rounded-full bg-navy`
- Current step: `bg-navy` filled; future steps: `bg-gray-200`
- Animation: `scaleX` from 0 to 1, 400ms, ease-out, 100ms delay on current step
- Gap between segments: `gap-1.5`
- Has proper `role="progressbar"` with aria attributes

### Step Indicator
```
text-center text-xs text-gray-400 mt-2
"Step X of 7" with aria-live="polite"
```

### Selection Cards (Steps 1, 2, 6)

Each option is a card-style button:
```
Unselected: border-2 border-gray-200 rounded-xl p-4
            hover: border-navy/40 shadow-sm
Selected:   border-2 border-navy bg-navy-light shadow-md
```

**Icon container:**
```
Unselected: h-10 w-10 rounded-lg bg-navy-light text-navy
Selected:   h-10 w-10 rounded-lg bg-navy text-white
```

**Checkmark indicator:**
```
Circle: h-6 w-6 rounded-full
Unselected: bg-gray-200 scale-75 opacity-0
Selected:   bg-success scale-100 opacity-100
Checkmark SVG: white stroke, strokeWidth 3
Path animation: pathLength 0 to 1, 300ms
```

**Card label:** `text-sm font-semibold text-ink` (top), `text-xs text-gray-500` (subtext)

**Card entrance animation:**
```
Staggered: opacity 0 -> 1, y 12 -> 0
Duration: 300ms per card
Stagger delay: 60ms between cards
```

### Slider Inputs (Steps 3, 4, 5)

For Property Value, Current Loan Balance, and Monthly Rent.

**Layout:**
```
Label row:   flex justify-between items-center mb-3
  Left:      text-sm font-medium text-gray-500 "Property Value"
  Right:     text-xl font-bold text-ink tabular-nums "$450,000"
Text input:  w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base
             font-semibold text-ink tabular-nums focus:border-navy
             Uses react-number-format for comma-separated currency
Slider:      Radix slider, mt-4
  Track:     h-2 rounded-full bg-gray-200
  Range:     rounded-full bg-navy
  Thumb:     h-6 w-6 rounded-full bg-white border-2 border-navy shadow-md
             focus:shadow-focus
Min/max:     flex justify-between text-xs text-gray-400 mt-2 tabular-nums
             "$150K" ... "$3M+"
```

**Ranges and defaults:**
- Property Value: $150K-$3M+, default $450K, increment $25K
- Current Loan Balance: $0-$3M, capped at property value, default $270K, increment $10K
- Monthly Rent: $500-$15K, default $2,800, increment $50

**Disqualifier warnings (soft, inline):**
- Property under $300K: `text-xs text-gold mt-3` - "Most of our lenders prefer $300K+. We'll still check your options."
- Property under $150K: `text-xs text-red-500 mt-3` - "Loans under $150K have limited options. We'll let you know what's available."

### Contact Form (Gate Step)

Appears via height animation when the "Get My Exact Rate" CTA is clicked on the quote reveal screen.

**Input fields:**
```
w-full rounded-xl border-2 px-4 py-3 text-base text-ink placeholder-gray-400
outline-none transition-colors focus:border-navy
Default border: border-gray-200
Error border: border-red-400
```

**Name fields:** `grid grid-cols-2 gap-3`
**All fields gap:** `space-y-3`

**Field order:**
1. First name
2. Last name
3. Phone (react-number-format: `(XXX) XXX-XXXX`)
4. Email
5. Consent checkbox

**Consent checkbox:**
```
text-xs leading-snug text-gray-500
Checkbox: h-4 w-4 accent-navy
```

**Consent text:**
"I agree to receive a call, text, or email from DSCR Investors Network about my rate quote. No hard credit pull will be performed. Message and data rates may apply. NMLS #[XXXXXX]."

**Mid-form reassurance lines (above submit button):**
- `text-xs text-gray-400 flex items-center gap-2`
- Shield icon + "No hard credit pull. No obligation. Just your rate."
- Phone icon + "We won't call without scheduling first."

**Submit button states:**
```
Ready:    bg-red-accent text-white rounded-xl py-4 w-full font-bold text-base
          + pulsing red shadow animation (2s loop)
          Label: "Send Me My Rate"
Disabled: bg-gray-300 cursor-not-allowed
Loading:  spinning SVG circle + "Connecting you with a loan specialist..." text
```

**Pulsing shadow (when form is complete):**
```js
boxShadow: [
  '0 0 0 0 rgba(192, 57, 43, 0)',
  '0 0 0 6px rgba(192, 57, 43, 0.25)',
  '0 0 0 0 rgba(192, 57, 43, 0)',
]
// 2s duration, infinite repeat, easeInOut
```

### Success Screen

**Animated checkmark:**
```
Container: h-16 w-16 rounded-full bg-success/20, centered
Circle SVG: stroke #2D7A4F, strokeWidth 3, pathLength 0->1 in 500ms
Check SVG:  stroke #0F1C2E, strokeWidth 3, pathLength 0->1 in 400ms (400ms delay)
```

**Text stagger:**
```
Heading:     "You're all set, [FirstName]."
             delay 600ms (opacity + y)
             text-2xl font-bold text-ink

Subtitle:    "A DSCR loan specialist will call you within 15 minutes during business hours."
             delay 800ms (opacity)
             text-base text-gray-500

Rate pill:   delay 900ms
             rounded-full bg-navy-light px-4 py-2 text-sm font-semibold text-navy
             "Your estimated rate range: 6.875% - 7.500%"

CTAs:        delay 1000ms (opacity)
             Primary: "Schedule a Call" (Calendly link) - red-accent
             Secondary: "Call Us Now: (XXX) XXX-XXXX" - ghost button

Trust line:  delay 1200ms
             text-xs text-gray-400
             "No hard credit pull. No obligation. NMLS #[XXXXXX]"
```

**No video on success screen.** Clean, quiet confirmation.

**Confetti:** Canvas-based, 60 particles, brand colors
```
Colors: ['#C0392B', '#1B2E4B', '#B8922A', '#2D7A4F', '#EEF2F7']
Spawn: center of canvas
Initial velocity: vx random -6 to 6, vy random -3 to -13
Gravity: 0.15-0.25 per frame
Friction: vx *= 0.99
Opacity fade: starts at frame 40, -0.02 per frame
Particle size: 3-9px wide, 2-6px tall (rectangles)
Rotation: random spin speed
Duration: ~2500ms total
Fires: 300ms after success screen mounts
```

### Back Button
```
text-sm text-gray-400 hover:text-navy transition-colors
flex items-center gap-1
Chevron icon: h-3.5 w-3.5
Positioned top-left of form card, absolute
Hidden on step 1 and on success screen
```

### State Management (Nanostores)

Form values persist to localStorage via `@nanostores/persistent`:
- loanPurpose, propertyType, propertyValue, loanBalance, monthlyRent, creditScore, state
- firstName, lastName, phone, email
- UTM params: utmSource, utmMedium, utmCampaign, utmTerm, utmContent, fbclid, landingPageUrl, deviceType
- Quote output: quotedRateLow, quotedRateHigh, quotedPayment, quotedMaxLoan, quotedDscr, quotedCashOut

Non-persistent: currentStep, direction, consent, honeypot, isSubmitting, submitError, submittedData, showQuoteReveal

### Validation (Zod)

```js
const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string()
    .regex(/^[\d\s().-]+$/, 'Enter a valid phone number')
    .refine((val) => val.replace(/\D/g, '').length === 10, 'Phone must be 10 digits')
    .refine((val) => !/(\d)\1{4,}/.test(val.replace(/\D/g, '')), 'Enter a real phone number'),
  email: z.string().email('Enter a valid email address'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
});

const quoteSchema = z.object({
  loanPurpose: z.enum(['cash_out', 'rate_term']),
  propertyType: z.enum(['sfr', 'duplex', 'triplex_quad', 'condo']),
  propertyValue: z.number().min(150000).max(5000000),
  loanBalance: z.number().min(0),
  monthlyRent: z.number().min(500).max(20000),
  creditScore: z.enum(['640-679', '680-719', '720-759', '760+', 'below_640']),
  state: z.string().length(2),
});
```

Errors shown on blur (not on type). Error text: `mt-1 text-xs text-red-500`.

### Honeypot (Bot Protection)
```html
<div class="absolute -left-[9999px] opacity-0" aria-hidden="true" tabIndex={-1}>
  <input type="text" name="website" autoComplete="off" tabIndex={-1} />
</div>
```

### Form Flow (10 Screens Total)

**Step 1: Loan Purpose**
- Heading: "What are you looking to do?"
- Sub: "We'll find the right program for your situation."
- Cards (2): Cash-Out Refinance / Rate & Term Refinance
- Icon: dollar-arrow / refresh-cycle

**Step 2: Property Type**
- Heading: "What type of property is it?"
- Sub: "Non-owner occupied only. Your primary home doesn't qualify."
- Cards (2x2 grid): Single Family / 2-Unit / 3-4 Unit / Condo
- Icon: house / duplex / multi-unit / condo-tower

**Step 3: Property Value**
- Heading: "What's the estimated current value of the property?"
- Sub: "Use your best estimate. A formal appraisal will confirm this later."
- Slider + text input
- Range: $150K-$3M+, default $450K, increment $25K
- Warning if under $300K (soft), different message under $150K

**Step 4: Current Loan Balance**
- Heading: "What's your current loan balance on this property?"
- Sub: "Approximate is fine, within $20K is close enough."
- Slider + text input
- Range: $0-$3M, capped at property value, increment $10K

**Step 5: Monthly Rent**
- Heading: "How much does this property currently rent for per month?"
- Sub: "If vacant, enter the market rent for your area."
- Slider + text input
- Range: $500-$15K, default $2,800, increment $50

**Step 6: Credit Score Range**
- Heading: "What's your approximate credit score?"
- Sub: "Checking your score won't affect it. We don't pull credit."
- Cards (vertical list): 760+ / 720-759 / 680-719 / 640-679 / Below 640
- "Below 640" card still collects and routes to credit repair resources

**Step 7: State**
- Heading: "What state is the property in?"
- Sub: "We're licensed in most states. We'll confirm availability."
- Native select dropdown, 50 states
- Unlicensed states still collect with message "We're working on [State], we'll notify you"

**Quote Reveal Screen (between step 7 and contact):**
- Calc spinner (1.2s) with "Running your scenario..."
- "Your Estimated Rate Range" eyebrow label
- Rate range in large text: `text-4xl md:text-5xl font-extrabold text-navy tabular-nums`
  - Example: "6.875% - 7.500%"
- Summary bullet list:
  - Monthly P&I Payment: $X,XXX
  - Max Loan Amount: $XXX,XXX
  - DSCR Ratio: X.XX
  - Cash Available (if cash-out): $XX,XXX
- Scenario recap line: `text-sm text-gray-500`
  - "Based on a $450K SFR rate-and-term refi, 720 FICO, Ohio, 5-year step-down prepay"
- Expand CTA: `bg-red-accent px-6 py-4 rounded-xl w-full text-white font-bold`
  - "Get My Exact Rate, Takes 30 Seconds"
- Fine print: `text-xs text-gray-400 mt-3`
  - "Exact rate depends on appraisal and final underwriting. Range shown is for your scenario."

**Contact Gate Step (appears via height animation):**
- Heading: "Where should we send your exact rate?"
- Sub: "No credit pull. A specialist will call you within 15 minutes."
- Fields: first name, last name, phone, email, consent
- Submit: "Send Me My Rate"

**Success Screen:** See above.

### Instant Quote Pricing Matrix

The rate engine runs entirely client-side with a static JSON pricing matrix inside the React component. No backend API call. Rounds to nearest 0.125%.

**Base rate (top-tier par):** 6.25%
- Assumes: 760+ FICO, 1.25 DSCR, 70% LTV, SFR, 5-yr step-down prepay, rate-and-term refi, 30-yr fixed
- Anchor: 5-yr treasury (~4.00-4.25%) + credit spread (2.50-4.50%)

```js
const PRICING_MATRIX = {
  baseRate: 6.25,

  ficoAdjustments: {
    '760+':     0.000,
    '740-759':  0.125,
    '720-739':  0.250,
    '700-719':  0.375,
    '680-699':  0.500,
    '660-679':  0.750,
    '640-659':  1.125,  // midpoint of 1.00-1.25 range
  },

  dscrAdjustments: {
    // DSCR ratio thresholds
    '1.25+':    0.000,
    '1.20-1.24': 0.125,
    '1.10-1.19': 0.250,
    '1.00-1.09': 0.375,
    'below_1':   0.625,  // midpoint of 0.50-0.75 (no-ratio)
  },

  ltvAdjustments: {
    'le_60':    -0.125,
    '61-65':     0.000,
    '66-70':     0.125,
    '71-75':     0.250,
    '76-80':     0.438,  // midpoint of 0.375-0.50
  },

  loanPurposeAdjustments: {
    'rate_term':  0.000,
    'cash_out':   0.313,  // midpoint of 0.25-0.375
  },

  propertyTypeAdjustments: {
    'sfr':                0.000,
    'condo_warrantable':  0.125,
    'condo_non_warr':     0.313,  // midpoint of 0.25-0.375
    'duplex':             0.250,
    'triplex_quad':       0.438,  // midpoint of 0.375-0.50
  },

  prepayAdjustments: {
    '5yr_stepdown': 0.000,
    '3yr_stepdown': 0.313,  // midpoint of 0.25-0.375
    '1yr':          0.563,  // midpoint of 0.50-0.625
    'no_prepay':    0.875,  // midpoint of 0.75-1.00
  },

  loanAmountAdjustments: {
    '1m_plus':     0.375,  // midpoint of 0.25-0.50
    '250k_1m':     0.000,
    '150k_249k':   0.250,
    'below_150k':  0.625,  // midpoint of 0.50-0.75
  },

  maxLtvRateTerm: {
    // FICO: max LTV for rate-and-term refi
    '760+':     0.80,
    '740-759':  0.80,
    '720-739':  0.775,  // midpoint of 0.75-0.80
    '700-719':  0.75,
    '680-699':  0.725,  // midpoint of 0.70-0.75
    '660-679':  0.675,  // midpoint of 0.65-0.70
    '640-659':  0.625,  // midpoint of 0.60-0.65
  },

  maxLtvCashOut: {
    // FICO: max LTV for cash-out refi (SFR)
    '760+':     0.75,
    '740-759':  0.75,
    '720-739':  0.75,
    '700-719':  0.75,
    '680-699':  0.70,
    '660-679':  0.65,
    '640-659':  0.60,
  },

  // 2-4 unit cash-out cap 5% lower than SFR at 760+
  cashOutMultiUnitReduction: 0.05,
};

function calculateQuote(inputs) {
  const {
    loanPurpose, propertyType, propertyValue, loanBalance,
    monthlyRent, creditScore, state
  } = inputs;

  // 1. Assume default max loan (new loan = min(balance + cash, maxLtv * value))
  const ltvCap = loanPurpose === 'cash_out'
    ? PRICING_MATRIX.maxLtvCashOut[creditScore]
    : PRICING_MATRIX.maxLtvRateTerm[creditScore];

  const maxLoan = Math.floor(propertyValue * ltvCap);
  const newLoanAmount = loanPurpose === 'cash_out'
    ? maxLoan
    : Math.min(loanBalance, maxLoan);

  // 2. Bucket LTV
  const ltv = newLoanAmount / propertyValue;
  const ltvBucket = ltv <= 0.60 ? 'le_60'
                   : ltv <= 0.65 ? '61-65'
                   : ltv <= 0.70 ? '66-70'
                   : ltv <= 0.75 ? '71-75'
                   : '76-80';

  // 3. Estimate PITIA (P&I + taxes + insurance, rough)
  // Use 30-yr amortization at base + FICO adjustment as the rate proxy
  const estimatedRate = 0.07; // stub for DSCR calc
  const monthlyPI = calculatePayment(newLoanAmount, estimatedRate, 360);
  const taxesInsurance = (propertyValue * 0.015) / 12; // 1.5% annual approx
  const pitia = monthlyPI + taxesInsurance;

  // 4. Calculate DSCR
  const dscr = monthlyRent / pitia;
  const dscrBucket = dscr >= 1.25 ? '1.25+'
                    : dscr >= 1.20 ? '1.20-1.24'
                    : dscr >= 1.10 ? '1.10-1.19'
                    : dscr >= 1.00 ? '1.00-1.09'
                    : 'below_1';

  // 5. Loan amount bucket
  const loanBucket = newLoanAmount >= 1000000 ? '1m_plus'
                    : newLoanAmount >= 250000 ? '250k_1m'
                    : newLoanAmount >= 150000 ? '150k_249k'
                    : 'below_150k';

  // 6. Sum adjustments (assume 5yr stepdown as default)
  const totalAdj =
    PRICING_MATRIX.ficoAdjustments[creditScore] +
    PRICING_MATRIX.dscrAdjustments[dscrBucket] +
    PRICING_MATRIX.ltvAdjustments[ltvBucket] +
    PRICING_MATRIX.loanPurposeAdjustments[loanPurpose] +
    PRICING_MATRIX.propertyTypeAdjustments[propertyType] +
    PRICING_MATRIX.prepayAdjustments['5yr_stepdown'] +
    PRICING_MATRIX.loanAmountAdjustments[loanBucket];

  const rateLow = roundTo125(PRICING_MATRIX.baseRate + totalAdj);
  const rateHigh = roundTo125(rateLow + 0.625);

  // 7. Final P&I using quoted rate (low end)
  const finalPayment = calculatePayment(newLoanAmount, rateLow / 100, 360);

  // 8. Cash available (cash-out only)
  const cashOut = loanPurpose === 'cash_out'
    ? Math.max(0, newLoanAmount - loanBalance)
    : 0;

  return {
    rateLow,
    rateHigh,
    monthlyPayment: Math.round(finalPayment),
    maxLoanAmount: newLoanAmount,
    dscrRatio: dscr.toFixed(2),
    cashAvailable: cashOut,
  };
}

function calculatePayment(principal, annualRate, months) {
  const r = annualRate / 12;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function roundTo125(rate) {
  return Math.round(rate * 8) / 8;
}
```

**Output format on quote reveal screen:**
- Rate range: `6.875% - 7.500%` (tabular-nums, 4xl-5xl)
- Monthly P&I: `$2,847/mo` (P&I only, not PITIA)
- Max loan amount: `$337,500`
- DSCR ratio: `1.18`
- Cash available (if cash-out): `$67,500`

**Compliance language below quote:**
```
text-xs text-gray-400 leading-relaxed mt-6
```
"Results are estimates for informational purposes only and do not constitute a commitment to lend, a loan approval, or a guarantee of any specific rate or terms. Actual rates and loan terms will vary based on creditworthiness, property appraisal, income verification, reserve requirements, and final underwriting review. All loans subject to lender approval. Equal Housing Lender. DSCR Investors Network NMLS #[XXXXX]. Not available in all states."

### GHL Webhook Submission

On contact form submit, fire a `fetch()` POST to the GoHighLevel webhook URL with all form data, quote output, and UTMs. Fallback: `mailto:` link if webhook fails.

```js
const payload = {
  // Contact
  first_name, last_name, phone, email, consent,
  // Quote inputs
  loan_purpose, property_type, property_value, loan_balance,
  monthly_rent, credit_score, state,
  // Quote output
  quoted_rate_low, quoted_rate_high, quoted_payment,
  quoted_max_loan, quoted_dscr, quoted_cash_out,
  // Attribution
  utm_source, utm_medium, utm_campaign, utm_term, utm_content,
  fbclid, landing_page_url, device_type,
  // Timestamps
  submitted_at,
};
```

---

## Page Section Order & Copy

Linear scroll, no navigation menu.

### 1. Sticky Header

See Component Patterns > Sticky Header.
- Logo left, NMLS + phone right.
- Transparent over hero, white/95 with backdrop-blur-md and shadow-md after 50px scroll.

### 2. Hero Section (ink dark bg)

**Eyebrow:** `DSCR REFINANCE`

**Headline (primary recommendation):**
"Get a DSCR Refi Rate in 90 Seconds. No W-2s. No Income Docs."

**Alternate headline options (all 10, for A/B testing):**
1. "Your Tax Write-Offs Shouldn't Kill Your Refi. DSCR Loans Qualify You on the Property, Not Your Income."
2. "Sitting on Equity in a Rental? Pull Cash Out Without Touching a Tax Return."
3. "Maxed Out on Conventional? There's No Loan Limit Here."
4. "The Refi Banks Keep Denying You. We Close It in 23 Days."
5. "Your Property Cash-Flows. That's All We Need to Know."
6. "8 Doors, $0 Qualifying Income. DSCR Loans Work the Way Investors Actually Work."
7. "Stop Leaving Equity Trapped in Your Rentals. No Tax Returns. No W-2. Just the DSCR Ratio."
8. "Rate-and-Term or Cash-Out. We Don't Care What Your Tax Returns Say."
9. "You Write Off Everything. Your Bank Sees Nothing. We See the Rent Roll."
10. "No Seasoning. No Income Docs. No Fannie Cap. This Is How Portfolio Investors Refinance."

**Subhead:**
"We use your property's rental income to qualify you, not your personal tax returns. Rates starting at 6.50%, close in 21 days."

**Trust badges (5):**
1. Shield icon + "NMLS #[XXXXXX]"
2. Five gold stars + "4.9 (200+ Reviews)"
3. Bar chart icon + "$180M+ Funded"
4. Calendar icon + "21-Day Avg Close"
5. Map pin icon + "Licensed in 40 States"

**Right column:** Instant Quote Form (see Multistep Form System).

### 3. Trust Bar (navy-light bg)

Full-width horizontal bar between hero and loan programs. 5 trust elements in a row.

```html
<section class="bg-navy-light py-10">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid gap-6 grid-cols-2 md:grid-cols-5">
      <!-- Each: flex items-center gap-3 -->
      <!-- Icon (h-8 w-8 navy) + text block -->
    </div>
  </div>
</section>
```

**5 elements:**
1. **NMLS #[XXXXXX]** - Shield icon - `text-xs text-gray-500`
2. **4.9 out of 5 (200+ Reviews)** - Five gold stars - `text-xs text-gray-500`
3. **$180M+ DSCR Loans Funded** - Bar chart icon - `text-xs text-gray-500`
4. **21-Day Average Close** - Calendar icon - `text-xs text-gray-500`
5. **Licensed in 40 States** - Map pin icon - `text-xs text-gray-500`

Mobile: 2-col grid, show top 3 if all 5 won't fit cleanly.

### 4. Loan Programs Section (white bg)

**Eyebrow:** `LOAN PROGRAMS`
**Heading:** "Three Ways to Refinance Your Rental"
**Subhead:** "Pick the program that fits your property. No income docs on any of them."

**Three cards:**

**Card 1: Cash-Out Refinance**
- Icon: dollar-arrow (cash flowing out of house)
- Title: "Cash-Out Refinance"
- LTV pill: "Up to 75% LTV"
- Description: "Pull equity out of your rental without touching your personal income docs. Up to 75% LTV."
- CTA: "Get My Rate >"

**Card 2: Rate & Term Refinance**
- Icon: refresh-cycle
- Title: "Rate & Term Refinance"
- LTV pill: "Up to 80% LTV"
- Description: "Drop your rate or change your term. Up to 80% LTV, no income verification required."
- CTA: "Get My Rate >"

**Card 3: No-Ratio (No-DSCR)**
- Icon: question-mark-shield
- Title: "No-Ratio (No-DSCR)"
- LTV pill: "Ask For Terms"
- Description: "DSCR below 1.0? Vacant property? Short-term rental? We have a program for that. Ask your specialist."
- CTA: "Talk to a Specialist >"

**CUT:** The standalone "How DSCR Works" explainer section is intentionally removed. The audience knows what DSCR is. The definition folds into the loan program cards and the FAQ.

### 5. Real Numbers Section (navy-light bg)

**Eyebrow:** `REAL NUMBERS`
**Heading:** "The Numbers That Matter to Investors"
**Subhead:** "Rates, LTVs, DSCR thresholds, timelines. No vague promises."

**Layout:** 3-column grid, each column is a data block with a label and a value.

**6 stat tiles (2 rows of 3):**

| Label | Value |
|-------|-------|
| Starting Rate | 6.50% |
| Max LTV (Rate & Term) | 80% |
| Max LTV (Cash-Out) | 75% |
| Min DSCR | 1.00 |
| Min FICO | 640 |
| Avg Close Time | 21 days |

**Tile component:**
```html
<div class="rounded-2xl bg-white p-6 shadow-md border border-gray-200">
  <p class="text-xs font-semibold uppercase tracking-widest text-gray-500">Starting Rate</p>
  <p class="mt-2 text-4xl font-extrabold text-navy tabular-nums">6.50%</p>
  <p class="mt-2 text-sm text-gray-500">Top-tier borrowers, 760+ FICO, 5-yr step-down prepay.</p>
</div>
```

**Below the stat grid, a 3-column detail panel:**

**Column A: Loan Amounts**
- "Min: $150K (limited options below)"
- "Sweet spot: $250K-$1M"
- "Max: $3M per property"

**Column B: Property Types**
- "1-unit single family"
- "2-4 unit multi-family"
- "Condos (warrantable + non-warrantable)"
- "Short-term rentals (Airbnb, VRBO)"

**Column C: Prepay Options**
- "5-year step-down (best rate)"
- "3-year step-down"
- "1-year"
- "No prepay (higher rate)"

### 6. Testimonials Section (off-white bg)

**Eyebrow:** `INVESTOR STORIES`
**Heading:** "Closed Loans, Real Investors."
**Subhead:** "Every story includes deal specifics. The numbers are real."

**3 testimonial cards** (see Card Pattern > Testimonial above).

**Testimonial copy framework (each quote follows this structure):**
1. Short highlight in italic bold (the quotable one-liner)
2. Full quote with deal specifics: rate, LTV, close time, loan type, doors
3. Attribution: first name + last initial, door count + city

**Example 1: BRRRR refi story**
- Highlight: "They closed my BRRRR refi in 19 days. No tax returns."
- Full: "I'd been stuck with a hard money bridge at 12.5 percent for four months because no bank would touch my self-employed return. DSCR Investors Network qualified me on the rent roll, pulled 75 percent LTV cash-out, and closed in 19 days. Rate came in at 6.875."
- Attribution: Marcus R. | 12 doors, Indianapolis

**Example 2: Maxed conventional slots story**
- Highlight: "I hit the Fannie 10-loan cap. Nobody would help."
- Full: "Every conventional lender said the same thing: 10 financed properties, you're done. DSCR Investors Network didn't care. 8 doors later I'm still closing loans with them. The platinum-tier LO knows my portfolio better than I do."
- Attribution: Jennifer T. | 18 doors, Nashville

**Example 3: Tax write-off barrier story**
- Highlight: "Banks saw $42K on my return. I gross $380K in rents."
- Full: "I write off everything. Depreciation, repairs, management, travel. My tax return says I made $42K last year. The truth is I gross $380K across my portfolio. DSCR Investors Network ran the numbers on the properties, not the 1040. Approved at 7.125 percent, rate-and-term on three properties same week."
- Attribution: David K. | 22 doors, Columbus

### 7. FAQ Section (white bg)

**Eyebrow:** `FREQUENTLY ASKED`
**Heading:** "Questions Investors Ask Before They Apply"
**Subhead:** "The 6 questions we get most. Straight answers, no dance."

**Accordion:** Radix Accordion, single-open behavior.

**Accordion item pattern:**
```html
<div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
  <button class="flex w-full items-center justify-between p-5 text-left
                 font-semibold text-ink hover:bg-navy-light/50 transition-colors">
    <span>Question text</span>
    <svg class="h-5 w-5 text-gray-400 transition-transform
                data-[state=open]:rotate-180"><!-- chevron down --></svg>
  </button>
  <div class="px-5 pb-5 text-gray-500 leading-relaxed">
    Answer text
  </div>
</div>
```

**The 6 questions:**

**Q1. What credit score do I need for a DSCR refinance?**
A: Most DSCR programs start at 640 FICO. The best rates go to borrowers at 720 or above. If your score is below 640, ask us about credit improvement options. Most investors can reach 680+ within 6 months with the right steps.

**Q2. How does the lender decide if I qualify if they don't look at my income?**
A: DSCR stands for Debt Service Coverage Ratio. Lenders divide your property's monthly rent by the monthly principal, interest, taxes, and insurance payment. A ratio of 1.0 means rent covers the payment exactly. Most programs want 1.0 or higher. Properties with ratios below 1.0 may qualify under a No-Ratio program.

**Q3. How long does it take to close a DSCR refinance?**
A: Most of our loans close in 21-30 days from application. The main timeline driver is the appraisal, which typically takes 7-14 days. Having your rental agreement and 12 months of rent history ready speeds the process.

**Q4. Can I do a DSCR refinance on a property with short-term rentals like Airbnb?**
A: Yes. Short-term rental income can be documented using 12 months of platform payment history. Lenders typically use 75% of gross STR income to calculate DSCR, which accounts for vacancy and platform fees. Some lenders require the property to have at least 12 months of STR history.

**Q5. What is the maximum loan amount for a DSCR refinance?**
A: Most programs go up to $3 million on a single property. Some lenders go higher for exceptional borrower profiles. Minimum loan amounts are typically $100,000 to $150,000 depending on the program.

**Q6. Can I do a cash-out refinance on a property I own free and clear?**
A: Yes. Properties with no existing mortgage can still do a cash-out DSCR refinance. The maximum loan amount is still based on LTV (up to 75% of the appraised value for cash-out). The DSCR calculation works the same way using the new loan's projected payment.

### 8. Final CTA Section (ink dark bg)

See Component Patterns > Dark Section Pattern above.

**Eyebrow:** `YOUR RATE IS WAITING`
**Headline:** "Your Rate Is Waiting. Takes 90 Seconds to See It."
**Subhead:** "No W-2s. No income docs. Just the property's rent roll and 21 days to close."
**Button:** "Get My DSCR Rate Now"
**Trust signals (inline):** "No hard credit pull" / "90-second quote" / "NMLS #[XXXXXX]"

### 9. Footer (navy-dark bg)

See Component Patterns > Footer Pattern above.

- Left: Logo + short description + NMLS disclosure
- Center: Phone, email, business hours
- Right: Privacy Policy, Terms, Licensing Disclosures
- Bottom: State licensing disclaimer + Equal Housing Lender notice + copyright

---

## Responsive Strategy

### Breakpoints

| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (base) | 0px | Mobile-first defaults |
| `sm:` | 640px | Small tablets, larger phones |
| `md:` | 768px | Tablets, switch to multi-column |
| `lg:` | 1024px | Desktop |

### Key Responsive Patterns

**Header:** `h-16` -> `md:h-20`. NMLS hidden on base, visible at `sm:`.

**Hero:** Single column stacked -> `md:grid-cols-2` side-by-side. Form is always visible on mobile, never hidden.

**Section padding:** `py-16` -> `md:py-24`

**Card padding:** `p-4` -> `sm:p-6` -> `md:p-8`

**Typography:** Most headings scale up at `sm:` and `md:` breakpoints. Rate range on quote screen clamps between 28px and 48px.

**Grids:** `grid gap-6` (1 col) -> `md:grid-cols-3` for loan programs, testimonials, stat tiles.

**Trust bar:** `grid-cols-2` -> `md:grid-cols-5`. If 5 won't fit cleanly on mobile, show top 3.

**Form:** Stays single-column at all sizes except name fields (always 2-col) and selection card grids (2x2 for property type).

**Selection cards:** 2-col grid on mobile (not stacked). Ensures all 4 property types are visible without scroll.

**Slider inputs:** Text input above slider (min 44px tap target). Label and value on one line, slider on the next.

**Header phone CTA:** Icon + number on mobile, "Call: (XXX) XXX-XXXX" label shown at `sm:`.

**FAQ accordion:** Full-width on all sizes.

**Final CTA:** Headline scales from 30px mobile to 48px desktop.

**Quote reveal rate display:** `clamp(28px, 8vw, 48px)` so it never clips on small screens.

---

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid #1B2E4B; /* navy */
  outline-offset: 2px;
}
```

Inputs and sliders also get `box-shadow: 0 0 0 3px rgba(27, 46, 75, 0.30)` (shadow-focus) on focus.

### ARIA Patterns

**Form selection cards:**
- Parent: `role="radiogroup"` with `aria-labelledby="step-heading"`
- Cards: `role="radio"` with `aria-checked={selected}`

**Form inputs:**
- `aria-label` on all inputs (no visible labels, placeholder-based on contact step)
- `aria-invalid={!!errors.field}` when validation fails
- `aria-describedby` linking to error message ID

**Sliders (Radix):**
- `aria-label` describing the input
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-valuetext` with formatted dollar value

**Progress bar:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label="Step X of 7"`

**FAQ accordion (Radix):**
- Full keyboard navigation built-in
- `aria-expanded` on each trigger
- `aria-controls` linking to content panel

**Step indicator:** `aria-live="polite"` for screen reader announcements on step changes.

**Quote reveal:** Rate range number wrapped in `<output aria-live="polite">` so assistive tech announces the result.

**Success screen:** `role="status" aria-live="polite"` on the confirmation heading.

**Reduced motion:** Both CSS and JS respect `prefers-reduced-motion: reduce`. GSAP timelines skip to end state. Framer Motion respects it automatically. Confetti does not fire.

### Keyboard Navigation

- Tab order: header phone > form first field > form progression > footer links
- Sliders: arrow keys nudge by increment (Radix default), Home/End jump to min/max
- Selection cards: arrow keys move between options within a radiogroup
- FAQ accordion: Tab between items, Enter/Space to expand
- Form submit: Enter key submits from any field when valid

### Color Contrast

All text/background combinations tested to WCAG AA minimum (4.5:1 for body, 3:1 for large text):
- ink #0F1C2E on white: 15.2:1 (AAA)
- gray-500 #5C6A7A on white: 5.1:1 (AA)
- gray-400 #8491A3 on white: 3.5:1 (AA for large text only, use for metadata only)
- white on ink: 15.2:1 (AAA)
- gray-300 #B0B8C4 on ink: 7.1:1 (AAA)
- red-accent #C0392B on white: 4.8:1 (AA) - primary CTA passes
- navy #1B2E4B on navy-light #EEF2F7: 11.4:1 (AAA)

---

## Performance & SEO

### Image Optimization
- Astro `<Image>` component for all static images
- Format: WebP (automatic conversion)
- Quality: 80 (logo, trust badges, eager), 75 (everything else, lazy)
- Multiple widths via `widths` prop for responsive srcset
- Logo: `loading="eager"`, `decoding="sync"`, `fetchpriority="high"`
- All other images: `loading="lazy"`, `decoding="async"`
- No stock hero photography. The hero is form + headline on solid ink, no image dependency.

### React Islands Strategy
- `client:load` - Instant quote form (must be interactive immediately, above the fold)
- `client:visible` - FAQ accordion (only hydrate when scrolled into view)
- All non-interactive components are plain Astro (zero JS)

### Page Load Targets
- LCP (Largest Contentful Paint): under 2.0s on 4G
- TTI (Time to Interactive): under 2.5s on 4G
- CLS (Cumulative Layout Shift): under 0.05
- Total page weight: under 500KB (no hero image helps)

### SEO Head
```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="DSCR refinance rates for 1-4 unit rental properties. No tax returns, no W-2s. Rates from 6.50%. Close in 21 days. NMLS #[XXXXXX]." />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://dscrinvestors.net/" />

<!-- OG Tags -->
<meta property="og:title" content="DSCR Refi Rates in 90 Seconds | DSCR Investors Network" />
<meta property="og:description" content="Get a DSCR refinance rate without tax returns. Up to 80% LTV. Close in 21 days." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://dscrinvestors.net/" />
<meta property="og:image" content="https://dscrinvestors.net/og-image.png" /> <!-- 1200x630 -->
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "DSCR Investors Network",
  "url": "https://dscrinvestors.net",
  "logo": "https://dscrinvestors.net/logo.png",
  "description": "DSCR refinance mortgage broker for non-owner-occupied rental properties.",
  "telephone": "+1-XXX-XXX-XXXX",
  "priceRange": "$$",
  "address": { "@type": "PostalAddress", "addressCountry": "US" }
}
</script>
```

### Analytics Loading
- Google Tag Manager loaded in `<head>` with `is:inline`
- GTM noscript fallback in `<body>`
- GA4, Google Ads conversion tags, and Meta Pixel via GTM
- Meta Pixel for Facebook ad attribution (this is FB paid traffic)

---

## Micro-Interactions

### Hover Effects Summary

| Element | Effect |
|---------|--------|
| Loan program cards | `hover:-translate-y-1 hover:shadow-lg` |
| Testimonial cards | `shadow-md` -> `hover:shadow-lg` |
| Stat tiles | No hover transform (static display) |
| Primary CTA buttons (red) | `hover:bg-[#A8331F] hover:shadow-lg` |
| Ghost buttons | `hover:bg-white/10` |
| Header phone CTA | `hover:bg-ink-light` (from `bg-navy`) |
| Footer links | `hover:text-white` (from `text-gray-300/400`) |
| Back button | `hover:text-navy` (from `text-gray-400`) |
| Selection cards (form) | `hover:border-navy/40 hover:shadow-sm` |
| Slider thumb | Focus ring (shadow-focus) |
| FAQ accordion trigger | `hover:bg-navy-light/50` |
| Program card "Get My Rate" link | Arrow `group-hover:translate-x-1` |
| Quote reveal "Get My Exact Rate" CTA | Red pulse shadow loop |

### State Indicators

| State | Visual |
|-------|--------|
| Selected (form card) | Navy border, navy-light bg, navy icon bg, success green checkmark |
| Error (input) | Red-400 border, red-500 text below |
| Disabled (button) | Gray-300 bg, not-allowed cursor |
| Loading (submit) | Spinning SVG, "Connecting you with a loan specialist..." text |
| Quote calculating | 1.2s navy arc spinner, "Running your scenario..." text |
| Success | Animated checkmark, confetti, staggered text, rate pill reminder |
| Scrolled (header) | White/95 bg, backdrop-blur, shadow-md |
| Focused (input/slider) | Navy border + 3px navy/30 focus ring |
| Hovered accordion | Navy-light/50 bg |

### Imagery & Iconography Rules

**Photography direction:** Dark, editorial, property-first. Twilight exteriors of investment-grade residential. 4-plexes, renovated SFRs, STR cottages. Low angle, slight drama. Use sparingly. The hero does not need a photo at all.

**People photography:** Investors 30s-50s, candid working shots at laptops or walking properties. Never posed, never suits. Use only in testimonial avatars if real client photos exist. Otherwise use initial-based circle avatars.

**Icons:** Outlined, 1.5px stroke, 24px grid. Architectural and precise. Use Lucide or custom SVGs. All icons inherit `currentColor` so they can be recolored via Tailwind text utilities.

**Avoid:**
- MLS daylight shots with green grass
- Handshake imagery
- Piggy banks, golden keys
- White-men-in-suits-pointing-at-charts
- Family closing scenes with balloons
- Stock photos of calculators or pens on contracts

---

## Analytics & Tracking

### DataLayer Events

**Quote form view:**
```js
window.dataLayer.push({ event: 'quote_form_view' });
```

**Form start (first interaction):**
```js
window.dataLayer.push({ event: 'form_start' });
```

**Step completion:**
```js
window.dataLayer.push({
  event: 'form_step_complete',
  step_number: 1-7,
  step_name: 'loan_purpose' | 'property_type' | 'property_value'
           | 'loan_balance' | 'monthly_rent' | 'credit_score' | 'state',
  step_value: '<selected value>',
});
```

**Quote shown:**
```js
window.dataLayer.push({
  event: 'quote_shown',
  rate_range_low: 6.875,
  rate_range_high: 7.500,
  loan_type: 'cash_out' | 'rate_term',
  property_type: 'sfr' | 'duplex' | 'triplex_quad' | 'condo',
  property_value: 450000,
  ltv: 0.75,
  dscr: 1.18,
  max_loan: 337500,
  cash_out: 67500,
});
```

**Quote CTA click (start of contact gate):**
```js
window.dataLayer.push({ event: 'quote_cta_click' });
```

**Lead submission:**
```js
window.dataLayer.push({
  event: 'lead_submitted',
  lead_source: 'instant_quote_form',
  loan_type: '...',
  property_type: '...',
  rate_range_low: 6.875,
  rate_range_high: 7.500,
  fbclid: '...',
  utm_source: '...',
  utm_medium: '...',
  utm_campaign: '...',
  utm_term: '...',
  utm_content: '...',
  device_type: 'mobile' | 'tablet' | 'desktop',
  landing_page: '...',
  user_email: '...',
  user_phone: '+1XXXXXXXXXX',
  user_state: 'OH',
});
```

**Lead submit error:**
```js
window.dataLayer.push({
  event: 'lead_submit_error',
  error_message: '...',
});
```

**Phone click (header CTA):**
```js
window.dataLayer.push({ event: 'phone_click', source: 'header' | 'footer' | 'success_screen' });
```

**Soft disqualifier shown:**
```js
window.dataLayer.push({
  event: 'soft_disqualify',
  reason: 'property_below_300k' | 'property_below_150k' | 'unlicensed_state' | 'fico_below_640',
});
```

**Schedule call click (success screen Calendly):**
```js
window.dataLayer.push({ event: 'schedule_call_click' });
```

**Form back navigation:**
```js
window.dataLayer.push({ event: 'form_back', from_step: 3, to_step: 2 });
```

### UTM & Device Tracking
- All UTM params captured from URL on form init
- `fbclid` captured for Facebook ad attribution
- Persisted to localStorage (survives page refreshes)
- Device type detected via user agent + viewport width
- Phone formatted to E.164 before sending to webhook
- `landing_page_url` includes query string for full attribution

### Meta Pixel Events (Facebook)

Fire standard pixel events alongside dataLayer pushes:
- `PageView` (automatic on load)
- `Lead` (on lead_submitted)
- `InitiateCheckout` (on form_start)
- Custom event `QuoteShown` (on quote_shown)

---

## Quick Reference Table

| Property | Value |
|----------|-------|
| Font | Inter (400, 500, 600, 700, 800) |
| Primary color | #1B2E4B (navy) |
| Dark anchor | #0F1C2E (ink) |
| CTA accent | #C0392B (red-accent) - primary button only |
| Section tint | #EEF2F7 (navy-light) |
| Section alt | #F4F6F9 (off-white) |
| Success | #2D7A4F |
| Gold (ratings) | #B8922A |
| Background | #FFFFFF (white) body, #EEF2F7 / #F4F6F9 alternating sections |
| Text primary | #0F1C2E (ink) |
| Text secondary | #5C6A7A (gray-500) |
| Text muted | #8491A3 (gray-400) |
| Border color | #D9DDE4 (gray-200) |
| Button radius | 12px (rounded-xl) |
| Card radius | 16px (rounded-2xl) |
| Input radius | 12px (rounded-xl) |
| Container max-width | 1280px (max-w-7xl) |
| Section padding | 64px mobile / 96px desktop |
| Card shadow | 0 4px 12px rgba(15, 28, 46, 0.14) |
| Form container shadow | 0 16px 40px rgba(15, 28, 46, 0.22) |
| Focus ring | 0 0 0 3px rgba(27, 46, 75, 0.30) |
| Standard transition | 300ms ease-out |
| Button transition | 200ms ease-out |
| Grid columns | 1 mobile / 3 desktop |
| Grid gap | 24px (gap-6) |
| Scroll reveal trigger | top 85% |
| Scroll reveal duration | 800ms |
| Scroll reveal ease | power2.out |
| Stagger delay | 150ms (cards), 120ms (program tiles) |
| Form step transition | 300ms slide |
| Form steps | 7 data steps + quote reveal + contact gate + success |
| Form progress bar segments | 7 |
| Z-index header | 50 |
| Header height | 64px mobile / 80px desktop |
| Base rate (instant quote engine) | 6.25% |
| Rate rounding | Nearest 0.125% |
| Rate range spread | +0.625% from low to high |
| Max cash-out LTV | 75% (SFR, 740+ FICO) |
| Max rate-and-term LTV | 80% (740+ FICO) |
| Min FICO accepted | 640 (below 640 still collected, routed to credit repair) |
| Min property value (preferred) | $300K |
| Hard floor property value | $150K |
| Average close time | 21 days |

---

## Adapting for Other DSCR Lead Gen Campaigns

To reuse this design system for a different lender or a different DSCR ad campaign:

1. **Swap the color palette only if the logo demands it.** The navy + red split is niche-agnostic within the institutional-lender category. If the client's logo is burgundy, shift red-accent to that hex. Keep ink as the dark anchor.

2. **Keep Inter.** It works for every financial services page. Only swap if the brand mandates a specific display font.

3. **Keep all spacing, radius, and shadow values.** These are niche-agnostic. The generous spacing and directional shadows work for any investor-facing lender.

4. **Keep the layout patterns.** Sticky header (no nav), hero with form, trust bar, loan programs, real numbers, testimonials, FAQ, final CTA, footer. This is a proven conversion flow for mortgage lead gen.

5. **Keep the 7-step instant quote engine.** The pricing matrix is the core differentiator. Update base rate, FICO adjustments, and max LTV tables based on the client's actual lender network pricing. Never remove the rate reveal. Never gate the range behind contact.

6. **Keep the animation system.** The GSAP scroll reveals and Framer Motion form transitions are reusable as-is. Just update `data-gsap` attributes on new sections.

7. **Swap copy and trust numbers.** Headlines, FAQ answers, NMLS number, funded volume, close time, states licensed in. Everything else is structural.

8. **Update structured data.** Swap NMLS and business name in the FinancialService JSON-LD block.

9. **Match the CTA language to the client's voice.** All 8 CTA button options listed in Component Patterns work for any DSCR lender. Pick 1-2 for A/B testing.

10. **Test headlines 1-10 listed in Page Section Order.** Facebook traffic responds differently to each pain point angle. Run at least 3 variants in the first 30 days.
