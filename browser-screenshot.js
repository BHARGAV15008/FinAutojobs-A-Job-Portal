import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function takeScreenshots() {
  let browser;
  
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Keep visible so you can see what's happening
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const baseUrl = 'http://localhost:3000';
    const screenshotDir = './screenshots';

    // Helper function to take screenshot
    async function screenshot(filename, folder = '') {
      const fullPath = path.join(screenshotDir, folder, `${filename}.png`);
      await page.screenshot({ 
        path: fullPath, 
        fullPage: true,
        type: 'png'
      });
      console.log(`📸 Screenshot saved: ${fullPath}`);
    }

    // Helper function to navigate and screenshot
    async function navigateAndScreenshot(url, filename, folder, delay = 3000) {
      try {
        console.log(`📄 Navigating to: ${url}`);
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, delay));
        
        await screenshot(filename, folder);
        return true;
      } catch (error) {
        console.log(`❌ Error with ${url}: ${error.message}`);
        try {
          await screenshot(`${filename}_error`, folder);
        } catch (e) {
          console.log(`❌ Could not take error screenshot: ${e.message}`);
        }
        return false;
      }
    }

    console.log('\n📋 Taking screenshots of public pages...');

    // Public pages
    await navigateAndScreenshot(`${baseUrl}`, '01_homepage', 'public-pages');
    await navigateAndScreenshot(`${baseUrl}/login`, '02_login_page', 'public-pages');
    await navigateAndScreenshot(`${baseUrl}/register`, '03_register_page', 'public-pages');
    await navigateAndScreenshot(`${baseUrl}/jobs`, '04_jobs_page', 'public-pages');
    await navigateAndScreenshot(`${baseUrl}/about`, '05_about_page', 'public-pages');

    console.log('\n🔐 Attempting login...');

    // Try to login
    try {
      await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Look for email input with multiple selectors
      const emailInput = await page.$('input[type="email"]') || 
                        await page.$('input[name="email"]') ||
                        await page.$('#email');

      const passwordInput = await page.$('input[type="password"]') || 
                           await page.$('input[name="password"]') ||
                           await page.$('#password');

      if (emailInput && passwordInput) {
        console.log('✅ Found login form, filling credentials...');
        
        await page.type('input[type="email"]', 'bhargavjani008@gmail.com');
        await page.type('input[type="password"]', 'password123');
        
        // Take screenshot of filled login form
        await screenshot('02_login_page_filled', 'public-pages');
        
        // Try to submit
        const submitButton = await page.$('button[type="submit"]') ||
                            await page.$('button:contains("Login")') ||
                            await page.$('.login-btn');
        
        if (submitButton) {
          await submitButton.click();
          console.log('🔄 Login submitted, waiting for response...');
          
          // Wait for navigation or response
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Take screenshot of whatever page we're on now
          await screenshot('01_after_login', 'dashboard');
          
          // Try to navigate to common dashboard routes
          const dashboardRoutes = [
            '/dashboard',
            '/applicant-dashboard', 
            '/recruiter-dashboard',
            '/profile'
          ];
          
          for (const route of dashboardRoutes) {
            await navigateAndScreenshot(`${baseUrl}${route}`, `dashboard${route.replace('/', '_')}`, 'dashboard');
          }
          
        } else {
          console.log('❌ Could not find submit button');
        }
      } else {
        console.log('❌ Could not find login form inputs');
      }
    } catch (loginError) {
      console.log(`❌ Login error: ${loginError.message}`);
    }

    console.log('\n📱 Taking responsive screenshots...');

    // Mobile screenshots
    await page.setViewport({ width: 375, height: 667 });
    await navigateAndScreenshot(`${baseUrl}`, '01_homepage_mobile', 'responsive');
    await navigateAndScreenshot(`${baseUrl}/login`, '02_login_mobile', 'responsive');

    // Tablet screenshots  
    await page.setViewport({ width: 768, height: 1024 });
    await navigateAndScreenshot(`${baseUrl}`, '01_homepage_tablet', 'responsive');
    await navigateAndScreenshot(`${baseUrl}/login`, '02_login_tablet', 'responsive');

    console.log('\n✅ Screenshot session completed!');
    console.log('📁 Check the screenshots folder for all captured images');
    console.log('📖 See MANUAL_SCREENSHOT_INSTRUCTIONS.md for detailed manual steps');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    if (browser) {
      console.log('🔄 Closing browser...');
      await browser.close();
    }
  }
}

// Create screenshot directories
const folders = ['public-pages', 'dashboard', 'responsive', 'applicant-dashboard', 'recruiter-dashboard', 'admin-dashboard', 'modals-popups'];
for (const folder of folders) {
  const folderPath = path.join('./screenshots', folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

// Run the screenshot function
takeScreenshots().catch(console.error);
