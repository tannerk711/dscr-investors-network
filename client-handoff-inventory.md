# DSCR Investors Network — Client Hand-off Inventory
_Generated 2026-04-09 by Agent W3-K (Wave 3), for the client review before the Apr 15 launch._

> **⚠️ UPDATED 2026-04-09 (post-Apr-9 direction change):** We are marketing DSCR Investors Network as a **company**, not personalities. Customer-facing copy must never say "licensed," never call out specific state counts, and never name individuals (founder, processor, LOs). The team does deals across most of the U.S.; Meta ads run in a 10-state subset for loan-size / close-rate reasons — that 10-state fact is internal only and must never leak to leads.
>
> **Items in the tables below that are now DEAD (do not ask the client for them):**
> - `footer.json` "States 7-10 of the 10-state license list" — the `licensedStates` field was removed from the footer entirely.
> - `hero.json` "Licensed in 10 states" trust strip item — the 4th trust strip slot is intentionally dropped; the hero stays at 3 trust items.
> - `faq.json` "Full 10-state answer to What states do you lend in?" — rewritten to a generic "most of the U.S., we'll confirm when you start the 4 questions" answer.
> - `thank-you.json` hardcoded `anthony@dscrinvestors.net` — replaced with `hello@dscrinvestors.net`.
> - `lo-bios.json` "Anthony's real headshot" + "Ann's real headshot" — team section now uses role titles only ("Our Founder", "Senior Processing Team"). Photos are still optional but the section ships clean without them.
>
> **Items in the tables below that are STILL LIVE (the client must still deliver):**
> - NMLS number (footer + compliance line).
> - 4 missing state gate tiles in `form-steps.json` — the in-funnel state gate still uses the 10 Meta-targeted states, the client just needs to confirm which 4 complete the list.
> - 3 real case studies for `case-studies.json`.
> - Salesforce webhook confirmation.
> - Meta / Google Places / Resend credentials.
>
> In the tables below, ignore the "Owner: Anthony / Ann" labels as *marketing faces*. The client is still our point of contact for approvals and data, but nothing in the live funnel exposes individual team names to the public.

