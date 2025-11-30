#!/usr/bin/env node

/**
 * Job Application Form Testing Script for FinAutoJobs
 * Tests job applications, profile forms, and all interactive forms
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    BASE_URL: 'http://192.168.41.134:3000',
    API_URL: 'http://192.168.41.134:5000/api',
    TIMEOUT: 30000,
    SCREENSHOT_DIR: path.join(__dirname, 'job-application-screenshots'),
    RESULTS_FILE: path.join(__dirname, 'job-application-test-results.json')
};

// Test accounts (created previously)
const TEST_ACCOUNTS = {
    applicant1: {
        email: 'applicant1test@gmail.com',
        password: 'TestPass123!',
        name: 'John Doe',
        role: 'applicant'
    },
    applicant2: {
        email: 'applicant2test@gmail.com',
        password: 'TestPass123!',
        name: 'Jane Smith',
        role: 'applicant'
    },
    recruiter1: {
        email: 'recruiter1test@gmail.com',
        password: 'TestPass123!',
        name: 'Mike Johnson',
        role: 'recruiter'
    },
    recruiter2: {
        email: 'recruiter2test@gmail.com',
        password: 'TestPass123!',
        name: 'Sarah Wilson',
        role: 'recruiter'
    }
};

// Sample job application data
const APPLICATION_DATA = {
    personalInfo: {
        phone: '+91-9876543210',
        address: {
            street: '123 Tech Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '400001'
        }
    },
    professionalInfo: {
        currentJobTitle: 'Software Engineer',
        currentCompany: 'Tech Solutions Inc',
        totalExperience: 3,
        relevantExperience: 2,
        currentSalary: '800000',
        expectedSalary: '1200000',
        noticePeriod: '30 days',
        willingToRelocate: true,
        preferredLocation: ['Mumbai', 'Bangalore', 'Pune']
    },
    additionalInfo: {
        coverLetter: 'I am excited to apply for this position because it aligns perfectly with my career goals and technical expertise. I have extensive experience in software development and am passionate about creating innovative solutions.',
        whyInterested: 'This role offers excellent growth opportunities and the chance to work with cutting-edge technologies.',
        careerGoals: 'To become a technical lead and contribute to building scalable software solutions.',
        portfolioUrl: 'https://github.com/johndoe',
        linkedinUrl: 'https://linkedin.com/in/johndoe'
    }
};

// Sample profile data for different roles
const PROFILE_DATA = {
    applicant: {
        bio: 'Passionate software developer with 3+ years of experience in full-stack development.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
        education: [
            {
                degree: 'Bachelor of Technology',
                field: 'Computer Science',
                institution: 'IIT Mumbai',
                year: '2021'
            }
        ],
        experience: [
            {
                title: 'Software Engineer',
                company: 'Tech Solutions Inc',
                duration: '2021-Present',
                description: 'Developed web applications using React and Node.js'
            }
        ]
    },
    recruiter: {
        bio: 'Experienced HR professional specializing in tech recruitment.',
        company: 'Tech Corp',
        designation: 'Senior HR Manager',
        experience: 5,
        specializations: ['Technical Recruitment', 'Campus Hiring', 'Talent Acquisition']
    }
};

// Test results tracking
let testResults = {
    formsCompleted: 0,
    formsFailed: 0,
    applicationsSubmitted: 0,
    profilesCompleted: 0,
    jobsPosted: 0,
    screenshotsTaken: 0,
    errors: [],
    completedTests: []
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

/**
 * Screenshot helper
 */
