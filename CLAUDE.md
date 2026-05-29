# DSCR Investors Network

## Snapshot
- Owner / primary contact: DSCR Investors Network (Anthony Grego, founder; Ann Coleman, processing). Tanner takes 10% of commission, manages the LP + drives Facebook traffic.
- Domain: `dscrinvestors.net`
- What this is: a single-page Astro lead-gen site built around a 4-question interactive "Cash Card" quote tool. A Meta scroller answers state → property type → value → balance → rent → FICO, watches a live cash estimate tick up, sees a reveal screen, then drops contact info. Lead fires to Zapier + Meta CAPI.
- Status: built and building cleanly. Facebook ads the traffic source, CPL ~$80. Not all client data is finalized (see Open items).
- Last touched: 2026-05-28

## The core bet (do not break this)
The page shows **two numbers and a timeline**: cash in your pocket + monthly cash flow + ~15 business days. **No rate, no DSCR ratio, no LTV percentage is ever displayed to the user.** This came straight from Anthony on the Apr 9 call ("I don't even talk about rate") and Ann ("true investors don't care about rates"). Every section was built to honor it. If you add copy or a section, it must not show a rate, a DSCR ratio, an LTV %, or a phone dialer/Calendly.

Other hard brand rules (same as all DSCR builds, see `/context/positioning-anchors.md`):
- Market the company, not personalities. No named individuals in customer-facing copy, no "licensed" language, no specific state counts. (The 10 Meta-targeted states are internal-only and must never leak to a visitor.)
- No rate/insurance pre-quoting claims, no fabricated broker mechanics, no fake legislative cites, no em-dashes anywhere.

## Tech stack
- Astro 5 (SSR via `@astrojs/vercel`, `output: server`), React 19 islands, Tailwind v4, TypeScript, Zod.
- Form state: Nanostores (sessionStorage-persisted for resume). Transitions: Framer Motion. Contact validation: react-hook-form + Zod. Address: Google Places autocomplete (falls back to manual fields if no key). Cash Card PDF: `@react-pdf/renderer`.
- Hosting: Vercel. Build: `npm run build` (= `astro check && astro build`). Tests: `npm test` (Vitest, 21 tests across cash-engine, metaCapi, and a DOM-order assertion).

