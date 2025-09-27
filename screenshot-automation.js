import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class ScreenshotAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.screenshotDir = './screenshots';
    this.delay = 2000; // 2 seconds delay for page loads
  }

  async init() {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async takeScreenshot(filename, folder = '') {
    const fullPath = path.join(this.screenshotDir, folder, `${filename}.png`);
    await this.page.screenshot({ path: fullPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${fullPath}`);
  }

  async waitAndScreenshot(selector, filename, folder = '', timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      await this.page.waitForTimeout(this.delay);
      await this.takeScreenshot(filename, folder);
    } catch (error) {
      console.log(`⚠️  Could not find selector ${selector} for ${filename}`);
      await this.takeScreenshot(`${filename}_error`, folder);
    }
  }

  async clickAndScreenshot(selector, filename, folder = '') {
    try {
      await this.page.click(selector);
      await this.page.waitForTimeout(this.delay);
      await this.takeScreenshot(filename, folder);
    } catch (error) {
      console.log(`⚠️  Could not click ${selector} for ${filename}`);
    }
  }

  async capturePublicPages() {
    console.log('\n📋 Capturing Public Pages...');
    
    // Home Page
    await this.page.goto(this.baseUrl);
    await this.waitAndScreenshot('body', '01_homepage', 'public-pages');

    // Login Page
    await this.page.goto(`${this.baseUrl}/login`);
    await this.waitAndScreenshot('form', '02_login_page', 'public-pages');

    // Registration Page
    await this.page.goto(`${this.baseUrl}/register`);
    await this.waitAndScreenshot('form', '03_register_page', 'public-pages');

    // Jobs Page (public view)
    await this.page.goto(`${this.baseUrl}/jobs`);
    await this.waitAndScreenshot('body', '04_jobs_public', 'public-pages');

    // About Page (if exists)
    try {
      await this.page.goto(`${this.baseUrl}/about`);
      await this.waitAndScreenshot('body', '05_about_page', 'public-pages');
    } catch (error) {
      console.log('ℹ️  About page not found, skipping...');
    }
  }

  async login(email, password, role = 'applicant') {
    console.log(`\n🔐 Logging in as ${role}...`);
    await this.page.goto(`${this.baseUrl}/login`);
    
    // Fill login form
    await this.page.waitForSelector('input[type="email"]');
    await this.page.type('input[type="email"]', email);
    await this.page.type('input[type="password"]', password);
    
    // Click login button
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(3000);

    // Handle role selection if multiple roles exist
    try {
      const roleSelector = await this.page.$(`button:contains("${role}")`);
      if (roleSelector) {
        await roleSelector.click();
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('ℹ️  No role selection needed');
    }
  }

  async captureApplicantDashboard() {
    console.log('\n👤 Capturing Applicant Dashboard...');
    
    // Login as applicant
    await this.login('bhargavjani008@gmail.com', 'password123', 'applicant');
    
    // Dashboard Overview
    await this.waitAndScreenshot('body', '01_dashboard_overview', 'applicant-dashboard');

    // Profile Tab
    await this.clickAndScreenshot('[data-tab="profile"]', '02_profile_tab', 'applicant-dashboard');

    // Jobs Tab
    await this.clickAndScreenshot('[data-tab="jobs"]', '03_jobs_tab', 'applicant-dashboard');

    // Applications Tab
    await this.clickAndScreenshot('[data-tab="applications"]', '04_applications_tab', 'applicant-dashboard');

    // Messages Tab
    await this.clickAndScreenshot('[data-tab="messages"]', '05_messages_tab', 'applicant-dashboard');

    // Settings Tab
    await this.clickAndScreenshot('[data-tab="settings"]', '06_settings_tab', 'applicant-dashboard');

    // Profile Edit Modal
    try {
      await this.page.click('button:contains("Edit Profile")');
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('07_profile_edit_modal', 'applicant-dashboard');
      await this.page.click('button:contains("Cancel")');
    } catch (error) {
      console.log('⚠️  Profile edit modal not found');
    }

    // Job Details Modal
    try {
      await this.page.click('.job-card:first-child button:contains("View Details")');
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('08_job_details_modal', 'applicant-dashboard');
      await this.page.click('button:contains("Close")');
    } catch (error) {
      console.log('⚠️  Job details modal not found');
    }
  }

  async captureRecruiterDashboard() {
    console.log('\n🏢 Capturing Recruiter Dashboard...');
    
    // Login as recruiter
    await this.login('bhargavjani008@gmail.com', 'password123', 'recruiter');
    
    // Dashboard Overview
    await this.waitAndScreenshot('body', '01_dashboard_overview', 'recruiter-dashboard');

    // Profile Tab
    await this.clickAndScreenshot('[data-tab="profile"]', '02_profile_tab', 'recruiter-dashboard');

    // Job Posting Tab
    await this.clickAndScreenshot('[data-tab="post-job"]', '03_job_posting_tab', 'recruiter-dashboard');

    // My Jobs Tab
    await this.clickAndScreenshot('[data-tab="my-jobs"]', '04_my_jobs_tab', 'recruiter-dashboard');

    // Applications Tab
    await this.clickAndScreenshot('[data-tab="applications"]', '05_applications_tab', 'recruiter-dashboard');

    // Analytics Tab
    await this.clickAndScreenshot('[data-tab="analytics"]', '06_analytics_tab', 'recruiter-dashboard');

    // Messages Tab
    await this.clickAndScreenshot('[data-tab="messages"]', '07_messages_tab', 'recruiter-dashboard');

    // Settings Tab
    await this.clickAndScreenshot('[data-tab="settings"]', '08_settings_tab', 'recruiter-dashboard');

    // Job Posting Form (filled)
    try {
      await this.page.click('[data-tab="post-job"]');
      await this.page.waitForTimeout(1000);
      
      // Fill some form fields for better screenshot
      await this.page.type('input[name="jobTitle"]', 'Senior Software Engineer');
      await this.page.type('textarea[name="jobDescription"]', 'We are looking for an experienced software engineer...');
      await this.takeScreenshot('09_job_posting_form_filled', 'recruiter-dashboard');
    } catch (error) {
      console.log('⚠️  Job posting form not found');
    }

    // Profile Edit Modal
    try {
      await this.page.click('button:contains("Edit Profile")');
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('10_profile_edit_modal', 'recruiter-dashboard');
      await this.page.click('button:contains("Cancel")');
    } catch (error) {
      console.log('⚠️  Profile edit modal not found');
    }
  }

  async captureAdminDashboard() {
    console.log('\n👨‍💼 Capturing Admin Dashboard...');
    
    // Try to login as admin (if admin account exists)
    try {
      await this.login('admin@finauto.com', 'admin123', 'admin');
      
      // Dashboard Overview
      await this.waitAndScreenshot('body', '01_dashboard_overview', 'admin-dashboard');

      // User Management Tab
      await this.clickAndScreenshot('[data-tab="users"]', '02_user_management', 'admin-dashboard');

      // Job Management Tab
      await this.clickAndScreenshot('[data-tab="jobs"]', '03_job_management', 'admin-dashboard');

      // Analytics Tab
      await this.clickAndScreenshot('[data-tab="analytics"]', '04_analytics', 'admin-dashboard');

      // Settings Tab
      await this.clickAndScreenshot('[data-tab="settings"]', '05_settings', 'admin-dashboard');

      // Reports Tab
      await this.clickAndScreenshot('[data-tab="reports"]', '06_reports', 'admin-dashboard');

    } catch (error) {
      console.log('ℹ️  Admin dashboard not accessible or doesn\'t exist');
    }
  }

  async captureModalsAndPopups() {
    console.log('\n🪟 Capturing Modals and Popups...');
    
    // Go back to applicant dashboard for modal testing
    await this.login('bhargavjani008@gmail.com', 'password123', 'applicant');
    
    // Various modals and popups
    const modalsToCapture = [
      { selector: 'button:contains("Apply")', name: '01_job_application_modal' },
      { selector: 'button:contains("Edit Profile")', name: '02_profile_edit_modal' },
      { selector: 'button:contains("View Details")', name: '03_job_details_modal' },
      { selector: 'button:contains("Upload Resume")', name: '04_resume_upload_modal' },
      { selector: 'button:contains("Change Password")', name: '05_password_change_modal' },
      { selector: 'button:contains("Delete Account")', name: '06_delete_account_modal' },
      { selector: '.notification-bell', name: '07_notifications_dropdown' },
      { selector: '.user-menu', name: '08_user_menu_dropdown' }
    ];

    for (const modal of modalsToCapture) {
      try {
        await this.page.click(modal.selector);
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot(modal.name, 'modals-popups');
        
        // Try to close modal
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      } catch (error) {
        console.log(`⚠️  Modal ${modal.name} not found or not clickable`);
      }
    }
  }

  async captureResponsiveViews() {
    console.log('\n📱 Capturing Responsive Views...');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1200, height: 800, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewport(viewport);
      
      // Home page responsive
      await this.page.goto(this.baseUrl);
      await this.waitAndScreenshot(`01_homepage_${viewport.name}`, 'responsive');
      
      // Dashboard responsive (if logged in)
      try {
        await this.page.goto(`${this.baseUrl}/dashboard`);
        await this.waitAndScreenshot(`02_dashboard_${viewport.name}`, 'responsive');
      } catch (error) {
        console.log(`⚠️  Dashboard not accessible for ${viewport.name}`);
      }
    }

    // Reset to desktop viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async captureErrorPages() {
    console.log('\n❌ Capturing Error Pages...');
    
    // 404 Page
    await this.page.goto(`${this.baseUrl}/nonexistent-page`);
    await this.waitAndScreenshot('01_404_page', 'error-pages');

    // Login error (wrong credentials)
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.type('input[type="email"]', 'wrong@email.com');
    await this.page.type('input[type="password"]', 'wrongpassword');
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('02_login_error', 'error-pages');
  }

  async run() {
    try {
      await this.init();
      
      // Create additional directories
      await fs.promises.mkdir(path.join(this.screenshotDir, 'responsive'), { recursive: true });
      await fs.promises.mkdir(path.join(this.screenshotDir, 'error-pages'), { recursive: true });
      
      // Capture all sections
      await this.capturePublicPages();
      await this.captureApplicantDashboard();
      await this.captureRecruiterDashboard();
      await this.captureAdminDashboard();
      await this.captureModalsAndPopups();
      await this.captureResponsiveViews();
      await this.captureErrorPages();
      
      console.log('\n✅ Screenshot automation completed successfully!');
      console.log(`📁 All screenshots saved in: ${this.screenshotDir}`);
      
    } catch (error) {
      console.error('❌ Error during screenshot automation:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the automation
const automation = new ScreenshotAutomation();
automation.run().catch(console.error);
