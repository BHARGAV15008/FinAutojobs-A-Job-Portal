# Component Inventory and Interaction States

Core layout/navigation:
- Header/Navbar: src/components/Navigation.jsx, src/components/layout/Header.jsx, DashboardHeader variants
- Sidebar/Drawer: src/components/layout/Sidebar.jsx, DashboardSidebar.jsx
- Layout shells: ResponsiveLayout.jsx, DashboardLayout.jsx, ModernDashboardLayout.jsx

Hero/sections:
- HomePageNew sections; cards: src/components/ui/ModernCard.jsx, Card.jsx

Search & filters:
- SearchBar.jsx, chips/badges via MUI Chip and custom classes; filters in dashboard/DashboardFilters.jsx

Job/listing:
- JobCard.jsx (components/JobCard.jsx and dashboard/common/JobCard.jsx), tags, actions

Forms & inputs:
- components/common/Form.jsx, FileUpload.jsx, inputs/selects in MUI TextField/Select
- OTP flows: components/auth/OTPVerification.jsx, PhoneVerification.jsx, SubmitButton.jsx

Tables:
- components/common/Table.jsx, DashboardTable.jsx; DataGrid via @mui/x-data-grid in places

Tabs:
- dashboard/navigation/DashboardTabs.jsx and multiple tab implementations

Modals/Drawers:
- components/modals/* (AuthModal, JobDetailsModal, ScheduleModal, etc.)

Toasts/Notifications:
- components/ui/toaster.jsx, notifications/*

Footer:
- Inline in AppRoutes.jsx footer section

Interactive states to ensure:
- Hover: subtle elevate/shadow-md + color ramp per tokens
- Focus: :focus-visible using --focus-outline; keyboard ring offset via --ring/--ring-offset
- Active/Pressed: scale(0.98) for buttons/cards with 100ms
- Disabled: reduced opacity and pointer-events
- Loading: skeleton loaders (JobCard, cards), loading spinners
- Empty/Error: dashboard/EmptyState.jsx, ErrorBoundary patterns

Typography and spacing:
- Fluid type via CSS variables (var(--text-*)); line-heights --lh-*
- Spacing scale tokens: --space-2/4/6/8/10/12; Tailwind spacing utilities for layout

ARIA and keyboard support targets:
- Menus, tabs, dialogs use MUI/Radix primitives; verify role/aria-expanded, focus trap, ESC close, restore focus

Motion utilities:
- Scroll reveal: add [data-reveal] to sections; init via src/utils/scrollReveal.js
- Hover micro: class hover-elevate; press: class press
- prefers-reduced-motion respected