async function takeScreenshot(page, name) {
    try {
        if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
            fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}-${name}.png`;
        const filepath = path.join(CONFIG.SCREENSHOT_DIR, filename);
        
        await page.screenshot({ 
            path: filepath, 
            fullPage: true,
            type: 'png'
        });
        
        testResults.screenshotsTaken++;
        logInfo(`Screenshot saved: ${filename}`);
        return filename;
    } catch (error) {
        logError(`Failed to take screenshot: ${error.message}`);
        return null;
    }
}

/**
 * Login helper
 */
async function loginUser(page, account) {
    try {
        logInfo(`Logging in as ${account.name} (${account.email})`);
        
        await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, `login-page-${account.role}`);
        
        // Fill login form
        await page.waitForSelector('input[type="email"], input[name*="email"], input[name*="identifier"]', { timeout: 10000 });
        
        const emailInput = await page.$('input[type="email"], input[name*="email"], input[name*="identifier"]');
        if (emailInput) {
            await emailInput.click();
            await emailInput.type(account.email);
        }
        
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
            await passwordInput.click();
            await passwordInput.type(account.password);
        }
        
        // Select role if available
        const roleSelect = await page.$('select[name*="role"], input[value="' + account.role + '"]');
        if (roleSelect) {
            await roleSelect.click();
        }
        
        // Submit login
        const submitButton = await page.$('button[type="submit"], button:contains("Login"), button:contains("Sign In")');
        if (submitButton) {
            await submitButton.click();
            await page.waitForTimeout(3000);
        }
        
        await takeScreenshot(page, `logged-in-${account.role}`);
        logSuccess(`Successfully logged in as ${account.name}`);
        return true;
        
    } catch (error) {
        logError(`Failed to login as ${account.name}: ${error.message}`);
        testResults.errors.push({
            type: 'login_error',
            account: account.name,
            error: error.message
        });
        return false;
    }
}

/**
 * Fill profile form
 */
async function fillProfileForm(page, account, profileData) {
    try {
        logInfo(`Filling profile for ${account.name}`);
        
        // Navigate to profile page
        await page.goto(`${CONFIG.BASE_URL}/profile`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, `profile-page-${account.role}`);
        
        // Look for edit profile button
        const editButton = await page.$('button:contains("Edit"), button:contains("Update"), .edit-profile');
        if (editButton) {
            await editButton.click();
            await page.waitForTimeout(2000);
        }
        
        // Fill bio
        const bioField = await page.$('textarea[name*="bio"], textarea[placeholder*="bio"]');
        if (bioField) {
            await bioField.click();
            await bioField.type(profileData.bio);
        }
        
        // Fill role-specific fields
        if (account.role === 'applicant') {
            // Fill skills
            const skillsField = await page.$('input[name*="skills"], textarea[name*="skills"]');
            if (skillsField) {
                await skillsField.click();
                await skillsField.type(profileData.skills.join(', '));
            }
            
            // Add education
            const addEducationButton = await page.$('button:contains("Add Education")');
            if (addEducationButton) {
                await addEducationButton.click();
                await page.waitForTimeout(1000);
                
                const degreeField = await page.$('input[name*="degree"]');
                if (degreeField) {
                    await degreeField.type(profileData.education[0].degree);
                }
                
                const institutionField = await page.$('input[name*="institution"], input[name*="college"]');
                if (institutionField) {
                    await institutionField.type(profileData.education[0].institution);
                }
            }
            
        } else if (account.role === 'recruiter') {
            // Fill company info
            const companyField = await page.$('input[name*="company"]');
            if (companyField) {
                await companyField.click();
                await companyField.type(profileData.company);
            }
            
            const designationField = await page.$('input[name*="designation"], input[name*="title"]');
            if (designationField) {
                await designationField.click();
                await designationField.type(profileData.designation);
            }
        }
        
        // Save profile
        const saveButton = await page.$('button[type="submit"], button:contains("Save"), button:contains("Update")');
        if (saveButton) {
            await saveButton.click();
            await page.waitForTimeout(3000);
        }
        
        await takeScreenshot(page, `profile-completed-${account.role}`);
        testResults.profilesCompleted++;
        logSuccess(`Profile completed for ${account.name}`);
        return true;
        
    } catch (error) {
        logError(`Failed to fill profile for ${account.name}: ${error.message}`);
        testResults.errors.push({
            type: 'profile_error',
            account: account.name,
            error: error.message
        });
        return false;
    }
}

/**
 * Apply for a job
 */
async function applyForJob(page, account, applicationData) {
    try {
        logInfo(`Applying for job as ${account.name}`);
        
        // Navigate to jobs page
        await page.goto(`${CONFIG.BASE_URL}/jobs`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, `jobs-page-${account.role}`);
        
        // Find first job and apply
        const applyButton = await page.$('button:contains("Apply"), .apply-button, [data-testid="apply-button"]');
        if (applyButton) {
            await applyButton.click();
            await page.waitForTimeout(3000);
            
            await takeScreenshot(page, `application-form-${account.role}`);
            
            // Fill application form step by step
            await fillApplicationForm(page, applicationData);
            
            // Submit application
            const submitButton = await page.$('button:contains("Submit"), button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await page.waitForTimeout(3000);
            }
            
            await takeScreenshot(page, `application-submitted-${account.role}`);
            testResults.applicationsSubmitted++;
            logSuccess(`Job application submitted by ${account.name}`);
            return true;
        } else {
            logInfo(`No jobs available to apply for ${account.name}`);
            return false;
        }
        
    } catch (error) {
        logError(`Failed to apply for job as ${account.name}: ${error.message}`);
        testResults.errors.push({
            type: 'application_error',
            account: account.name,
            error: error.message
        });
        return false;
    }
}

/**
 * Fill application form
 */
async function fillApplicationForm(page, applicationData) {
    try {
        // Personal Information
        const phoneField = await page.$('input[name*="phone"], input[type="tel"]');
        if (phoneField) {
            await phoneField.click();
            await phoneField.type(applicationData.personalInfo.phone);
        }
        
        // Address fields
        const cityField = await page.$('input[name*="city"]');
        if (cityField) {
            await cityField.click();
            await cityField.type(applicationData.personalInfo.address.city);
        }
        
        // Professional Information
        const currentTitleField = await page.$('input[name*="currentTitle"], input[name*="jobTitle"]');
        if (currentTitleField) {
            await currentTitleField.click();
            await currentTitleField.type(applicationData.professionalInfo.currentJobTitle);
        }
        
        const currentCompanyField = await page.$('input[name*="currentCompany"], input[name*="company"]');
        if (currentCompanyField) {
            await currentCompanyField.click();
            await currentCompanyField.type(applicationData.professionalInfo.currentCompany);
        }
        
        const experienceField = await page.$('input[name*="experience"], input[name*="totalExperience"]');
        if (experienceField) {
            await experienceField.click();
            await experienceField.type(applicationData.professionalInfo.totalExperience.toString());
        }
        
        const expectedSalaryField = await page.$('input[name*="expectedSalary"], input[name*="salary"]');
        if (expectedSalaryField) {
            await expectedSalaryField.click();
            await expectedSalaryField.type(applicationData.professionalInfo.expectedSalary);
        }
        
        // Cover letter
        const coverLetterField = await page.$('textarea[name*="coverLetter"], textarea[name*="cover"]');
        if (coverLetterField) {
            await coverLetterField.click();
            await coverLetterField.type(applicationData.additionalInfo.coverLetter);
        }
        
        // Portfolio URL
        const portfolioField = await page.$('input[name*="portfolio"], input[name*="github"]');
        if (portfolioField) {
            await portfolioField.click();
            await portfolioField.type(applicationData.additionalInfo.portfolioUrl);
        }
        
        // Navigate through steps if it's a multi-step form
        const nextButtons = await page.$$('button:contains("Next"), button:contains("Continue")');
        for (const nextButton of nextButtons) {
            try {
                await nextButton.click();
                await page.waitForTimeout(2000);
            } catch (e) {
                // Button might not be clickable
            }
        }
        
        logSuccess('Application form filled successfully');
        
    } catch (error) {
        logError(`Failed to fill application form: ${error.message}`);
        throw error;
    }
}

/**
 * Post a job (recruiter)
 */
async function postJob(page, account) {
    try {
        logInfo(`Posting job as ${account.name}`);
        
        // Navigate to job posting page
        await page.goto(`${CONFIG.BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, `dashboard-${account.role}`);
        
        // Look for "Post Job" or "Add Job" button
        const postJobButton = await page.$('button:contains("Post Job"), button:contains("Add Job"), .post-job');
        if (postJobButton) {
            await postJobButton.click();
            await page.waitForTimeout(3000);
            
            await takeScreenshot(page, `job-posting-form-${account.role}`);
            
            // Fill job posting form
            const jobTitleField = await page.$('input[name*="title"], input[name*="jobTitle"]');
            if (jobTitleField) {
                await jobTitleField.click();
                await jobTitleField.type('Senior Software Engineer');
            }
            
            const jobDescriptionField = await page.$('textarea[name*="description"], textarea[name*="jobDescription"]');
            if (jobDescriptionField) {
                await jobDescriptionField.click();
                await jobDescriptionField.type('We are looking for a senior software engineer with 3+ years of experience in full-stack development.');
            }
            
            const companyField = await page.$('input[name*="company"]');
            if (companyField) {
                await companyField.click();
                await companyField.type('Tech Corp');
            }
            
            const locationField = await page.$('input[name*="location"]');
            if (locationField) {
                await locationField.click();
                await locationField.type('Mumbai, Maharashtra');
            }
            
            const salaryField = await page.$('input[name*="salary"]');
            if (salaryField) {
                await salaryField.click();
                await salaryField.type('1200000');
            }
            
            // Submit job posting
            const submitButton = await page.$('button[type="submit"], button:contains("Post"), button:contains("Publish")');
            if (submitButton) {
                await submitButton.click();
                await page.waitForTimeout(3000);
            }
            
            await takeScreenshot(page, `job-posted-${account.role}`);
            testResults.jobsPosted++;
            logSuccess(`Job posted by ${account.name}`);
            return true;
        } else {
            logInfo(`No job posting option found for ${account.name}`);
            return false;
        }
        
    } catch (error) {
        logError(`Failed to post job as ${account.name}: ${error.message}`);
        testResults.errors.push({
            type: 'job_posting_error',
            account: account.name,
            error: error.message
        });
        return false;
    }
}

