# Page audit checklist (by route)

For each route, verify:
- Layout grid matches reference
- Spacing scale (multiples of --space-*)
- Typography styles (fluid sizes, weights)
- Components present and states (hover/focus/active/disabled/loading/empty/error)
- A11y: headings order, focus order, roles/labels, keyboard navigation

Routes:

- / (Home)
  - [ ] Hero (CTA + optional QR/download), trust badges, counters, sections reveal
  - [ ] Nav: sticky, hover states, focus rings
  - [ ] Footer content and links

- /jobs
  - [ ] Search bar + filters (chips/pills), sort dropdown
  - [ ] Job cards grid/list responsive; hover/press; skeleton loading
  - [ ] Empty/no-results state; pagination

- /companies
  - [ ] Company list/cards; filters

- /salary-insights
  - [ ] Inputs + results layout; charts ARIA

- /skills-assessment
  - [ ] Tabs/steps; forms validation and errors

- /resume
  - [ ] Form sections; file upload; preview; toasts

- /job-alerts
  - [ ] Preferences form; save/cancel states

- /add-job (/post-job)
  - [ ] Multi-step form; validation; success/error

- /login /register /otp-login /otp-signup /forgot-password /reset-password
  - [ ] Auth layout; keyboard traps; input focus order; error messages

- /dashboard (role redirect) and specific dashboards
  - [ ] Stats cards; charts; tables responsive to cards on mobile
  - [ ] Tabs navigation via keyboard; ARIA attributes

- 404
  - [ ] Informative message; link back home
