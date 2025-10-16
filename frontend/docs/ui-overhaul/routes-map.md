# Routes Map

Public routes:
- / → HomePageNew (src/pages/HomePageNew.jsx)
- /jobs → JobsPage (src/pages/JobsPage.jsx)
- /companies → CompaniesPage (src/pages/CompaniesPage.jsx)
- /salary-insights → SalaryInsightsPage (src/pages/SalaryInsightsPage.jsx)
- /skills-assessment → SkillsAssessmentPage (src/pages/SkillsAssessmentPage.jsx)
- /resume → ResumeBuilderPage (src/pages/ResumeBuilderPage.jsx)
- /job-alerts → JobAlertsPage (src/pages/JobAlertsPage.jsx)
- /add-job → AddJobPage (src/pages/AddJobPage.jsx)
- /post-job → AddJobPage (alias)
- /login → LoginPage (src/pages/LoginPage.jsx)
- /otp-login → OTPLoginPage (src/pages/OTPLoginPage.jsx)
- /register → RegisterPage (src/pages/RegisterPage.jsx)
- /signup → SignupPage (src/pages/SignupPage.jsx)
- /otp-signup → OTPSignupPage (src/pages/OTPSignupPage.jsx)
- /forgot-password → ForgotPasswordForm (component)
- /reset-password → ResetPasswordForm (component)

OAuth routes:
- /oauth/callback → OAuthCallback
- /auth/oauth-callback → OAuthCallback
- /oauth/link-callback → OAuthLinkCallback
- /oauth/error → OAuthError
- /auth/oauth-error → OAuthError

Admin/Employer/Applicant:
- /admin-login → AdminLoginPage
- /dashboard → Role-based redirect to Applicant/Recruiter/Admin dashboards
- /applicant-dashboard [/ :tab] → ApplicantDashboard
- /recruiter-dashboard [/ :tab / :subtab] → RecruiterDashboard
- /admin-dashboard [/ :tab] → AdminDashboard

404:
- /* → Inline 404 content

Unrouted pages present (consider adding routes as needed):
- AboutPage.jsx, ContactPage.jsx, PricingPage.jsx, CompanyDetailPage.jsx, CompanyProfilePage.jsx,
  ApplicantProfilePage.jsx, RecruiterProfilePage.jsx, ApplicationsPage.jsx, JobDetailPage.jsx,
  JobPrepPage.jsx, InterviewPreparationPage.jsx, InterviewQuestionsPage.jsx, CareerResourcesPage.jsx,
  CareerGuidancePage.jsx, CareerAssessmentPage.jsx, ResumePage.jsx, HRLoginPage.jsx, NotFoundPage.jsx, etc.