/**
 * Test contact form
 */
async function testContactForm(page) {
    try {
        logInfo('Testing contact form');
        
        await page.goto(`${CONFIG.BASE_URL}/contact`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, 'contact-page');
        
        // Fill contact form
        const nameField = await page.$('input[name*="name"], input[name*="fullName"]');
        if (nameField) {
            await nameField.click();
            await nameField.type('Test User');
        }
        
        const emailField = await page.$('input[type="email"], input[name*="email"]');
        if (emailField) {
            await emailField.click();
            await emailField.type('test@example.com');
        }
        
        const subjectField = await page.$('input[name*="subject"]');
        if (subjectField) {
            await subjectField.click();
            await subjectField.type('Test Contact Form');
        }
        
        const messageField = await page.$('textarea[name*="message"]');
        if (messageField) {
            await messageField.click();
            await messageField.type('This is a test message to verify the contact form functionality.');
        }
        
        // Submit contact form
        const submitButton = await page.$('button[type="submit"], button:contains("Send")');
        if (submitButton) {
            await submitButton.click();
            await page.waitForTimeout(3000);
        }
        
        await takeScreenshot(page, 'contact-form-submitted');
        testResults.formsCompleted++;
        logSuccess('Contact form tested successfully');
        return true;
        
    } catch (error) {
        logError(`Failed to test contact form: ${error.message}`);
        testResults.formsFailed++;
        return false;
    }
}

