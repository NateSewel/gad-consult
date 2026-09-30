---
target: landing
total_score: 26
p0_count: 0
p1_count: 3
timestamp: 2026-09-30T22-01-57Z
slug: client-src-pages-landing-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form spinner + disabled state, toasts on submit/copy/newsletter, active-section nav underline. "Learn more" feedback is a toast + scroll only — easy to miss. |
| 2 | Match System / Real World | 2 | "Conversion-focused consults" (CTA band eyebrow) is internal marketing-speak, not client language. |
| 3 | User Control and Freedom | 3 | Mobile menu closes, FAQ accordion collapses, no traps. |
| 4 | Consistency and Standards | 3 | "Learn more" / "Work with us" / "Schedule Consultation" all resolve to the same contact-scroll action under different labels. |
| 5 | Error Prevention | 3 | Zod validation + inline errors, honeypot anti-spam field, sensible placeholders. |
| 6 | Recognition Rather Than Recall | 3 | No icon-only nav, active states visible, service list is explicit. |
| 7 | Flexibility and Efficiency | 1 | "Learn more" sets `serviceFocus` state but never wires it into `ContactForm`'s select — system has the data, discards it. |
| 8 | Aesthetic and Minimalist Design | 2 | Gradient-icon-tile unit reused 15+ times across sections; nothing reads as more important than anything else. |
| 9 | Error Recovery | 3 | Field-level inline errors, server errors mapped to specific fields, 409-duplicate newsletter handled gracefully. |
| 10 | Help and Documentation | 3 | FAQ directly answers the anxious-first-timer's real questions. |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

#### Anti-Patterns Verdict

**LLM assessment (Assessment A):** Yes — a design-literate visitor would guess "AI made this" within seconds. Three absolute-ban patterns present simultaneously: gradient-clip headings on every `<h2>` (`SectionHeading.tsx:43`) — which DESIGN.md itself already flags as a known legacy issue, unfixed; an eyebrow kicker on all 9 sections (DESIGN.md calls this "a deliberate, singular pattern" that becomes the tell when repeated as scaffolding); and an identical 6-card "Why Choose Us" grid where every card ends with the exact same sentence verbatim. Plus a hero-metric-adjacent stat-chip triplet, a generic stock-photo skyline hero image, and internal jargon ("Conversion-focused consults") leaking into client-facing copy — both named anti-references from PRODUCT.md.

