# Mobile & browser notes

## What we optimized

- **Viewport** — `width=device-width`, `initialScale=1`, theme color for browser chrome.
- **Horizontal scroll** — `overflow-x-hidden` on `html` / `body`, charts use `min-w-0` so Recharts doesn’t widen the page.
- **Touch** — `touch-manipulation` / `touch-action` on key controls to reduce 300ms tap delay on older mobile browsers.
- **Tap targets** — Nav hamburger, dashboard drawer, footer links, evaluation 1–5 buttons, and merch sub-nav use at least ~44×44px where it matters (WCAG-friendly).
- **Dashboard on small screens** — Desktop sidebar is `lg+` only; **mobile drawer** (hamburger) opens the same links + logout, with body scroll locked while open. Drawer sits above the site nav when open (`z-index`).
- **Safe areas** — Footer and dashboard mobile bar use `safe-area-inset` padding where supported (notched phones).
- **Font** — Inter with `display: swap`; `text-size-adjust` to reduce iOS auto-zoom on orientation change.

## Browsers

The stack (Next.js, React, Tailwind, Supabase) targets **current** Chrome, Safari, Firefox, and Edge. Test on a real iPhone and Android device before client demos.
