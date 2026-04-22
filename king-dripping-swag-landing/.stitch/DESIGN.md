# Design System: Kings Driven

**Project:** Kings Driven — Elite AI Development & Performance Marketing Agency  
**Target:** Dubai / UAE ultra-high-net-worth individuals, family offices, state funds

## 1. Visual Theme & Atmosphere

Sovereign. Dense. Unapologetic. The aesthetic communicates absolute authority — like walking into a private members club in the DIFC at midnight. Deep obsidian backgrounds create a near-infinite depth, with amber-gold as the singular power accent. No gradients for decoration's sake. Every element earns its place. The overall mood is *billionaire-quiet luxury meets mission-critical intelligence*.

## 2. Color Palette & Roles

- **Sovereign Black** (#0a0a0a) — Primary page background. Near-void depth.
- **Obsidian Surface** (#121212) — Card and section surfaces.
- **Zinc Depth** (#18181b) — Elevated containers, nav backgrounds.
- **Zinc Mid** (#27272a) — Borders, dividers, subtle separators.
- **Emperor's Gold** (#f59e0b / amber-500) — Primary accent. CTAs, hover states, active highlights. Used sparingly — every touch of gold signals importance.
- **Pale Gold** (#fef3c7 / amber-100) — Headlines when gradient treatment is needed.
- **White Dominance** (#ffffff) — Primary headings. Full white, no softening.
- **Zinc Secondary** (#a1a1aa / zinc-400) — Body copy, descriptive text. Never competing with headings.
- **Ghost Zinc** (#3f3f46 / zinc-700) — Strikethrough text, de-emphasized elements.

## 3. Typography Rules

Font family: System sans-serif stack, but treated with extreme weight contrast.
- **Hero headlines:** 6xl–8xl, `font-bold`, `tracking-tight`, leading-[0.9]. White (#ffffff) or amber (#f59e0b) for emphasis words.
- **Section headers:** 3xl–5xl, `font-bold`, `tracking-tight`. White.
- **Body copy:** lg–xl, `text-zinc-400`, `leading-relaxed`. Never competing with headlines.
- **Labels / tags:** xs–sm, `uppercase`, `tracking-widest`, `font-bold`. Used in amber or zinc-400.
- **Navigation:** sm, `font-medium`, `text-zinc-400`, hover to amber-400.

## 4. Component Stylings

- **Primary CTA Buttons:** Rounded-xl (12px), amber-500 background, black text, `font-black`, `text-lg`. Hover: scale-105. No borders.
- **Secondary Buttons:** Rounded-xl, zinc-900 background, white text, `font-bold`, `border border-white/10`. Hover: zinc-800.
- **Navigation CTA:** Rounded-full pill shape, white background, black text, `font-bold`. Hover: amber-400.
- **Cards/Containers:** Rounded-3xl (24px), zinc-900/50 background, `border border-white/5`. Hover: `border-amber-500/30`. No hard shadows — subtle border brightening on hover.
- **Tags/Badges:** Rounded-full, `border border-amber-500/20`, `bg-amber-500/5`, amber-400 text, xs font, uppercase tracking-widest.
- **Footer elements:** Grayscale, opacity-50. Everything de-emphasized.

## 5. Layout Principles

- **Whitespace is dominance.** Sections use py-32 to py-40 vertical padding. Never crowded.
- **Max width:** max-w-7xl, centered with mx-auto px-6.
- **Grid:** 2-column grid for service cards. Single column for hero/CTA.
- **Fixed nav:** Always visible, bg-black/50 backdrop-blur-md, border-b border-white/10, h-20.
- **Hero:** Centered, pt-40 pb-32. Radial amber glow behind headline (blur-[120px], opacity 10%). Text hierarchy: badge → h1 → p → CTAs.
- **Section rhythm:** Vision → Services → CTA → Footer. Clean and linear.

## 6. Design System Notes for Stitch Generation (REQUIRED in all prompts)

```
DESIGN SYSTEM (REQUIRED):
- Platform: Web, Desktop-first
- Theme: Dark, sovereign luxury, billionaire-quiet
- Background: Sovereign Black (#0a0a0a) for page, Obsidian Surface (#121212) for cards
- Primary Accent: Emperor's Gold (#f59e0b) for CTAs and key highlights
- Text Primary: Pure White (#ffffff) for headlines
- Text Secondary: Zinc-400 (#a1a1aa) for body copy
- Borders: White/5 opacity on cards, brightening to amber-500/30 on hover
- Buttons: Rounded-xl (12px), amber-500 primary / zinc-900 secondary
- Cards: Rounded-3xl (24px), dark surface, barely-there borders
- Typography: Extreme weight contrast — bold heavy headlines, lighter body
- Spacing: Generous — py-32 to py-40 between sections
- Mood: Exclusive, authoritative, mission-critical
```
