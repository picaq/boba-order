---
name: project-mandy-aesthetic
description: Mandy Chen's personal site aesthetic used for boba-order styling — palette, fonts, SVG motifs
metadata:
  type: project
---

Mandy's design system (from mandychen.art/ccsf/cnit132a/) applied to the boba app.

**Palette:**
- `--dark: #5B4E3E` (deep warm brown — text shadow, dark text)
- `--midtone: #897052` (amber brown — headings, secondary text)
- `--light: #fdfcf6` (warm cream — card/body background)
- `--txt-clr: #999590` (warm gray — muted text, border)
- `--accent: #B5C7DD` (dusty steel blue — page background, user chat bubbles)
- `--accent-deep: #9bb9de` (medium blue — links, focus rings)
- `--accent-light: #c3d9f5` (pale blue)

**Fonts:** Kurale (display/headings/UI labels, weight 400 only) + Laila (body/bubbles/descriptions, weights 400/500/600)

**Signature motifs:**
- Dusty blue page background + cream heart repeat SVG pattern (`/heart-repeat.svg` at 110px tiled, fixed)
- Cards/panels: cream background, `2px dashed #999590` border, soft box-shadow
- Lace heart SVG (path: `M9.4,0C8.4,0,7,1.2,6.2,2.2...` fill `#897052`) used in card decoRow
- Text-shadow on headings: `0.025em 0.025em 0.025em var(--dark)`
- Dashed borders on inputs and buttons (outline style)
- Header title is cream on blue background

**Call button color mapping:**
- Idle: warm brown gradient `#7a5c3a → #a07850`
- Connecting: amber `#c98a3e → #d4a853`
- Active: dusty blue `#6a9fbf → #9bb9de` (Mandy's accent color)
- Ending: muted brown `#897052 → #a09070`

**Why:** User requested aesthetic derived from her personal portfolio site to make boba app feel cohesive with her design identity.
**How to apply:** Any future UI changes should stay within this palette and use dashed borders + Kurale/Laila fonts.