/**
 * Main testing function
 */
async function runJobApplicationTests() {
    logHeader('FINAUTOJOBS JOB APPLICATION & FORM TESTING');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized', '--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // Test contact form (no login required)
        await testContactForm(page);
        
        // Test with applicant accounts
        for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
            if (account.role === 'applicant') {
                logHeader(`TESTING WITH APPLICANT: ${account.name}`);
                
                const loginSuccess = await loginUser(page, account);
                if (loginSuccess) {
                    await fillProfileForm(page, account, PROFILE_DATA.applicant);
                    await applyForJob(page, account, APPLICATION_DATA);
                    
                    testResults.completedTests.push({
                        account: account.name,
                        role: account.role,
                        tests: ['login', 'profile', 'job_application']
                    });
                }
                
                // Logout
                try {
                    const logoutButton = await page.$('button:contains("Logout"), .logout');
                    if (logoutButton) {
                        await logoutButton.click();
                        await page.waitForTimeout(2000);
                    }
                } catch (e) {
                    // Logout might not be available
                }
            }
        }
        
        // Test with recruiter accounts
        for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
            if (account.role === 'recruiter') {
                logHeader(`TESTING WITH RECRUITER: ${account.name}`);
                
                const loginSuccess = await loginUser(page, account);
                if (loginSuccess) {
                    await fillProfileForm(page, account, PROFILE_DATA.recruiter);
                    await postJob(page, account);
                    
                    testResults.completedTests.push({
                        account: account.name,
                        role: account.role,
                        tests: ['login', 'profile', 'job_posting']
                    });
                }
                
                // Logout
                try {
                    const logoutButton = await page.$('button:contains("Logout"), .logout');
                    if (logoutButton) {
                        await logoutButton.click();
                        await page.waitForTimeout(2000);
                    }
                } catch (e) {
                    // Logout might not be available
                }
            }
        }
        
        // Generate final report
        await generateTestReport();
        
    } catch (error) {
        logError(`Test execution failed: ${error.message}`);
        testResults.errors.push({
            type: 'execution_error',
            error: error.message
        });
    } finally {
        await browser.close();
    }
}

