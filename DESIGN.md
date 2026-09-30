---
name: GAD Legal Consult
description: Navy-and-firebrick marketing site for a Nigerian law firm — confident, approachable, momentum-focused
colors:
  institutional-navy: "#2B348C"
  firebrick-red: "#E11417"
  near-black-ink: "#111111"
  neutral-bg: "#F8F9FC"
  neutral-ink: "#181A26"
  neutral-card: "#FFFFFF"
  neutral-border: "#DADDE6"
  neutral-muted: "#EFF1F5"
  neutral-muted-ink: "#606676"
typography:
  display:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.875rem, 1vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control-sm: "3px"
  control-md: "6px"
  control-lg: "9px"
  surface-md: "16px"
  surface-lg: "24px"
  pill: "9999px"
spacing:
  sm: "0.75rem"
  md: "1.5rem"
  lg: "3.5rem"
  section-y: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.firebrick-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.surface-md}"
    padding: "12px 24px"
  button-shadcn-default:
    backgroundColor: "{colors.firebrick-red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control-md}"
    padding: "8px 16px"
  button-shadcn-secondary:
    backgroundColor: "{colors.institutional-navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control-md}"
    padding: "8px 16px"
  card-default:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.surface-lg}"
    padding: "24px"
---

# Design System: GAD Legal Consult

## 1. Overview

**Creative North Star: "The Trusted Advisor's Office"**

