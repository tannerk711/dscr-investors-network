# DSCR Investors Network — Master Build Plan
### Synthesized from 50 stochastic concepts (5 LP agents × 5 + 5 form agents × 5), filtered through the Apr 9 Zoom transcript with Anthony Grego + Ann Coleman

> **This document supersedes `master-landing-page-spec.md` and `build-plan.md`. Both prior files were rate-centric and were written before the Apr 9 call. Anthony killed rate-and-DSCR framing on that call. This plan rebuilds around what he actually wants.**

---

## 0. The One-Sentence Pitch (rebuilt)

> For real estate investors sitting on equity in their $300K+ rentals, DSCR Investors Network pulls cash out in 15 business days using the property's rent — so the tenant keeps paying the mortgage and the investor walks away with $80K-$120K in their pocket without touching their tax returns.

Note what's missing on purpose: no rate, no DSCR ratio, no LTV percentage, no "compare lenders," no "marketplace." Anthony said all of that on Apr 9 — "true investors don't care about rates" (Ann), "I don't even talk about rate when I sell" (Anthony), "I don't care what my DSCR ratio is" (Anthony). The page promises **two numbers and a timeline.** Nothing else.

---

## 1. The Apr 9 Pivot (what changed and why)

The previous master spec was a rate calculator with a multi-step form ending in a rate range. **Anthony explicitly killed that approach on the Apr 9 Zoom** with Ann the processor. Direct quotes:

- Anthony: *"We don't get hung up on the rate at this point."*
- Anthony: *"I don't even talk about rate. When I sell a deal, I do not talk about rate."*
- Ann: *"True investors don't care about rates."*
- Anthony: *"I don't care what my DSCR ratio is."*

**Anthony's verbatim ideal form** (he literally said this out loud while driving):
> "It should be like 3-4 questions, right? FICO 700, I've got this property, it's $400,000, I owe $200 on it, my rents are $4,000 a month. There, I can with high confidence say you're gonna be at 75% LTV. You owe $200,000, so you got $100,000. You'll be cash flowing, and have at least $100,000 in 15 business days."

That's the entire UX. The form Anthony wants is 4 questions. The result Anthony wants the user to see is **cash in hand + cash flow + 15 days**. That's it.