Total `TODO_CLIENT` markers counted in `src/`: **35** (10 Critical, 22 Important, 3 Nice-to-have).
Plus 1 hardcoded value flagged for review (Zapier webhook URL, `src/content/salesforce-schema.json`).
Plus 1 hardcoded value flagged for confirmation (Anthony's email on the success screen, `src/content/thank-you.json`).

Legend for "Owner":
- **Anthony** — the founder, decisions and real data only he can answer (NMLS, case studies, state list, launch confirm).
- **Ann** — anything processor/operational she owns (Ann's bio photo, confirmation of Ann's bio copy).
- **Adam** — the Salesforce admin; anything that requires a Salesforce config or webhook endpoint.
- **Third-party** — external account signup required (Meta, Google Cloud / Places, Resend). Tanner can do these in parallel but needs Anthony to own the accounts or grant access.
- **Tanner** — swap the value once the owner above delivers it.

---

## Critical (blocks launch)

These make the page either legally risky, functionally broken, or visibly embarrassing. All must be resolved before Apr 15.

| File | Line | What's needed | Owner | Notes |
|---|---|---|---|---|
| `src/content/footer.json` | 2 | Real NMLS number for the broker | Anthony | Currently renders as `NMLS #[TODO_CLIENT]` in the footer — a legal/compliance visible gap. |
| `src/content/footer.json` | 8 | Real NMLS number inside the compliance sentence | Anthony | Same NMLS number as line 2; single source once Anthony provides it. |
| `src/content/footer.json` | 3 | States 7-10 of the 10-state license list | Anthony | Currently: `["TX","FL","GA","TN","NC","IN","TODO_CLIENT","TODO_CLIENT","TODO_CLIENT","TODO_CLIENT"]`. Must match the real license list or users in missing states get no-funnel kickout. |
| `src/content/form-steps.json` | 11 | State gate tile 7 (code + label) | Anthony | `Step0State.tsx` filters out tiles whose `code` starts with `TODO_CLIENT`, so today users only see 6 state tiles instead of 10. |
| `src/content/form-steps.json` | 12 | State gate tile 8 (code + label) | Anthony | Same as above — tile is currently hidden in prod. |
| `src/content/form-steps.json` | 13 | State gate tile 9 (code + label) | Anthony | Same. |
| `src/content/form-steps.json` | 14 | State gate tile 10 (code + label) | Anthony | Same. |
| `src/content/faq.json` | 34 | Full 10-state answer to "What states do you lend in?" | Anthony / Tanner | Copy currently reads `"... plus 4 more (TODO_CLIENT — full list pending)."` — string substitution once state list lands. |
| `src/content/salesforce-schema.json` | 2 | Confirmation that this Zapier catch hook is the Platinum-tier router prod endpoint | Adam / Anthony | **Surprising finding:** webhookUrl is hardcoded to `https://hooks.zapier.com/hooks/catch/7361629/u7kupj7/`. Not a TODO marker — it looks intentional but has never been verified as Anthony's real prod webhook. `salesforce.ts` will fall back to it if `SALESFORCE_WEBHOOK_URL` env var is empty. Either confirm the Zapier URL is prod, or replace with the real Salesforce endpoint and set the env var. |
| `.env.example` | 6 | `SALESFORCE_WEBHOOK_URL` value for Vercel prod env | Adam / Anthony | Overrides the Zapier URL above. Without it, leads route into whatever the Zapier hook does. (W3-J owns the file itself — this is a "list it", not a "write it".) |

---

## Important (degrades launch quality but not blocking)

These make the page feel generic, unpersonalized, or lower-trust. Page ships and functions without them, but every one of them moves conversion. Target: resolve before Apr 15, scope-cut only if a hard blocker.

| File | Line | What's needed | Owner | Notes |
|---|---|---|---|---|
| `src/content/lo-bios.json` | 9 | Anthony's real headshot, hosted at a URL or `/public` path | Anthony | Team section currently renders an empty/initials placeholder. High-trust element per the spec. |
| `src/content/lo-bios.json` | 16 | Ann's real headshot | Ann | Spec allows shipping Anthony-only if Ann isn't ready, but the team section is designed for two. |
| `src/content/case-studies.json` | 5 | Case study 1 — anonymized first name | Anthony | All 3 deals must be real recent closes. Anthony promised to confirm 3 deals before launch (see master-build-plan.md Section 3B). |
| `src/content/case-studies.json` | 6 | Case study 1 — city | Anthony | Paired with state; renders as "Firstname, City ST". |
| `src/content/case-studies.json` | 7 | Case study 1 — state | Anthony | Must be one of the 10 licensed states. |
| `src/content/case-studies.json` | 8 | Case study 1 — property type (SFR / duplex / condo / STR) | Anthony | Matches the Q1 tile labels for consistency. |
| `src/content/case-studies.json` | 9 | Case study 1 — gross cash out (pre-haircut dollar) | Anthony | Spec originally said "gross AND net cash" — only one field in JSON (`cashOut`). Recommend Anthony give the **net** number (what the borrower wired) since that's what the Cash Card reveal promises. |
| `src/content/case-studies.json` | 10 | Case study 1 — monthly cash flow | Anthony | Dollar number like `$1,040/mo`. |
| `src/content/case-studies.json` | 11 | Case study 1 — days to close | Anthony | Should be ≤ 20 to stay honest to the "~15 business days" promise. |
| `src/content/case-studies.json` | 14 | Case study 2 — first name | Anthony | Same 7 fields as above. |
| `src/content/case-studies.json` | 15 | Case study 2 — city | Anthony | |
| `src/content/case-studies.json` | 16 | Case study 2 — state | Anthony | |
| `src/content/case-studies.json` | 17 | Case study 2 — property type | Anthony | |
| `src/content/case-studies.json` | 18 | Case study 2 — cash out | Anthony | |
| `src/content/case-studies.json` | 19 | Case study 2 — monthly cash flow | Anthony | |
| `src/content/case-studies.json` | 20 | Case study 2 — days to close | Anthony | |
| `src/content/case-studies.json` | 23 | Case study 3 — first name | Anthony | |
| `src/content/case-studies.json` | 24 | Case study 3 — city | Anthony | |
| `src/content/case-studies.json` | 25 | Case study 3 — state | Anthony | |
| `src/content/case-studies.json` | 26 | Case study 3 — property type | Anthony | |
| `src/content/case-studies.json` | 27 | Case study 3 — cash out | Anthony | |
| `src/content/case-studies.json` | 28 | Case study 3 — monthly cash flow | Anthony | |
| `src/content/case-studies.json` | 29 | Case study 3 — days to close | Anthony | |
| `.env.example` | 11 | `PUBLIC_META_PIXEL_ID` | Third-party (Meta) / Anthony | Without it, client-side pixel doesn't fire. W3-J owns .env.example, W3-K just lists it. |
| `.env.example` | 14 | `META_PIXEL_ID` (server-side CAPI) | Third-party (Meta) / Anthony | Without it, CAPI Lead events silently no-op (see `metaCapi.ts:65-66`). |
| `.env.example` | 15 | `META_CAPI_ACCESS_TOKEN` | Third-party (Meta) / Anthony | Same. Without it, CAPI Lead events silently no-op. |
| `.env.example` | 21 | `PUBLIC_GOOGLE_PLACES_API_KEY` | Third-party (GCP) / Anthony | Address autocomplete in the contact step falls back to manual 4-field address input without it — functional but clunky. |
| `.env.example` | 24 | `RESEND_API_KEY` | Third-party (Resend) / Anthony | Blank today. The fallback email pipeline becomes a soft no-op. |

---

## Nice-to-have (can ship without)

Polish or operational confirmations. Don't block launch.

| File | Line | What's needed | Owner | Notes |
|---|---|---|---|---|
| `src/content/footer.json` | 8 | Compliance disclaimer expansion (if required) | Anthony | Current text: `"Equal Housing Opportunity. DSCR Investors Network is a licensed mortgage broker. NMLS #TODO_CLIENT."` — Anthony needs to confirm this satisfies his compliance standard or dictate extra language. Master plan Section 13 Q6 flags this. |
| `src/content/thank-you.json` | 5-7 | Assigned LO placeholder (name/phone/photo) | Anthony / Tanner | These render as `[TODO_CLIENT]` placeholders on the success screen. The spec actually says the LO is assigned dynamically by Salesforce post-submit, so these JSON fields are dead wood — probably should be deleted rather than filled. Flag for Tanner, not Anthony. |
| `src/content/thank-you.json` | 9 | Confirm `anthony@dscrinvestors.net` is correct and Anthony wants it on the success screen | Anthony | **Surprising finding:** this is hardcoded as a real email, not a TODO marker. The original spec (master-build-plan.md Section 11) puts this exact line in the copy bank, but Anthony has never explicitly confirmed the email or that he wants it displayed publicly (exposure to scraper spam). 1-sentence yes/no from Anthony. |
| `src/content/hero.json` | 5-9 | Trust strip item "Licensed in 10 states (TX, FL, GA, TN, NC, IN +4)" | Tanner | **Surprising finding:** the hero trust strip only has 3 items instead of the spec'd 4. Missing: the "Licensed in X states" item (spec Section 1 / Copy Bank). Also the 3rd item reads `"Get an instant cash estimate in 60 seconds"` which is spec drift from the spec'd `"A real loan officer texts you within 2 business hours — no dialer, no robocalls"`. Not Anthony's job — this is a build-time content bug Tanner should patch during the Wave 3 content sweep. Listed here so it isn't lost. |

---

## Adjacent placeholder sweep (TODO / TBD / XXX / FIXME / PLACEHOLDER)

Only the client-data-relevant matches are listed. Code-style TODOs (refactor notes, W3-J stubs) are ignored.

| File | Line | Pattern | Notes |
|---|---|---|---|
| `src/components/islands/quote/steps/Step0State.tsx` | 35 | `TODO W3-J: wire to a partial-lead endpoint for off-state email capture` | Not client data. Owned by W3-J. Listed for completeness only. |
| `src/components/islands/quote/steps/Step1PropertyType.tsx` | 29 | `TODO W3-J: wire to partial-lead endpoint` | Same. |
| `src/components/islands/quote/steps/Step5FICO.tsx` | 36 | `TODO W3-J: wire to partial-lead endpoint` | Same. |

No `TBD`, `XXX`, `FIXME`, or `PLACEHOLDER` markers found anywhere in `src/` that are client-data-relevant.

---

## Summary for Tanner

**Anthony blockers (1 message):** NMLS, 4 missing states, 3 real closes, his + Ann's headshots, Salesforce webhook confirmation, compliance disclaimer approval, and the launch confirms. All captured in `anthony-launch-ask.md`.

**Third-party blockers Tanner can start today (parallel):** Meta Pixel ID + CAPI token, Google Places API key, Resend API key. These are account signups that don't need Anthony beyond granting access to his existing accounts.

**Bugs Tanner should fix during Wave 3 content sweep (not Anthony):**
1. `hero.json` trust strip is missing the 4th item and has wrong copy on item 3.
2. `thank-you.json` has 3 dead `loPlaceholder` TODO fields that aren't rendered and should probably be deleted.
3. `salesforce-schema.json` has a live Zapier URL that should either be confirmed as prod or moved out of JSON entirely and into env-only.
