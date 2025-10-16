# UI Overhaul README

Run locally:
- npm run setup (root) then: cd frontend && npm run dev
- Build: cd frontend && npm run build; Preview: npm run preview

Design tokens:
- Tokens defined in src/styles/variables.css. Toggle dark mode by setting [data-theme="dark"] on <html> or <body>.
- Tailwind reads tokens via CSS variables; breakpoints include xs(360), xs2(480), sm(640), md(768), lg(1024), xl(1280), 2xl(1536).

Usage examples:
- Colors: text-[color:var(--color-fg)] bg-[color:var(--color-surface)] or Tailwind classes (text-foreground bg-background, text-primary)
- Radii: rounded-[var(--radius-md)] or Tailwind rounded-md/lg
- Shadows: use classes hover-elevate, press; box-shadow tokens via shadow-[var(--shadow-md)] when needed
- Typography: text-base uses fluid clamp sizes; utilities in src/index.css

Motion:
- Scroll reveal with initScrollReveal from src/utils/scrollReveal.js and [data-reveal] attributes
- prefers-reduced-motion respected automatically

Docs:
- Site map: docs/ui-overhaul/site-map.md
- Parity checklist: docs/ui-overhaul/parity-checklist.md
