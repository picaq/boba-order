---
name: project-boba-app
description: Tech stack and design decisions for the boba-order voice ordering app
metadata:
  type: project
---

Next.js 16 + CSS Modules (no Tailwind), JavaScript (no TypeScript). Warm earthy cozy palette (creams/ambers/browns). Vapi Web SDK (`@vapi-ai/web`) for voice calls.

**Why:** User chose Next.js + CSS Modules and warm earthy cozy aesthetic. Vapi agent already existed — app just wraps it in a UI.

**How to apply:** Keep CSS in CSS Modules files (no inline styles except for CSS custom properties like `--bar-delay`). Color tokens live in `globals.css` as CSS custom properties. No Tailwind — use `var(--token)` in modules.