**Deterministic scan (Assessment B):** Static CLI scan (`detect.mjs --json client/src`, exit 2) found 2 source-level findings: `gradient-text` at `SectionHeading.tsx:43` (confirms A's top finding at the exact line) and `overused-font` (Fraunces) — likely a non-issue, since Fraunces is deliberately heading-only per DESIGN.md's "One-Serif Rule" and the flagged 21%-of-text share is consistent with "headings only," not a lazy default.

The **live-rendered browser overlay** (46 anti-patterns across the actual DOM) goes further and quantifies what A found qualitatively: the `gradient-text` hit repeats on every section heading, and **nested-cards** (×6) and **cramped-padding** (×8, children flush against borders) independently corroborate the "assembled from a kit" verdict. It also surfaces something **A's review didn't catch**: real contrast failures — see the new Priority Issue below. One overlay reading is a likely **false positive**: "white text on #f8f9fc, 1.1:1" (×8) almost certainly reflects the detector reading the page's base `background-color` rather than the hero's actual dark image/gradient backdrop the white text sits on — screenshots confirm the hero text is legible in context. Several of the repeated "text #000000 on #181a26, 1.2:1" hits are paired 1:1 with the gradient-text hits on the same elements — the detector can't see through `bg-clip-text` and falls back to reading an un-rendered color, so fixing the gradient-text pattern will likely resolve or change most of these paired readings too.

#### Overall Impression

The page has real craft underneath (the contact form, the testimonials, the FAQ) but the surface reads as templated: gradient headings, an eyebrow on every section, and an identical card grid repeat across all 9 sections with no variation in rhythm or hierarchy — confirmed independently by both the design review and the deterministic scan. The single biggest opportunity is de-templating the section scaffold (DESIGN.md already wrote the fix; it just hasn't been applied) and fixing the two real accessibility contrast failures the detector surfaced that the design review didn't test for numerically.

#### What's Working

1. **Contact form engineering** (`ContactForm.tsx`) — honeypot spam field, Zod validation with inline per-field errors, server errors mapped to the specific field, never wiped on failure. Real "reduce uncertainty" craft, not just polish.
2. **Testimonials are genuinely specific** — real names and named services instead of generic "Great service!" filler. The one section that clearly escapes template-feel.
3. **FAQ content is genuinely useful** — answers exactly what an anxious first-timer would ask (confidentiality, what happens after submitting, urgency, jurisdiction).

#### Priority Issues

**[P1] Compounding template signals: gradient-clip headings + eyebrow-on-every-section + identical "Why Choose Us" card grid with verbatim repeated copy**
- **Why it matters**: PRODUCT.md Principle 2 — "a firm that wants clients to feel confident should itself look confident — no generic templates standing in for that confidence." Confirmed by both assessments independently; two of the three patterns are things DESIGN.md already flagged as known legacy issues.
- **Fix**: Change `SectionHeading.tsx:43` to solid `text-foreground` (DESIGN.md's own instruction). Drop the eyebrow pill from most sections, keeping it for 1-2 deliberate moments. Rewrite the 6 "Why Choose Us" card closers individually instead of reusing "Designed to reduce uncertainty — and keep you moving." verbatim.
- **Suggested command**: `$impeccable quieter`

**[P1] Real contrast failures on brand-color surfaces**
- **Why it matters**: PRODUCT.md sets WCAG 2.1 AA as the accessibility target. The detector found the primary CTA button (white text on `#EC1D21`) at 4.4:1 — just under the 4.5:1 body-text threshold — and muted-foreground gray text (`#606676`) on a fire-red-tinted background at 1.3:1, a severe real failure, repeated 6 times. Neither surfaced in the manual design review; only the deterministic scan caught it.
- **Fix**: Deepen the red slightly or bump the button label's weight/size into the "large text" 3:1 bracket; locate and fix whichever component renders muted-foreground text over a red-tinted surface (likely a component reused in a colored section without its text-color override).
- **Suggested command**: `$impeccable audit`

**[P1] Team photo tonal mismatch undermines the credibility section**
- **Why it matters**: PRODUCT.md names named team bios as one of three things that carry credibility claims. "Adaeze Nwosu, Associate Counsel" is shot as a moody editorial/fashion portrait (sunglasses, statement jewelry) inconsistent with the founder's corporate portrait beside it — reads as an unvetted stock asset exactly where the page is trying to build trust.
- **Fix**: Reshoot or replace with a photo matching the founder's studio lighting/wardrobe register.
- **Suggested command**: `$impeccable polish`

**[P2] Internal marketing jargon and a mislabeled CTA break "speak the user's language"**
- **Why it matters**: "Conversion-focused consults" (CTA band eyebrow) describes the firm's own KPI, not the visitor's problem. Separately, "Learn more" on every `ServiceCard` doesn't show more — it scrolls to the same generic contact form every other CTA leads to.
- **Fix**: Replace "Conversion-focused consults" with visitor-facing copy or remove it. Build real service detail or rename the button to describe what it actually does.
- **Suggested command**: `$impeccable clarify`

**[P2] Services section overloads choice and drops user context**
- **Why it matters**: 9 full-size cards shown simultaneously exceeds the cognitive-load ceiling for a single decision point, right at the section meant to route a possibly time-pressured first-timer. Clicking "Learn more" sets `serviceFocus` state but never wires it into `ContactForm`'s actual select — the system has the answer and discards it.
- **Fix**: Group the 9 services into 3-4 categories with progressive disclosure. Pass `serviceFocus` into `ContactForm` to pre-fill the select.
- **Suggested command**: `$impeccable distill`

#### Persona Red Flags

**Jordan (Confused First-Timer)**: Faces all 9 service cards at once with no grouping to map a plain-language problem to a category. Clicks "Learn more" expecting an explanation, gets scrolled to a blank form with only a toast tip that vanishes. "Conversion-focused consults" has no frame of reference for Jordan.

**Riley (Deliberate Stress Tester)**: Clicks "Learn more," refreshes before submitting — `serviceFocus` is local state, silently lost even though the `#contact` anchor persists. No server-side link between a clicked service and the submitted record, so "we'll route you" is unverifiable. The honeypot `website` field is `tabIndex={-1}`/`aria-hidden` but not `disabled` — still programmatically fillable.

**Casey (Distracted Mobile User)**: On a 390px viewport, 9 full-height service cards require heavy thumb-scrolling before reaching actual conversion actions. The mobile hamburger panel has no dimming scrim, so hero content stays tap-looking underneath the open menu. Copy-to-clipboard on phone/email/address cards is a genuine thumb-friendly win.

**Ngozi (project-specific — time-pressured, first-time Nigerian business/individual client)**: The FAQ and the office-hours card both instruct "include 'Urgent' in your message subject line" — but the form has no subject field at all. The "Fast Response" promise sits in the hero, disconnected by a full scroll from the actual submit button. She meets the mismatched Associate Counsel photo right when she wants confidence about who handles her matter.

#### Minor Observations

- FAQ + contact-hours card instruct users to use a "subject line" the form doesn't have — inaccurate instruction, not just an edge case.
- `FooterNewsletter.tsx:88` has a dead `onClick={() => {}}` on a submit button — leftover no-op.
- `SocialBtn` renders fully greyed-out with no tooltip when `href` is missing — looks broken rather than "not configured."
- The hero eyebrow pill's `Scale` icon spins continuously (20s infinite) right next to the primary headline — decorative motion competing for attention at the most important reading moment.
- Header's `glass` treatment is applied to the sticky nav at all times, broader than DESIGN.md's stated "rare accent" rule — likely a defensible chrome-vs-content exception, worth reconciling in writing.
- Detector also found: `gpt-thin-border-wide-shadow` (×1, matches the skill's own "ghost-card" ban), `layout-transition` on non-transform properties (×2, `max-height`/`width`), `line-length` ~85 chars/line (×3, aim <80 per the detector, <65-75ch per the skill's own rule).
- `overused-font` (Fraunces, 21% of text) is likely a non-issue — consistent with heading-only usage per DESIGN.md's "One-Serif Rule," not a lazy default.

#### Questions to Consider

- If nine sections all share one eyebrow-pill + gradient-heading + icon-tile-grid scaffold, what actually tells a visitor "this firm designed this" rather than "this was assembled from a kit"?
- What would every piece of copy on this page look like if it had to pass a test: would an anxious first-time client actually say this sentence back to a friend?
- If one of three team photos reads as a stock/fashion shoot rather than a colleague, does that quietly damage the credibility of the other two by association?