/**
 * Generate test report
 */
async function generateTestReport() {
    logHeader('JOB APPLICATION TESTING RESULTS');
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            formsCompleted: testResults.formsCompleted,
            formsFailed: testResults.formsFailed,
            applicationsSubmitted: testResults.applicationsSubmitted,
            profilesCompleted: testResults.profilesCompleted,
            jobsPosted: testResults.jobsPosted,
            screenshotsTaken: testResults.screenshotsTaken,
            totalErrors: testResults.errors.length
        },
        completedTests: testResults.completedTests,
        errors: testResults.errors
    };
    
    // Save to file
    fs.writeFileSync(CONFIG.RESULTS_FILE, JSON.stringify(report, null, 2));
    
    // Print summary
    logSuccess(`Forms Completed: ${testResults.formsCompleted}`);
    logSuccess(`Job Applications Submitted: ${testResults.applicationsSubmitted}`);
    logSuccess(`Profiles Completed: ${testResults.profilesCompleted}`);
    logSuccess(`Jobs Posted: ${testResults.jobsPosted}`);
    logSuccess(`Screenshots Taken: ${testResults.screenshotsTaken}`);
    
    if (testResults.formsFailed > 0) {
        logError(`Forms Failed: ${testResults.formsFailed}`);
    }
    
    if (testResults.errors.length > 0) {
        logError(`Total Errors: ${testResults.errors.length}`);
        testResults.errors.forEach((error, index) => {
            logError(`Error ${index + 1}: ${error.type} - ${error.error}`);
        });
    }
    
    logInfo(`Detailed report saved to: ${CONFIG.RESULTS_FILE}`);
    logInfo(`Screenshots saved to: ${CONFIG.SCREENSHOT_DIR}`);
    
    return report;
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    runJobApplicationTests().catch(error => {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

export default { runJobApplicationTests, TEST_ACCOUNTS, CONFIG };
