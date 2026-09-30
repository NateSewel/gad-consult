---
target: landing
total_score: 27
p0_count: 0
p1_count: 1
timestamp: 2026-09-30T22-32-36Z
slug: client-src-pages-landing-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No loading state for initial site-config/SEO fetch. |
| 2 | Match System / Real World | 3 | "Fintech & Tech" vs. "Fintech Licenses" service labels overlap and confuse. |
| 3 | User Control and Freedom | 3 | No true escape needed anywhere destructive. |
| 4 | Consistency and Standards | 2 | Hard-coded hex bypassing tokens found twice; `rounded-[2rem]` breaks the documented 16/24px radius system in 3 places. |
| 5 | Error Prevention | 3 | Zod + react-hook-form validation, honeypot field, format hints. |
| 6 | Recognition Rather Than Recall | 3 | Service-focus reminder tag nicely echoes back at the contact form. |
| 7 | Flexibility and Efficiency | 2 | One rigid path (expected for a marketing site). |
| 8 | Aesthetic and Minimalist Design | 2 | Same icon-tile card module repeats across 5 sections. |
| 9 | Error Recovery | 3 | Inline field-level errors, form state preserved on failure. |
| 10 | Help and Documentation | 3 | FAQ covers real objections. |
| **Total** | | **27/40** | **Acceptable — genuine fixes landed, offset by newly-surfaced issues** |

#### Anti-Patterns Verdict

**LLM assessment:** Improved — no longer an immediate "AI made this" on first scroll. All three original fixes verified genuinely shipped on the rendered page: gradient-clip headings gone, eyebrow kept to exactly one section, WhyCard closers all distinct. But the identical repeated-copy anti-pattern resurfaced in `ServiceCard.tsx:72-74`, which hard-codes the same closing line on all 9 service cards. A second hard-coded-hex contrast bug was also found (`TeamCard`'s "Founder" badge, `bg-[#EC1D21]`, ~4.40:1) — fixed live during this run (now `bg-primary`, verified 4.65:1). `rounded-[2rem]` (32px) breaking the documented 24px radius ceiling was also flagged.

**Deterministic scan:** Static CLI scan now finds just 1 finding (`overused-font`, non-issue) — down from 2, confirming gradient-text is genuinely gone at the source level. The live browser overlay still reported "gradient-text ×2" and "muted-on-red ×6" — verified directly against the live DOM: zero elements have `background-clip: text`, and every flagged "muted-on-red" element has empty text content (decorative pulse dots/blur orbs) — both confirmed detector artifacts. A follow-up grep found a 3rd `rounded-[2rem]` instance in `client/src/pages/not-found.tsx:8`.

#### Overall Impression

The de-templating fix holds up under independent re-inspection. The same anti-pattern habit (verbatim repeated copy, hard-coded hex bypassing tokens) reappeared in an adjacent component that wasn't re-checked — these were component-level bugs, not page-level ones.

#### What's Working

1. All three original P1 fixes verified genuinely shipped on the rendered page, independently re-confirmed.
2. The hero CTA contrast fix holds under direct measurement (4.65:1).
3. WhyCard closers read as genuinely distinct, on-brand copy.

#### Priority Issues

**[P1] `ServiceCard` repeats an identical closing line on all 9 cards**
- **Why it matters**: same anti-pattern as the fixed WhyCard, just never ported over; Services is the first content section visitors see.
- **Fix**: write one distinct closer per service tied to its actual practice area.
- **Suggested command**: `$impeccable clarify`

**[P2] Five sections share one visual template** (Services, How-it-works, Team, Why-Choose-Us, Testimonials all = icon-square + heading + muted description)
- **Why it matters**: compositional sameness persists even after the copy fix.
- **Fix**: give at least 2 of the 5 grids a genuinely different shape.
- **Suggested command**: `$impeccable layout`

**[P2] `rounded-[2rem]` (32px) on 3 surfaces** (About founder panel, CTA band, `not-found.tsx`)
- **Why it matters**: breaks the documented 24px radius ceiling; matches SKILL.md's named "32px+ on cards" tell.
- **Fix**: change to `rounded-3xl` (24px).
- **Suggested command**: `$impeccable polish`

**[P2] Team photo mismatch — still open**, deferred per user decision pending a real replacement photo.

#### Persona Red Flags

**Jordan**: "Fintech & Tech" vs. "Fintech Licenses" — similarly-named cards, no distinguishing signal beyond description text.
**Riley**: Caught the ServiceCard copy-paste within seconds of comparing cards side by side.
**Ngozi**: Team photo inconsistency is still the single biggest hit to a time-pressured first-timer's trust judgment.

#### Minor Observations

- Hero's accent word "Business" uses hard-coded `text-[#F69899]` instead of a token.
- Hero eyebrow copy "A modern Law Firm to meet Modern needs" has inconsistent capitalization.
- `FooterNewsletter.tsx:88` dead `onClick={() => {}}` still present.

#### Questions to Consider
- Worth a `bg-\[#`/`text-\[#` grep sweep before every ship now that the same bug has appeared twice?
- What would How-it-works look like as the one section that doesn't share the common card shell, given it's the one place SKILL.md's numbered-sequence exception legitimately applies?
