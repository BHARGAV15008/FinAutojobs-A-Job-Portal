# Parity checklist

Reference: apna.co, employer.apna.co, and Snapit motion feel

- Header/Navbar
  - [ ] Sticky, shadow on scroll, desktop mega menu, mobile drawer
  - [ ] Active/hover/focus states, focus-visible rings
- Hero sections
  - [ ] CTA + download/QR variant, trust badges, counters
- Search + Filters
  - [ ] Search bar, pill filters, chips, sort dropdown, range slider
- Job/Listing cards
  - [ ] Logo/avatar, title, meta, tags, save/apply actions, skeleton loaders
- Forms
  - [ ] Inputs, selects, file upload, OTP, stepper, validation + error messages
- Tables
  - [ ] Sortable headers, pagination, empty states, mobile cards
- Detail pages
  - [ ] Sticky sidebar CTA, accordion FAQs, similar items carousel
- Dashboard (employer-like)
  - [ ] Stats cards, charts (ARIA), activity list, settings pages
- Modals/Drawers/Toasts
  - [ ] Accessible focus trap, ESC to close, restore focus
- Footer
  - [ ] Multi-column links, language switcher, social, legal

Animations/Transitions (Snapit feel)
- [ ] Durations 150–250ms UI, 300–500ms entrances, stagger 60–120ms
- [ ] Easings cubic-bezier(0.2,0.8,0.2,1), ease-out/in for enter/exit
- [ ] Scroll reveal fade+translate-y, hover scale/shadow, press scale
- [ ] prefers-reduced-motion respected

Responsive
- [ ] No horizontal scroll 320px–4K
- [ ] Nav collapses at <=768px
- [ ] Tables become stacked cards on mobile
- [ ] Images responsive with sizes/srcset

A11y
- [ ] WCAG AA contrast
- [ ] Skip links, logical headings
- [ ] Keyboard support in menus/tabs/dialogs
- [ ] ARIA attributes on interactive components

Performance/SEO
- [ ] Lighthouse mobile >= 90 (LCP<2.5s, CLS<0.1, TBT<200ms)
- [ ] Code splitting, lazy images, font preloads swap
- [ ] Inline critical CSS for above-the-fold
- [ ] SEO tags per page

Notes
- Use original copy/assets; match style/behavior, not proprietary content.
- Document deviations with rationale.