## Architecture
- **Content/data separation is non-negotiable.** All copy + numbers live in `src/content/*.json`, each parsed through a Zod schema in `src/content/schemas.ts` and re-exported from `src/content/index.ts`. Components are pure renderers. A JSON typo fails the build at the content layer. To change copy, edit the JSON, not the component.
- **The cash engine** (`src/lib/cash-engine/`) outputs only `{ cashLow, cashHigh, cashFlowLow, cashFlowHigh, edgeCases }`. Logic: subtract 20 pts from self-reported FICO (Ann's under-promise hack) → LTV cap by FICO bracket → gross cash-out → 10-20% fee haircut → cash flow off the "$1K PITI per $100K loan" rule. Config (brackets, haircut %) lives in `cash-engine-config.json`. 11 unit tests cover Anthony's verbatim example + edge cases.
- **The lead pipeline** (`src/lib/lead-pipeline/`): `POST /api/lead-webhook` validates the payload (Zod), enriches with IP/UA, then fans out to two destinations via `Promise.allSettled` (one failing doesn't block the other). 200 if either succeeds, 502 if both fail.
  1. **Zapier → Salesforce → team** (the real lead path, confirmed by Tanner 2026-05-28). The webhook posts the lead to the `ZAPIER_WEBHOOK_URL`; Zapier routes it into Salesforce; the DSCR Investors team reaches out to the borrower. The code only knows about the Zapier hook — the Salesforce step + team follow-up happen *inside* Zapier, not in this repo.
  2. **Meta CAPI** (Conversions API). This is just ad-tracking, not lead delivery: it tells Facebook server-side that a lead converted, so Meta can optimize the ad spend and attribute the conversion even when the browser pixel is blocked (iOS/ad blockers). It does NOT contact the borrower. Losing it only degrades ad-optimization data, never the lead itself.
  NOTE: older planning docs (master-build-plan, client-handoff-inventory) describe a different Salesforce-direct + Resend-email flow that was never the final wiring. The Resend auto-email was never built. Trust the code + this note.
- **Pixel + CAPI dedup:** client fires `Lead_FormStart`, `Lead_RevealReached`, and `Lead` (on success-screen mount, not on submit). Each carries an `eventID` the server mirrors in CAPI so Meta collapses the pair. QA hatch: `?disable_pixel=1`.

## Live page structure (`src/pages/index.astro`)
Renders, in order: `ScrollProgress` → `Header` → `Hero` (the 4-question CashCardForm is embedded in the hero, right side desktop / below CTA mobile) → `RecentClosedDeals` (auto-scrolling marquee, data hardcoded in the .astro) → `Process` → `Exclusions` → `FinalCTA` → `Footer` → `StickyMobileCTA`.

Live content files: `hero.json`, `form-steps.json`, `cash-engine-config.json`, `exclusions.json`, `process.json`, `final-cta.json`, `footer.json`, `thank-you.json`.

The SuccessScreen (`islands/quote/steps/SuccessScreen.tsx`) leads with the company logo + a team-member card (who reaches out), re-displays the locked estimate, then shows 3 testimonials. The PDF-download path was removed 2026-05-29 (`CashCardPdf.tsx` deleted). Timeline copy is now a consistent "15 business days" everywhere (the old reveal/success/preview "~20" values were corrected). Post-submit copy makes NO time promise on purpose ("we'll reach out shortly"); speed-to-lead lives in the Zapier/Salesforce flow, not in page copy.

## Deleted 2026-05-28 (built but never wired into the page)
Five fully-built, on-brand sections were imported nowhere, so they were removed along with the content/islands only they used. If you ever want them back, they're recoverable from git history (pre-2026-05-28):
- `Team.astro` (+ `lo-bios.json`, `LoBiosSchema`)
- `FAQ.astro` (+ `faq.json`, `FaqSchema`)
- `ReceiptCorkboard.astro` (+ `corkboard.json`, `CorkboardSchema`)
- `BreakevenTeeter.astro` + the `islands/teeter/` React island (+ `rule-of-thumb.json`, `RuleOfThumbSchema`)
- `FundedTicker.astro` (+ `recent-deals.json`)

Also deleted: stale `dist/` `.vercel/` `.astro/` build artifacts and three stray `www.privatemortgageleads.ai_*.png` screenshots in `public/`.

## Environment variables
Server (Vercel env): `ZAPIER_WEBHOOK_URL`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, optional `META_TEST_EVENT_CODE`.
Public (client, `PUBLIC_` prefix): `PUBLIC_META_PIXEL_ID` (boots fbq in `BaseLayout.astro`), `PUBLIC_GOOGLE_PLACES_API_KEY` (address autocomplete; without it the contact step falls back to manual address input). Real values in `.env` (gitignored). Each integration soft-fails if its var is missing, so the build/dev server runs without secrets.

## Open items (not finalized)
- The 3 testimonials in `thank-you.json` (Priya S., Marcus T., Amanda K.) use AI-generated faces (`/testimonials/*.png`) and reworded copy (rate/DSCR-ratio mentions stripped to honor the no-rate rule). Confirm with Anthony these are acceptable as representative testimonials or swap for real ones.
- `thank-you.json` `fallbackContactLine` is a placeholder phone `(877) DSCR-NET` — confirm the real fallback contact with Anthony.
- Google Places key: confirm `PUBLIC_GOOGLE_PLACES_API_KEY` is set in Vercel prod or autocomplete degrades to manual entry.
- The deeper open decision is the FB ad workflow itself (see below).

## Open decisions
- **FB ad workflow is the blocker.** Tanner won't run FB ads manually. Path forward: FB Ads API + fal-generated creative pipeline tied into the AIOS unified ad dashboard. Manual variant testing in the FB UI will stall any work here. See [[feedback_facebook_ads_manual]].

## Reference docs in this folder
- `master-build-plan.md` — the Apr 9 synthesis spec. Historically canonical but now partly drifted from the code (describes Salesforce/Resend, a Team/FAQ/Corkboard/Teeter page, and a footer NMLS field that no longer exists). Read for intent, trust the code for current state.
- `dscrinvestors-design.md` — design system (tokens, components, animations, accessibility). Still valid.
- `client-handoff-inventory.md` / `anthony-launch-ask.md` — Apr launch client-data asks; mostly historical now (the footer no longer has NMLS/state fields).

## Linked memory
- [[feedback_facebook_ads_manual]]
- [[google_ads_account_map]]