A well-appointed, modern practice, not a courtroom drama. Institutional Navy grounds the space with quiet authority; Firebrick Red is reserved for the moments that call for action — a button, a link underline, a stat icon — never spread across a whole surface. Depth comes from soft, layered shadows that respond to touch (cards lift on hover, the primary CTA's glow intensifies) rather than flat SaaS minimalism or heavy, dated skeuomorphism. Fraunces serif headlines against IBM Plex Sans body copy give it a considered, editorial weight without tipping into old-fashioned "gavel and scales" law-firm cliché — which this system explicitly rejects, along with generic AI-template tells (gradient text, eyebrow kickers on every section, identical icon-tile grids) and an overly formal, bureaucratic tone.

**Key Characteristics:**
- Navy-authority, red-action: two brand hues with clearly separated jobs, not a blended palette.
- Soft ambient depth: an eight-step shadow scale (`--shadow-2xs` → `--shadow-2xl`) used for hover response, not static decoration.
- Serif display type, sans body: Fraunces carries every heading site-wide; IBM Plex Sans carries everything else.
- Two radius systems by surface role: tight radii (3–9px) on form controls, generous radii (16–24px) on cards and sections.
- Glass/backdrop-blur is a rare accent (hero stat chips only), never a default surface treatment.

## 2. Colors

Two-hue committed palette (navy + red) over a cool, barely-tinted neutral scale — restrained everywhere except the two brand hues, which carry real weight where they appear.

### Primary
- **Firebrick Red** (#E11417): The action color. Primary buttons, links, focus rings, active-state accents, chart series 1. Used deliberately and sparingly — it marks "do this next," not "this is branded."

### Secondary
- **Institutional Navy** (#2B348C): The authority color. Secondary buttons, the hero's dark backdrop, nav active-link underline, founder-card border accent. Reads as established and grounded rather than loud.

### Neutral
- **Neutral Ink** (#181A26): Body text and default foreground (`--foreground`).
- **Near-Black Ink** (#111111): Reserved token (`--ink`) for the darkest text/UI needs beyond standard foreground.
- **Neutral Background** (#F8F9FC): Page background — a barely-blue-tinted near-white, not a warm cream.
- **Neutral Card** (#FFFFFF): Card and popover surfaces, pure white against the tinted page background so cards visibly lift off the page.
- **Neutral Border** (#DADDE6): Default border/divider color, used at full and reduced opacity (`/70`, `/90`) depending on emphasis.
- **Neutral Muted** (#EFF1F5) / **Neutral Muted Ink** (#606676): Muted surface fills and secondary/supporting text.

### Named Rules
**The Two-Job Rule.** Navy and red never trade places. Navy = authority/structure (backgrounds, secondary actions, underlines). Red = action (primary buttons, links, focus, urgency). If a red element isn't asking for a click, it's used wrong.

## 3. Typography

**Display Font:** Fraunces (with ui-serif, Georgia fallback)
**Body Font:** IBM Plex Sans (with ui-sans-serif, system-ui fallback)

**Character:** A confident serif/sans pairing — Fraunces' soft variable-optical-size curves keep the authority from feeling cold, while IBM Plex Sans keeps body copy plain and easy to scan. Every heading tag (h1–h6) is bold and tight-tracked by default; there is no plain-weight heading anywhere in the system.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.5rem)`, leading 1.05): Hero headline only, set in white with a drop-shadow over the dark hero backdrop.
- **Headline** (700, `text-3xl sm:text-4xl lg:text-5xl`, leading 1.05): Section titles (Services, Team, Why Choose Us, Testimonials, FAQ). Currently rendered via `bg-clip-text` gradient in `SectionHeading` — see Don'ts below.
- **Body** (400, `text-sm sm:text-base lg:text-lg`, leading relaxed): Section descriptions and card copy. Cap prose width at 65–75ch.
- **Label** (600, `text-xs`–`text-sm`): Eyebrow pills, nav links, stat titles, badge text.

### Named Rules
**The One-Serif Rule.** Fraunces is a heading-only instrument. It never appears in body copy, form controls, or nav — that boundary is what keeps the pairing feeling designed rather than accidental.

## 4. Elevation

Layered, ambient depth: an eight-step shadow scale (`--shadow-2xs` at 1px/4% opacity through `--shadow-2xl` at 48px/28% opacity) that exists to respond to interaction, not to sit static on every surface. Cards rest at `shadow-sm` and grow to `shadow-lg` on hover alongside a translate-up lift; the primary CTA button uses a colored (fire-tinted) glow shadow instead of a neutral one, so its elevation reads as "branded action" rather than generic card depth. Glass/backdrop-blur (`backdrop-blur-sm`, translucent white fill) is a rare accent reserved for floating elements over imagery (hero stat chips) — never a default card or section treatment.

### Shadow Vocabulary
- **Ambient rest** (`--shadow-sm`: `0 2px 6px rgba(16,24,40,0.08), 0 1px 0 rgba(16,24,40,0.06)`): Default card/component elevation at rest.
- **Hover response** (`--shadow-lg`: `0 24px 70px rgba(16,24,40,0.18)`): Cards and nav chips on hover.
- **Branded glow** (`cta-shadow` / `cta-shadow-hover`, fire-tinted, defined in `index.css`): Primary CTA button only — the one place elevation carries brand color instead of neutral gray.

### Named Rules
**The Response, Not Decoration Rule.** No card ships at `shadow-lg` or above by default. Heavy shadows are earned by interaction (hover, active), never a resting state.

## 5. Components

### Buttons
- **Shape:** Two radius identities by button type — shadcn `Button` primitive uses control radii (`rounded-md`, 6px); the bespoke `PrimaryCTA` uses surface radii (`rounded-2xl`, 16px).
- **Primary (shadcn `default` variant):** Firebrick Red fill, white text, 1px border at a darkened border-shade of the fill color (`--primary-border`), `hover-elevate`/`active-elevate-2` utility overlay.
- **Primary (signature `PrimaryCTA`):** Fire gradient fill (`135deg`, full fire → 85%-opacity fire), animated shimmer sweep, radial highlight overlay, colored glow shadow that intensifies on hover, arrow icon that nudges right on a 1.5s loop. Reserved for the highest-intent actions ("Schedule Consultation").
- **Secondary:** Institutional Navy fill, white text, same border-shade treatment as primary.
- **Outline / Ghost:** Transparent fill, inherits surrounding surface color; ghost keeps a transparent border reserved so a later real border doesn't shift layout.
- **Hover / Focus:** `hover-elevate`/`active-elevate-2` (template overlay system) on shadcn buttons; `whileHover`/`whileTap` scale+lift on `PrimaryCTA`; all interactive controls get a visible focus ring (`focus-visible:ring`) at brand-red hue.

### Cards
- **Corner Style:** `rounded-3xl` (24px) is the dominant card radius across Why-Choose-Us, Team, and Testimonial cards; `rounded-2xl` (16px) is used for smaller chips (logo cards, stat chips, mobile nav panel).
- **Background:** Pure white (`bg-card`) against the tinted `background`, with a `border-border/70` hairline.
- **Shadow Strategy:** See Elevation — `shadow-sm` at rest, `shadow-lg` + translate-up on hover.
- **Internal Padding:** `p-6` (24px) is the standard card padding.

### Navigation
- **Style:** Horizontal link row, `font-semibold text-sm`, `text-foreground/80` at rest brightening to full `text-foreground` on hover, with a `bg-muted/70` hover fill on a `rounded-xl` (12px) hit area.
- **Active state:** A short navy underline pill (`h-0.5 w-8 bg-secondary rounded-full`), centered under the active link — not a full-width border, not a color change on the text itself.
- **Mobile:** Collapses to a `rounded-2xl` card panel (`bg-card/70`, `backdrop-blur`, `shadow-sm`) holding a stacked link list plus the CTA.

### Stat / Info Chips (signature pattern)
- **Style:** Glass treatment — `bg-white/8`, `backdrop-blur-sm`, `border-white/15` — used only when floating over the hero's dark image backdrop. Icon + two-line text (bold title, muted description).

## 6. Do's and Don'ts

### Do:
- **Do** keep Firebrick Red to action moments only — buttons, links, focus rings, the nav active-underline. It should never read as "the brand color used everywhere."
- **Do** give every card a resting `shadow-sm` and let `shadow-lg` + lift be the hover reward, never the default.
- **Do** set every heading in Fraunces, bold, tight tracking — never a plain-weight or sans heading.
- **Do** reserve glass/backdrop-blur treatments for floating elements over imagery, not standard card surfaces.
- **Do** write testimonials, service descriptions, and team bios in specific, concrete language — PRODUCT.md's "show, don't tell" principle applies to copy as much as to visuals.

### Don't:
- **Don't** use gradient-clipped text (`bg-clip-text` + gradient) on headings. `SectionHeading` now renders solid `text-foreground` H2s — keep it that way; don't reintroduce the gradient-clip pattern.
- **Don't** add an eyebrow-pill kicker to every section. `SectionHeading`'s `eyebrow` prop is now optional and used deliberately on exactly one section (Services) — don't default it back on when adding new sections.
- **Don't** default to stock "gavel and scales of justice" imagery, navy-and-gold "trust us" templates, or wall-of-text about pages (per PRODUCT.md anti-references).
- **Don't** add a tiny uppercase eyebrow kicker above every section — `SectionHeading`'s eyebrow pill is already a deliberate, singular pattern; repeating it as generic scaffolding on new sections is the AI-template tell.
- **Don't** mix the two radius systems on one element — form controls get control radii (3/6/9px), cards and sections get surface radii (16/24px). A 12px "in-between" radius on a card reads as a mistake, not a choice.
- **Don't** let the tone tip formal or bureaucratic. Copy stays plain and direct even when covering serious subject matter (disputes, compliance, contracts).