**Other facts captured Apr 9:**
- 680+ FICO → 75% LTV. 660 and below → 50% LTV. (Ann)
- Subtract 20 points from self-reported FICO before calculating, to under-promise. (Ann)
- $1,000/mo rent per $100,000 of loan = breakeven. (Anthony's napkin math)
- Closing fees ~10-20% haircut on gross cash-out. ($100K gross → ~$80K net.)
- Close in **15 business days** (not 21-30 from the old spec).
- **Hard kick-outs:** value < $200K, modular, mobile, 5+ acres, farmland, not rent-ready, off-state, FICO < 580.
- **Don't ask seasoning hard.** Anthony: *"Put a little note 'assuming you owned it more than 6 months,' don't make it the qualification."*
- **Address is required** (Ann: *"absolutely"*) but Anthony warned not to make the form feel like an application.
- **Lead handoff:** Salesforce → Platinum LO → Salesforce auto-texts borrower + LO → LO calls outbound within 2 business hours. NO dialer, NO Calendly, NO live transfer.
- Salesforce already auto-texts the borrower with the assigned LO's info. The thank-you screen and email should match.
- **Launch target: Wednesday April 15, 2026.**

---

## 2. Synthesis: What 50 Concepts Agreed On

Across 25 landing page concepts and 25 form concepts, the high-consensus elements (5+ independent agents):

**Landing page (every agent):**
1. NO rate displayed anywhere on the page
2. NO DSCR ratio displayed anywhere
3. Cash-in-hand + cash flow + 15-day close = the trio that anchors every section
4. Trust strip = 4 items, none of them include rate
5. Honest "who we don't lend to" disqualifier list (counter-intuitive trust builder)
6. Founder humanization (Anthony + Ann as named real people, not "our team")
7. Anthony's $1K-per-$100K rule of thumb shown somewhere on the page as a teachable hook
8. Cash-out-as-offense framing (buy your next door) beats cash-out-as-defense (consolidate debt)
9. Single dedicated LO callback messaging (no call center, no dialer)
10. 2 business hour response SLA in trust strip and process section

**Form (every agent):**
1. 4 inputs is the right number: FICO bracket + property value + current balance + monthly rent
2. Ballpark reveal BEFORE contact capture (Anthony's hard requirement)
3. Live preview updates as user moves sliders / types
4. Sticky preview bar visible during the form, not just at the end
5. Address captured after reveal, in the contact step, via Google Places autocomplete
6. Subtract 20 pts from self-reported FICO before calculating (Ann's under-promise hack)
7. Show cash-out as a RANGE (e.g. $78K-$92K), not a single number
8. Tile-card inputs for FICO bracket (better than slider for discrete brackets)
9. State filter at the front of the form (10 target states only)
10. Polite kick-outs with email capture, never hard "rejected" copy

**The single biggest UX mechanic 5+ agents independently invented:**
A live, animated cash counter that ticks up as the user fills in the form — they're literally watching their cash grow as they answer. This is the dopamine loop that gets a low-intent Meta scroller through 4 questions. It's the closest thing to "magic" in a mortgage form ever shipped.

---

## 3. The Winning Concept (merged from the strongest elements across all 50)

**Concept name:** "The 4-Question Cash Card"

**The synthesis:** Take Form A1's 4-tap minimalism + Form C2's live counter cascade + Form A4's "Deal Card" payoff metaphor + LP A2's "the form is the hero" structural decision + LP A4's Anthony rule-of-thumb authority + LP E1's specificity-as-pattern-interrupt + Form D5's address autocomplete + LP B5's "buy the house next door" cash-out-as-offense framing. Strip everything else.

**The user experience in one paragraph:**
A Meta scroller taps the ad and lands on a page where the headline asks "How much cash can your rental pull?" with a single button. They tap. Question 1 of 4 fills the screen. They answer (FICO bracket, tap-card). The screen advances. A live "Your Cash Card" sticky bar at the top starts populating: "Cash at close: calculating..." They answer property value (slider + type-override). The bar updates: "Cash at close: $87,000." They answer current balance. Bar updates. They answer monthly rent. Bar locks: "Cash at close: $78K-$92K. Cash flow: $980/mo. Closes in 15 business days." A reveal screen slides up, the numbers ramp-counter into place, and a single button says "Lock my Cash Card." Tapping it asks for first name, mobile, email, and address (autocomplete). On submit they see a thank-you screen confirming their assigned Platinum LO will text them within 2 business hours, and their numbers are simultaneously displayed below as a "Cash Card" they can screenshot. Total time: 60-90 seconds. Total typing on mobile: 1 name, 1 phone, 1 email, 1 address.

---

## 4. The Master Landing Page

### Section 1 — Hero (rebuilt around cash, not rate)

**Layout:** Split hero on desktop (50/50). Mobile = stacked, headline first.

**Headline:**
> # How much cash can your rental pull?

**Subheadline:**
> 4 questions. Real number. 15 business days from yes to wired. Your tenant keeps paying the mortgage.

**CTA button:** `Show Me My Cash →`

**Hero visual treatment:**
Right side (desktop) / below CTA (mobile): an animated mock "Cash Card" in a card-flip state. Front of card: "$94,000 in your pocket" + "$1,080/mo cash flow" + "15 business days to wire" + a pulsing "$" icon. Card has a subtle gold border. Behind it, the first question of the form is faintly visible — visual promise of what happens when they click. NO stock real estate photo. NO handshake. NO skyline. The Cash Card IS the visual.

**Trust strip (4 items, NO rate, NO DSCR jargon):**
- Closes in 15 business days
- No tax returns. No W-2s. Your rent qualifies the loan.
- A real loan officer texts you within 2 business hours — no dialer, no robocalls
- Get an instant cash estimate in 60 seconds

**Never used in customer-facing copy:** the word "licensed," specific state counts (10 vs 40 vs 47), or named individuals on the team. DSCR Investors Network is marketed as a company, not a personality. Internal targeting of the 10 Meta ad states is operational context only — the landing page never tells a visitor we only run ads in 10 states.

**What is NOT in the hero:**
- No rate. No "starting at 7.X%". No "rate range." None.
- No DSCR ratio. No "1.25 ratio." None.
- No LTV percentage anywhere visible.
- No phone number (no dialer exists; this is Meta, not call-now).
- No countdown timers, no "limited time" — Anthony wants trusted advisor, not pressure.
- No form fields in the hero itself. Form lives on Section 2 (next scroll).

---

### Section 2 — The 4-Question Cash Card Form

**This is the heart of the page.** Detailed spec in Section 5 below. From the hero, the page anchors to this section. The form replaces the hero entirely on mobile when activated (full-bleed takeover).

---

### Section 3 — Below-Form Scroll Sections

These exist for users who scroll past the form without engaging — giving them reasons to scroll back up and tap the CTA. They are NOT for users who already engaged with the form.

#### 3A. "The $1K-per-$100K Rule" (Anthony's napkin math)

A teachable explainer block, in plain language, with three worked examples:
- $300K loan, $3,000/mo rent → breakeven (rent = mortgage + escrow)
- $300K loan, $4,000/mo rent → $1,000/mo cash flow
- $400K loan, $3,000/mo rent → -$1,000/mo (this is why we kick out under-rented properties)

Headline: **"Anthony does this in his head at red lights. Now you can too."**
Subhead: "Every $100,000 you borrow needs about $1,000/month in rent to break even. Anything above that is profit in your pocket."

Why: 4+ concept agents independently identified this as a high-trust hook. It's Anthony's actual line from the call. Owning a memorable rule of thumb is brand differentiation in a category drowning in jargon.

#### 3B. "Three Recent Cash-Outs" (case studies, anonymized but specific)

Three small cards. Each shows: state + property type + dollar cash-out + monthly cash flow + close time. Anonymous (first name only) but specific.

- **Marcus, Tampa FL** — 3BR rental → $84,000 cash out, $1,040/mo cash flow, 14 days to close
- **Jessica, Atlanta GA** — duplex → $112,000 cash out, $1,400/mo cash flow, 16 days to close
- **Carlos, Indianapolis IN** — SFR → $58,000 cash out, $890/mo cash flow, 13 days to close

(All numbers must be real or anchored to real recent closes. Anthony to confirm 3 deals before launch.)

Headline: **"Three landlords. Three checks. Last 30 days."**

#### 3C. "What Happens After You Tap Submit" (process transparency)

A 4-step visual timeline. Honest. Matches Anthony's actual operation.

1. **You finish the 4 questions** → Salesforce gets your file with everything Ann needs to price it.
2. **Salesforce auto-texts you** with your assigned Platinum loan officer's name and direct number — usually within 60 seconds.
3. **Your LO calls you within 2 business hours** to confirm your real numbers. No robocalls, no Calendly gauntlet, no call center.
4. **If you move forward, you close in ~15 business days** and the wire hits your account.

Headline: **"What happens in the next 15 business days."**
Subhead: "No mystery. No 47-step application. Here's the whole thing."

#### 3D. "Who we don't lend to" (the honest kick-out list)

Counter-intuitive trust builder. 5+ concept agents independently flagged this as a high-conversion mechanic. Show the disqualifiers up front.

Headline: **"We'd rather tell you no today than waste your week."**

Bullet list:
- Property value under $200,000 (the math breaks on small loans)
- Mobile homes
- Modular homes
- Properties on 5+ acres
- Farmland
- Properties that aren't rent-ready (no major rehab in progress)
- States we don't currently fund in
- FICO under 580 (most of our lenders won't touch sub-660)

Microcopy below: "If you're outside this list, drop your email and we'll let you know when we can help."

#### 3E. "The people who actually look at your file" (team humanization)

Two short bios. NOT a "founders" section — a "the people who actually look at your file" section. Role titles only, no first names. We are marketing DSCR Investors Network as a company, not individual personalities.

- **Our Founder — DSCR Investors Network.** 20+ years in investor lending. Reviews every file personally. *"I built this for landlords because I am one. The rate doesn't matter — what matters is whether you walk away cash-flowing."*
- **Senior Processing Team — DSCR Investors Network.** Runs every file through 4-5 pricing engines and 7 wholesale lenders to find the best terms. *"Tell us everything up front. The more we know, the harder we can fight for your number."*

(Photos optional. If photos aren't ready by launch, ship initials-on-navy avatars — the copy carries the section.)

#### 3F. FAQ (8 questions, plain language)

1. **Do you pull credit?** Not until you ask us to. The 4-question form is a self-reported estimate — no hard pull.
2. **Do I need tax returns?** No. We use the rental income, not your personal income. That's what DSCR means.
3. **Can I close in my LLC?** Yes. Most of our clients do.
4. **What's the minimum FICO?** 580 at 50% LTV. Most clients are 680+. Below 580 is rare.
5. **How long does it take to close?** ~15 business days from submission to wire on a typical clean file.
6. **Is there a prepayment penalty?** Yes, standard 5/4/3/2/1. Other structures available — ask your LO.
7. **Can I use this for a short-term rental?** Yes. We use your trailing 12-month gross revenue.
8. **What states do you lend in?** TX, FL, GA, TN, NC, IN, plus 4 more (full list pending confirmation from Anthony).

#### 3G. Final CTA band

Dark background. Single line + button.

> **Still here? Run your 4 questions. Takes 60 seconds.**
> [`Show Me My Cash →`] (anchors to Section 2)

#### 3H. Footer

NMLS number (TODO_CLIENT), contact email, equal housing logo, privacy policy, terms, compliance disclaimer. No phone number (no dialer exists). No "licensed states" list — we do not use the word "licensed" in customer-facing copy.

---

## 5. The 4-Question Cash Card Form (the heart of everything)

### Design principles

- **One question per screen on mobile** (full-bleed, big tap targets)
- **Sticky live preview bar at the top** that activates after Q2 and updates after each subsequent input
- **Back button always visible top-left**
- **Progress dots at top right** (4 dots, not a giant progress bar — minimalism)
- **Tile-card inputs wherever possible** (taps beat typing on mobile)
- **Slider + type-override for dollar amounts** (slider feels like a game, type-override is for power users)
- **Counter-ramp animation on the cash number** during the reveal (1.2s ease-out-expo)
- **Address captured AFTER reveal** (contact step, via Google Places autocomplete)

### Step-by-step

**Pre-step — State gate (instant, almost invisible)**
Before Q1, a single full-screen state selector. 10 target states as large tiles + "Other state" tile. If "Other" → polite exit screen with email capture. This 1-second filter prevents wasted form completions from off-state users.

> "First — what state is your rental in?"
> [TX] [FL] [GA] [TN] [NC] [IN] [+4 more] [Other state]

**Q1 — Property type**
> "What kind of property is it?"
4 large tile cards with icons:
- Single-family rental
- 2-4 unit (duplex/triplex/4-plex)
- Condo
- Short-term rental (Airbnb/VRBO)

A small "Other" link below opens a modal: "Modular, mobile, or 5+ acres? We don't lend on those — drop your email and we'll let you know when we have options." Soft kick-out, captures email.

**Q2 — Property value (current estimate)**
> "What's it worth today?"
- Big slider, $200K to $2M, $25K snap increments
- Type-override input above the slider for power users
- Below slider: subtle "Most investors in your state are $300K-$500K"
- Floor enforced at $200K — if user tries to type lower, slider snaps back with tooltip "Min property value: $200K — anything smaller and the math doesn't work."

**Sticky preview bar activates here:** "Calculating your Cash Card..."

**Q3 — Current loan balance**
> "What do you still owe on it?"
- Slider, $0 to (value from Q2), $10K snaps
- Type-override
- "Own it free and clear? Drag to $0."

**Sticky preview bar updates:** "Cash at close: ~$94,000 (estimate sharpens with rent)"

**Q4 — Monthly rent**
> "What does it rent for per month?"
- Slider, $500 to $10,000, $100 snaps
- Type-override
- If STR was selected in Q1, question swaps to: "What's your trailing 12-month gross revenue?" with a "(divide by 12 for the monthly equivalent)" hint. Engine uses 95% of trailing 12 / 12 as the DSCR numerator.

**Sticky preview bar locks:** "Cash at close: $78K–$92K. Cash flow: $980/mo. 15 business days."

**Q5 — FICO bracket**
> "Roughly, where's your credit score?"
5 tile cards:
- 740+ (Excellent)
- 700-739 (Great)
- 660-699 (Good)
- 620-659 (Fair)
- Below 620

Microcopy: "This is self-reported. We don't pull credit until you ask us to."

If "Below 620" → modal: "We can sometimes help below 620 at lower LTV — drop your info and Anthony will reach out personally." Soft route to a special-handling lead capture.

**Reveal screen — The Cash Card**
Full-screen takeover. Slides up. Counter-ramp animation on each number (sequential — cash first, cash flow second).

```
┌─────────────────────────────────┐
│         YOUR CASH CARD          │
│                                  │
│   $78,000 - $92,000              │
│   cash in your pocket at close   │
│                                  │
│   $980/mo                        │
│   new cash flow after the loan   │
│                                  │
│   ~15 business days              │
│   from yes to wired              │
│                                  │
│   * After typical closing fees.  │
│     Final number depends on      │
│     appraisal and title.         │
│                                  │
│   [ Lock My Cash Card → ]        │
│                                  │
└─────────────────────────────────┘
```

The button copy is deliberately "Lock My Cash Card" — not "submit," not "get quote," not "sign up." "Lock" implies they already have it and they're just claiming it.

**Q6 — Contact capture (the only time we ask for personal info)**
After tapping "Lock My Cash Card," a single screen with 4 fields:

> "Where should we send your locked Cash Card?"

- First name
- Mobile phone
- Email
- Property address (Google Places autocomplete — required, this is the field Ann needs)

Microcopy under the button: *"A real loan officer from our team will text you within 2 business hours with your locked numbers. No dialer. No robocalls. No spam."*

Submit button: **`Send My Cash Card`**

**Thank you screen**
- Confirms numbers (re-displays the Cash Card)
- "Your Platinum loan officer is being assigned now. Expect a text from a [area code] number within the next few minutes, and a call within 2 business hours (Mon-Fri 9am-6pm ET)."
- Cash Card displayed below as a saveable image (right-click save / long-press save)
- Optional: SMS opt-in confirmation (TCPA compliant)
- A single line: "Want to reach out first? Email us at hello@dscrinvestors.net"

---

## 6. The Rate (Cash) Calculation Engine

This replaces the prior rate engine. The new engine outputs ONLY two numbers: **estimated cash at close (range)** and **estimated monthly cash flow (range)**. No rate. No DSCR ratio. No LTV percentage shown to user.

### Inputs
- `state` (string, must be in 10-state list)
- `property_type` (SFR / 2-4 unit / condo / STR)
- `property_value` (number, ≥ $200,000)
- `current_balance` (number, ≥ 0, ≤ property_value)
- `monthly_rent` (number, ≥ $500)
- `fico_bracket` (740+, 700-739, 660-699, 620-659, <620)

### Engine (server-side, mirror in client for live preview)

```
// Step 1: Apply Ann's hack — subtract 20 pts from self-reported FICO
// Map brackets to representative midpoint, then subtract 20
fico_adjusted = bracket_midpoint(fico_bracket) - 20

// Step 2: Determine LTV cap (Ann's brackets, simplified)
if fico_adjusted >= 680:  ltv_cap = 0.75
elif fico_adjusted >= 660:  ltv_cap = 0.65  // case-by-case grey zone
elif fico_adjusted >= 580:  ltv_cap = 0.50
else:  ltv_cap = 0  // hard kick-out

// Step 3: Calculate gross cash out
new_loan_amount = property_value * ltv_cap
gross_cash_out = new_loan_amount - current_balance
if gross_cash_out <= 0:  show "no cash to pull at this LTV" message

// Step 4: Apply fees haircut (Anthony's 10-20%)
// Use 15% as the midpoint, show as a range
net_cash_low = gross_cash_out * 0.80
net_cash_high = gross_cash_out * 0.90

// Step 5: Calculate new monthly mortgage payment
// Use a fixed assumed rate for the cash flow math (we don't show this rate)
// Based on Anthony's "everything in is about $1000 per $100K of loan" rule
// We use $1000/mo per $100K loan as the all-in PITI estimate
estimated_PITI = (new_loan_amount / 100000) * 1000

// Step 6: Calculate cash flow
// For STR: use trailing-12 / 12 * 0.95 as the rent figure
if property_type == "STR":
  rent_for_dscr = (trailing_12_revenue / 12) * 0.95
else:
  rent_for_dscr = monthly_rent

monthly_cash_flow = rent_for_dscr - estimated_PITI

// Display ranges (always show as a range, never a single number)
cash_at_close_display = "$" + round(net_cash_low, -3) + "K - $" + round(net_cash_high, -3) + "K"
cash_flow_display = "$" + round(monthly_cash_flow * 0.85, -1) + "/mo to $" + round(monthly_cash_flow * 1.15, -1) + "/mo"

// Edge cases
if monthly_cash_flow <= 0:
  display "Tight cash flow — your Loan Officer can run interest-only options"
if gross_cash_out < 10000:
  display "Not much equity to pull yet — talk to your LO about timing"
```

### Why this engine is different from the old one

The old engine produced a rate range. **This engine never displays a rate.** It uses Anthony's "$1K all-in PITI per $100K loan" rule of thumb as the cash-flow math. This is intentionally rough — the LO will refine the number on the call. The form's job is to get a directionally-correct cash + cash-flow figure that excites the user and qualifies them for the LO's call.

### Test scenarios (replaces the old 8-test suite)

1. **Anthony's verbatim example:** 700 FICO, $400K value, $200K balance, $4K rent → $108K-$135K gross cash, $87-$108K net (after fees), ~$1,000/mo cash flow ✓
2. **High-equity Tampa SFR:** 740 FICO, $500K value, $100K balance, $4,500 rent → $233K gross, ~$190K net, ~$0/mo cash flow (loan is $375K, breakeven)
3. **Free-and-clear Indianapolis duplex:** 720 FICO, $350K value, $0 balance, $3,200 rent → $263K gross, ~$215K net, $575/mo cash flow
4. **STR Nashville cabin:** 760 FICO, $600K value, $250K balance, $7,500/mo trailing-12 → $200K gross, ~$165K net, $2,375/mo cash flow
5. **Edge: 660 FICO grey zone:** 660 FICO, $400K value, $150K balance, $3,500 rent → 65% LTV cap, $110K gross, ~$90K net, $900/mo cash flow
6. **Edge: under-rented property:** 720 FICO, $400K value, $100K balance, $2,000 rent → $200K gross, ~$165K net, -$1,000/mo cash flow → trigger "tight cash flow" note
7. **Edge: $200K minimum:** 700 FICO, $200K value, $50K balance, $2,500 rent → $100K gross, ~$80K net, $1,000/mo cash flow ✓
8. **Hard kick-out: <580 FICO** → soft route to "Anthony will reach out personally"
9. **Hard kick-out: value < $200K** → slider snap-back, tooltip
10. **Hard kick-out: state not in list** → polite exit on state gate

---

## 7. Lead Handoff Flow (matches Anthony's real operation)

### What happens the instant they tap "Send My Cash Card"

1. **Webhook fires to Salesforce** with the full payload:
   - First name, mobile, email, property address
   - State, property type, property value, current balance, monthly rent
   - FICO bracket, calculated cash range, calculated cash flow range
   - UTM source/campaign, fbclid, landing page variant, timestamp
2. **Salesforce auto-routes to a Platinum-tier LO** (round-robin, existing logic)
3. **Salesforce auto-texts the borrower** with "Hi [name], I'm [LO name] with DSCR Investors Network. I have your Cash Card and I'll be calling you within 2 business hours with your locked numbers. My direct line is [phone]." (This already exists in Salesforce per Ann's Apr 9 walkthrough.)
4. **Salesforce auto-texts the LO** with "New lead assigned: [name], [state], [estimated cash], [phone]." (Also already exists.)
5. **User sees the thank-you screen** with the Cash Card re-displayed and the expectation set.
6. **Auto-email fires** within 60 seconds with:
   - PDF version of the Cash Card
   - Photo and bio of assigned LO (pulled from Salesforce at routing time)
   - "What to expect next" timeline (4-step from Section 3C)
   - A team contact email (hello@dscrinvestors.net) as a fallback escape hatch
7. **Meta CAPI server-side event** fires for `Lead` (Vercel serverless function, server-side because iOS 14.5+ kills the pixel-only path)

### Why this matches Anthony's operation
- No live transfers (no dialer)
- No Calendly (he doesn't use one)
- 2-business-hour SLA is his real process
- Salesforce auto-text already exists per Ann's Apr 9 demo
- Platinum-tier round-robin is the existing routing
- The Cash Card payload includes everything Ann needs to price the file in 2 business hours, so the LO's first call is informed, not discovery

### What does NOT exist and must NOT be built
- No call-now button
- No "schedule a call" Calendly embed
- No live chat widget
- No SMS dialer
- No GHL integration

---

## 8. Form Logic Edge Cases (consensus across all 5 form agents)

| Case | Behavior |
|---|---|
| State not in 10-state list | State gate exit screen: "We're not lending in [state] yet — drop your email and we'll let you know when we are." Email capture only. |
| Property value < $200K | Slider floors at $200K. If user tries to type lower, snap-back with tooltip. |
| Modular / mobile / 5+ acres / farmland | "Other" link below the 4 property type tiles → modal with email capture. Soft kick-out. |
| Property type = STR | Q4 (rent) swaps to "trailing 12-month gross revenue" with the /12 hint. Engine uses 95% of monthly equivalent. |
| Free-and-clear (balance = $0) | Slider supports it, copy is "Own it free and clear? Drag to $0." |
| Cash out < $10K | Reveal screen swaps to "Not much equity to pull yet — talk to your LO about timing." Still captures contact. |
| Cash flow < $0 (under-rented) | Reveal still shows the cash number but the cash flow line says "Tight cash flow — your LO can run interest-only options." Still captures contact. |
| FICO < 620 | Tile labeled "Below 620" — selecting it routes to a special-handling lead capture: "Anthony reviews these personally — drop your info and he'll reach out." |
| User abandons mid-form | sessionStorage saves progress. If they return within 7 days, "Pick up where you left off?" prompt. Also fires a partial-lead Salesforce event with whatever was captured. |
| User abandons at the contact step (after seeing reveal) | Cash Card already shown. Fire a partial-lead event with the calculated Cash Card data. Pixel fires for retargeting. |
| Address autocomplete fails / no API | Fallback to manual address input (street, city, state, zip). |
| User typing nonsense in dollar fields | Inline validation, no scary error messages. |

---

## 9. Tech Stack & File Structure (carry forward from prior plan, simplified)

### Stack (locked)
- **Astro 5** (static, Vercel adapter)
- **React 19** islands for the Cash Card form only
- **Tailwind v4** with the existing `@theme` block from `dscrinvestors-design.md`
- **Nanostores** (sessionStorage-persisted form state for resume)
- **Framer Motion** (step transitions, counter-ramp on Cash Card)
- **react-hook-form + Zod** (contact step validation)
- **Google Places API** (address autocomplete in contact step)
- **Vercel** (hosting, serverless for webhook + CAPI)
- **Resend** (transactional email — auto-responder with PDF Cash Card)
- **@react-pdf/renderer** (Cash Card PDF generation)

### Content-data separation (non-negotiable)
All copy, numbers, testimonials, FAQ, exclusion list, LO bios live in `src/content/*.json`. Components are pure renderers. Zod schemas in `src/content/schemas.ts` enforce shape. This lets Anthony swap real values without touching component code.

### File map (only the changes from the old build plan)

```
src/content/
  hero.json                 // headline, sub, trust strip — REWRITTEN, no rate
  form-steps.json           // 5 steps (state, type, value, balance, rent, FICO) — REWRITTEN
  cash-engine-config.json   // LTV brackets, fee haircut %, $1K-per-$100K rule
  case-studies.json         // 3 real recent closes (REQUIRED before launch)
  faq.json                  // 8 Q/A — REWRITTEN, no rate references
  exclusions.json           // honest "who we don't lend to" list
  lo-bios.json              // Anthony + Ann
  thank-you.json            // SLA copy, LO placeholder, email template
  salesforce-schema.json    // 15+ field webhook payload
  // REMOVED: pricing-matrix.json, compliance.json (no rate to gate)

src/lib/cash-engine/        // REWRITTEN (was pricing/)
  calculateCash.ts          // returns { cashLow, cashHigh, cashFlowLow, cashFlowHigh, edgeCases }
  ficoBrackets.ts
  ltvBrackets.ts
  feesHaircut.ts
  __tests__/cash-engine.test.ts  // 10 scenarios from Section 6

src/components/islands/quote/
  CashCardForm.tsx          // root mount (replaces InstantQuote.tsx)
  CashCardPreview.tsx       // sticky live preview bar
  steps/
    Step0State.tsx
    Step1PropertyType.tsx
    Step2PropertyValue.tsx
    Step3LoanBalance.tsx
    Step4MonthlyRent.tsx
    Step5FICO.tsx
    Step6CashCardReveal.tsx     // the animated reveal
    Step7Contact.tsx             // contact capture (after reveal)
    SuccessScreen.tsx
  store/cashCardStore.ts          // nanostores

src/components/sections/
  Hero.astro                // REWRITTEN (Cash Card mock visual)
  RuleOfThumb.astro         // 3A — Anthony's $1K-per-$100K explainer
  CaseStudies.astro         // 3B — three real cash-outs
  Process.astro             // 3C — 4-step timeline
  Exclusions.astro          // 3D — honest disqualifier list
  Team.astro                // 3E — Anthony + Ann
  FAQ.astro                 // 3F — 8 questions
  FinalCTA.astro            // 3G — dark band

src/pages/api/
  lead-webhook.ts           // Salesforce webhook + CAPI fallback
  lead-fallback.ts          // Resend email fallback if Salesforce down
```

### Files to DELETE before/during build (Section 12 below)

---

## 10. Build Waves (compressed for the Apr 15 launch)

**Today: April 9. Launch: April 15. That's 6 days. The plan is compressed accordingly.**

### Wave 0 — Contract lock (Apr 10 morning, ~30 min, 1 agent)
- Astro scaffold, Tailwind theme, Zod schemas, JSON content seeds with `TODO_CLIENT` markers, empty page. `npm run build` clean.

### Wave 1 — Foundation (Apr 10 afternoon, 4 parallel agents)
- **W1-A Cash Engine + 10 unit tests** (highest priority — gates Wave 2)
- **W1-B Hero + Cash Card mock visual + Header + Footer**
- **W1-C Below-form sections (3A, 3B, 3C, 3D, 3E, 3F, 3G)** — all Astro, all read JSON
- **W1-D Webhook + CAPI scaffolding + Resend email fallback**

**Gate G1:** all 10 cash engine tests green. If red, halt.

### Wave 2 — Cash Card form (Apr 11, 4 parallel agents)
- **W2-E Form Core** — CashCardForm root, store, step router, Framer transitions, sticky preview bar
- **W2-F Steps 0-4** — State gate, property type tiles, value slider, balance slider, rent slider
- **W2-G Step 5 + Reveal** — FICO tiles, Cash Card reveal screen with counter-ramp animation
- **W2-H Step 6 (Contact) + Success Screen + PDF generation** — react-hook-form + Zod, Google Places autocomplete, react-pdf Cash Card

**Gate G2:** E2E walkthrough on real iPhone — full flow from state gate to thank-you screen, webhook fires to test endpoint with full payload, Cash Card numbers match Q-input expectations, ballpark renders BEFORE contact form mounts (DOM-order assertion).

### Wave 3 — Polish + Real Data (Apr 12-13, 3 parallel agents)
- **W3-I Motion + Microcopy** — counter-ramp tuning, slider haptics, Anthony-style microcopy at every step
- **W3-J Analytics + Edge Cases** — Meta Pixel + CAPI, partial-lead events, exit-intent modal, sessionStorage resume
- **W3-K Real Content Swap** — Anthony provides 3 real case studies, NMLS, Anthony+Ann photos, full 10-state list, Salesforce webhook URL. Tanner swaps JSON.

**Gate G3:** Lighthouse mobile ≥90, Meta Pixel Helper confirms `Lead` event, axe-core clean, all `TODO_CLIENT` markers replaced.

### Wave 4 — Launch (Apr 14, 1 day buffer)
- Real device QA on iPhone + Android + iPad
- 3 real test leads through to Salesforce, verify Platinum LO routing
- Anthony + Ann walk through the live preview
- DNS cutover authorization
- Meta ad creative finalized to match the LP headline ("How much cash can your rental pull?")
- Launch campaigns paused until DNS propagates
- **Apr 15 morning: Anthony flips the launch switch, ads go live at $125/day**

### Risk: Launch slip
If Wave 2 doesn't clean up by end of Apr 11, scope-cut: ship without the case studies section (3B), without the PDF generator, without the resume-link feature. Those are all P1, not P0. The P0 list is: hero, 4-question form, reveal, contact, webhook, thank-you, footer. Everything else is compressible.

---

## 11. Copy Bank (the exact words to use)

### Hero
- Headline: **How much cash can your rental pull?**
- Sub: **4 questions. Real number. 15 business days from yes to wired. Your tenant keeps paying the mortgage.**
- CTA: **Show Me My Cash →**

### Trust strip
- Closes in 15 business days
- No tax returns. No W-2s. Your rent qualifies the loan.
- Get an instant cash estimate in 60 seconds
- A real loan officer texts you within 2 business hours

### Form microcopy
- State gate: "First — what state is your rental in?"
- Q1 (type): "What kind of property is it?"
- Q2 (value): "What's it worth today?"
- Q3 (balance): "What do you still owe on it?"
- Q4 (rent): "What does it rent for per month?"
- Q5 (FICO): "Roughly, where's your credit score?"
- FICO microcopy: "This is self-reported. We don't pull credit until you ask us to."

### Cash Card reveal
- Headline: **Your Cash Card**
- Cash line: **$78,000 - $92,000 cash in your pocket at close**
- Cash flow line: **$980/mo new cash flow after the loan**
- Timeline line: **~15 business days from yes to wired**
- Asterisk: *After typical closing fees. Final number depends on appraisal and title.*
- Button: **Lock My Cash Card →**

### Contact step
- Headline: **Where should we send your locked Cash Card?**
- Microcopy: *A real loan officer from our team will text you within 2 business hours with your locked numbers. No dialer. No robocalls. No spam.*
- Button: **Send My Cash Card**

### Thank you
- Headline: **You're locked in.**
- Sub: *Your Platinum loan officer is being assigned now. Expect a text within the next few minutes from a [area code] number. They'll call you within 2 business hours (Mon-Fri 9am-6pm ET).*
- Below the Cash Card: *Want to reach out first? Email us at hello@dscrinvestors.net*

### Section 3A (Rule of thumb)
- Headline: **Anthony does this in his head at red lights. Now you can too.**
- Sub: *Every $100,000 you borrow needs about $1,000/month in rent to break even. Anything above that is profit in your pocket.*

### Section 3D (Exclusions)
- Headline: **We'd rather tell you no today than waste your week.**
- Microcopy: *If you're outside this list, drop your email and we'll let you know when we can help.*

### Section 3G (Final CTA)
- Headline: **Still here? Run your 4 questions. Takes 60 seconds.**
- Button: **Show Me My Cash →**

---

## 12. Files to DELETE from this project

After every concept agent finished and this master plan replaced everything, the following files have zero forward value and risk pattern-matching by future agents on stale content.

| File | Verdict | Reason |
|---|---|---|
| `master-landing-page-spec.md` | **DELETE** | Rate-centric spec, killed by Apr 9 transcript. Replaced by this file. |
| `build-plan.md` | **DELETE** | Built on the old rate-centric spec. Replaced by Section 10 of this file. |
| `DSCRinvestornetwork-apr9.vtt` | **DELETE** | Distilled into Section 1 (Apr 9 Pivot) and operational decisions throughout. Tiebreaker evidence preserved here. |

**KEEP:**
- `master-build-plan.md` ← **this file, the new canonical source of truth**
- `dscrinvestors-design.md` ← active design system (tokens, components, animations, accessibility — still valid)

---

## 13. Open Questions for Anthony

> **Section 13 superseded by `anthony-launch-ask.md` and `client-handoff-inventory.md` (generated by W3-K, Wave 3).**

---

## 14. The Single Biggest Bet in This Plan

The single biggest bet is **stripping every number except cash and cash flow.** Every other DSCR lender on Meta shows rates, ratios, LTV percentages, and program names. This page shows two numbers: the cash in your pocket and your monthly cash flow. That's the entire pitch.

This bet is justified by Anthony's verbatim instructions on Apr 9 ("I don't even talk about rate"), Ann's confirmation ("true investors don't care about rates"), and 50 independent stochastic concept agents — every single one of which converged on the same answer when given the Apr 9 context. There is no rate angle worth defending.

If this bet is wrong, the failure mode is sophisticated investors bouncing because they want to see a rate. The mitigation is the LO's 2-business-hour follow-up call, which is the natural place to discuss rate when the borrower asks.

If this bet is right, the failure mode for competitors is that they continue showing rates and DSCR ratios while Anthony's page strips it all away — making this page the only one in the category that respects the buyer's actual decision criteria (cash flow + cash out).

---

## 15. Ready to Build

When Tanner says "go," Wave 0 starts immediately. Anthony's open questions can be answered in parallel with Wave 1 — none of them block the build. The page can run end-to-end with `TODO_CLIENT` placeholders until the real values arrive in Wave 3.

The Cash Card is the entire pitch. Build it tight. Launch it Wednesday.
