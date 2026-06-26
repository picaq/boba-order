# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run start    # serve production build
```

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
```

Both must be set or the app shows a config warning instead of the call UI.

## Architecture

Next.js 16 App Router, JavaScript (no TypeScript), CSS Modules — no Tailwind.

```
src/
  app/
    layout.js        # root layout — loads Lora + Nunito via next/font/google
    globals.css      # CSS custom properties (colors, fonts) used across all modules
    page.js          # thin server component; just renders <BobaCall />
  components/
    BobaCall.js      # sole 'use client' component — owns all Vapi state
    BobaCall.module.css
    ChatBubble.js    # presentational; receives role/text/isPartial props
    ChatBubble.module.css
```

**Data flow:** `BobaCall` creates a `Vapi` instance in `useEffect`, wires events to React state, and passes accumulated `messages[]` + the live `partial` transcript to `ChatBubble`. Call states cycle: `idle → connecting → active → ending → idle`.

**Transcript handling:** Vapi emits `message` events with `type: 'transcript'` and `transcriptType: 'partial' | 'final'`. Partials update a separate `partial` state shown as a faded bubble; finals push to `messages[]` and clear `partial`.

**Styling:** All colors are CSS custom properties in `globals.css` (warm earthy palette — creams, ambers, browns). CSS Modules reference them with `var(--name)`. The call button switches CSS class by `callStatus` to change gradient/shadow. Sound bars animate with `--bar-delay` CSS custom property set via inline style.
