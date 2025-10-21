# Site Map

Main site pages:
- Home: src/pages/HomePage.jsx, src/pages/HomePageNew.jsx
- Search/Jobs: src/pages/JobsPage.jsx, src/pages/JobsPageSimple.jsx, src/pages/JobDetailPage.jsx
- Categories/Companies: src/pages/CompaniesPage.jsx, src/pages/CompanyDetailPage.jsx
- About/Contact: src/pages/AboutPage.jsx, src/pages/ContactPage.jsx, src/pages/FAQ (N/A)
- Blog: (N/A in repo)
- Pricing: src/pages/PricingPage.jsx
- Resume/Job Prep: src/pages/ResumeBuilderPage.jsx, src/pages/ResumePage.jsx, src/pages/JobPrepPage.jsx, src/pages/InterviewPreparationPage.jsx, src/pages/InterviewQuestionsPage.jsx, src/pages/CareerResourcesPage.jsx, src/pages/CareerGuidancePage.jsx, src/pages/CareerAssessmentPage.jsx
- Salary Insights: src/pages/SalaryInsightsPage.jsx, src/pages/SalaryCalculatorPage.jsx
- Legal: src/pages/PrivacyPolicyPage.jsx, src/pages/TermsOfServicePage.jsx

Auth pages:
- Login / Signup / OTP / Reset: src/pages/LoginPage.jsx, SignupPage.jsx, OTPLoginPage.jsx, OTPSignupPage.jsx, ForgotPasswordPage.jsx, ResetPasswordPage.jsx, OAuthCallback.jsx, OAuthError.jsx, OAuthLinkCallback.jsx, AdminLogin.jsx, AdminLoginPage.jsx, HRLoginPage.jsx

Employer/Applicant dashboards:
- Applicant: src/pages/ApplicantDashboard.jsx, ApplicantDashboardNew.jsx
- Recruiter: src/pages/RecruiterDashboard.jsx
- Admin: src/pages/AdminDashboard.jsx
- Profile: src/pages/ProfilePage.jsx, ApplicantProfilePage.jsx, RecruiterProfilePage.jsx, CompanyProfilePage.jsx
- Applications: src/pages/ApplicationsPage.jsx, JobAlertsPage.jsx

Shared components inventory (selected):
- Navigation/Header: src/components/Navigation.jsx, layout/Header.jsx, layout/Sidebar.jsx, layout/DashboardHeader.jsx
- Hero/Sections: src/pages/HomePage.jsx, HomePageNew.jsx
- Cards: src/components/ui/Card.jsx, ModernCard.jsx, JobCard.jsx, components/cards/DashboardCard.jsx
- Buttons/Inputs/Forms: src/components/ui/Button.jsx, common/Form.jsx, common/FileUpload.jsx
- Tables: common/Table.jsx, DashboardTable.jsx
- Tabs: dashboard/DashboardTabs.jsx and variations
- Modals/Drawers: src/components/modals/*
- Toasts/Notifications: src/components/ui/toaster.jsx, notifications/*
- Footer: (within layout or pages)

Accessibility targets:
- Visible focus rings, ARIA on interactive components, keyboard navigation across menus, dialogs, tabs.

Breakpoints target:
- 360, 480, 640, 768, 1024, 1280, 1536.
