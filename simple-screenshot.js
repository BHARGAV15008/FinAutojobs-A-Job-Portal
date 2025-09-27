import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class SimpleScreenshotTool {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.screenshotDir = './screenshots';
  }

  async init() {
    console.log('🚀 Starting browser...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async takeScreenshot(filename, folder = '') {
    const fullPath = path.join(this.screenshotDir, folder, `${filename}.png`);
    await this.page.screenshot({ path: fullPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${fullPath}`);
  }

  async captureWithDelay(url, filename, folder, delay = 3000) {
    try {
      console.log(`📄 Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      await this.page.waitForTimeout(delay);
      await this.takeScreenshot(filename, folder);
      return true;
    } catch (error) {
      console.log(`❌ Error capturing ${filename}: ${error.message}`);
      return false;
    }
  }

  async login(email, password) {
    try {
      console.log('🔐 Attempting login...');
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(2000);
      
      // Try different possible selectors for email input
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        '#email',
        'input[placeholder*="email" i]'
      ];
      
      let emailInput = null;
      for (const selector of emailSelectors) {
        try {
          emailInput = await this.page.$(selector);
          if (emailInput) break;
        } catch (e) {}
      }
      
      if (emailInput) {
        await this.page.type(emailSelectors[0], email);
        await this.page.type('input[type="password"]', password);
        
        // Try to find and click login button
        const loginSelectors = [
          'button[type="submit"]',
          'button:contains("Login")',
          'button:contains("Sign In")',
          '.login-button'
        ];
        
        for (const selector of loginSelectors) {
          try {
            await this.page.click(selector);
            break;
          } catch (e) {}
        }
        
        await this.page.waitForTimeout(3000);
        return true;
      }
      return false;
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
      return false;
    }
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n📋 Capturing Public Pages...');
      
      // Public pages
      await this.captureWithDelay(`${this.baseUrl}`, '01_homepage', 'public-pages');
      await this.captureWithDelay(`${this.baseUrl}/login`, '02_login_page', 'public-pages');
      await this.captureWithDelay(`${this.baseUrl}/register`, '03_register_page', 'public-pages');
      await this.captureWithDelay(`${this.baseUrl}/jobs`, '04_jobs_page', 'public-pages');
      
      // Try other common routes
      await this.captureWithDelay(`${this.baseUrl}/about`, '05_about_page', 'public-pages');
      await this.captureWithDelay(`${this.baseUrl}/contact`, '06_contact_page', 'public-pages');
      
      console.log('\n🔐 Attempting to login and capture dashboards...');
      
      // Try to login and capture dashboard
      const loginSuccess = await this.login('bhargavjani008@gmail.com', 'password123');
      
      if (loginSuccess) {
        console.log('✅ Login successful, capturing dashboard...');
        
        // Wait a bit more for dashboard to load
        await this.page.waitForTimeout(5000);
        
        // Capture current page (should be dashboard)
        await this.takeScreenshot('01_dashboard_after_login', 'dashboard');
        
        // Try common dashboard routes
        const dashboardRoutes = [
          '/dashboard',
          '/applicant-dashboard',
          '/recruiter-dashboard',
          '/profile',
          '/jobs',
          '/applications'
        ];
        
        for (const route of dashboardRoutes) {
          await this.captureWithDelay(`${this.baseUrl}${route}`, `dashboard_${route.replace('/', '')}`, 'dashboard');
        }
        
      } else {
        console.log('❌ Login failed, skipping dashboard screenshots');
      }
      
      console.log('\n📱 Capturing responsive views...');
      
      // Mobile view
      await this.page.setViewport({ width: 375, height: 667 });
      await this.captureWithDelay(`${this.baseUrl}`, '01_homepage_mobile', 'responsive');
      await this.captureWithDelay(`${this.baseUrl}/login`, '02_login_mobile', 'responsive');
      
      // Tablet view
      await this.page.setViewport({ width: 768, height: 1024 });
      await this.captureWithDelay(`${this.baseUrl}`, '01_homepage_tablet', 'responsive');
      await this.captureWithDelay(`${this.baseUrl}/login`, '02_login_tablet', 'responsive');
      
      console.log('\n✅ Screenshot capture completed!');
      console.log(`📁 Screenshots saved in: ${this.screenshotDir}`);
      
    } catch (error) {
      console.error('❌ Error during screenshot capture:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Create directories
const screenshotDir = './screenshots';
const folders = ['public-pages', 'dashboard', 'responsive', 'modals'];

for (const folder of folders) {
  const folderPath = path.join(screenshotDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Run the tool
const tool = new SimpleScreenshotTool();
tool.run().catch(console.error);
