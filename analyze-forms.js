#!/usr/bin/env node

/**
 * Form Analysis Script for FinAutoJobs
 * Analyzes all forms in the codebase and provides testing guidance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_SRC = path.join(__dirname, 'frontend', 'src');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Form analysis results
let formAnalysis = {
    totalFiles: 0,
    filesWithForms: 0,
    totalForms: 0,
    formTypes: {},
    pages: [],
    components: [],
    summary: {}
};

/**
 * Get all JSX files recursively
 */
function getAllJSXFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            getAllJSXFiles(fullPath, files);
        } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Analyze a single file for forms
 */
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(FRONTEND_SRC, filePath);
        
        formAnalysis.totalFiles++;
        
        // Look for form elements
        const formMatches = content.match(/<form[^>]*>/g) || [];
        const formCount = formMatches.length;
        
        if (formCount > 0) {
            formAnalysis.filesWithForms++;
            formAnalysis.totalForms += formCount;
            
            const fileInfo = {
                file: relativePath,
                path: filePath,
                formCount: formCount,
                forms: [],
                inputs: [],
                buttons: []
            };
            
            // Analyze each form
            formMatches.forEach((formMatch, index) => {
                const formInfo = analyzeFormElement(content, formMatch, index);
                fileInfo.forms.push(formInfo);
            });
            
            // Find inputs and buttons
            fileInfo.inputs = findInputElements(content);
            fileInfo.buttons = findButtonElements(content);
            
            // Categorize by file type
            if (relativePath.startsWith('pages/')) {
                formAnalysis.pages.push(fileInfo);
            } else if (relativePath.startsWith('components/')) {
                formAnalysis.components.push(fileInfo);
            }
            
            return fileInfo;
        }
        
        return null;
        
    } catch (error) {
        logWarning(`Error analyzing file ${filePath}: ${error.message}`);
        return null;
    }
}

/**
 * Analyze a specific form element
 */
function analyzeFormElement(content, formMatch, index) {
    const formInfo = {
        index: index,
        element: formMatch,
        attributes: {},
        purpose: 'unknown'
    };
    
    // Extract attributes
    const attrMatches = formMatch.match(/(\w+)=["']([^"']+)["']/g) || [];
    attrMatches.forEach(attr => {
        const [key, value] = attr.split('=');
        formInfo.attributes[key] = value.replace(/["']/g, '');
    });
    
    // Determine form purpose based on context
    const contextBefore = content.substring(Math.max(0, content.indexOf(formMatch) - 500), content.indexOf(formMatch));
    const contextAfter = content.substring(content.indexOf(formMatch), content.indexOf(formMatch) + 500);
    const fullContext = contextBefore + contextAfter;
    
    if (fullContext.toLowerCase().includes('login')) {
        formInfo.purpose = 'login';
    } else if (fullContext.toLowerCase().includes('register') || fullContext.toLowerCase().includes('signup')) {
        formInfo.purpose = 'registration';
    } else if (fullContext.toLowerCase().includes('forgot') || fullContext.toLowerCase().includes('reset')) {
        formInfo.purpose = 'password_reset';
    } else if (fullContext.toLowerCase().includes('contact')) {
        formInfo.purpose = 'contact';
    } else if (fullContext.toLowerCase().includes('job') && fullContext.toLowerCase().includes('apply')) {
        formInfo.purpose = 'job_application';
    } else if (fullContext.toLowerCase().includes('search')) {
        formInfo.purpose = 'search';
    } else if (fullContext.toLowerCase().includes('profile') || fullContext.toLowerCase().includes('settings')) {
        formInfo.purpose = 'profile_settings';
    }
    
    // Track form types
    if (!formAnalysis.formTypes[formInfo.purpose]) {
        formAnalysis.formTypes[formInfo.purpose] = 0;
    }
    formAnalysis.formTypes[formInfo.purpose]++;
    
    return formInfo;
}

/**
 * Find input elements
 */
function findInputElements(content) {
    const inputMatches = content.match(/<input[^>]*>/g) || [];
    const textareaMatches = content.match(/<textarea[^>]*>/g) || [];
    const selectMatches = content.match(/<select[^>]*>/g) || [];
    
    return {
        input: inputMatches.length,
        textarea: textareaMatches.length,
        select: selectMatches.length,
        total: inputMatches.length + textareaMatches.length + selectMatches.length
    };
}

/**
 * Find button elements
 */
function findButtonElements(content) {
    const buttonMatches = content.match(/<button[^>]*>/g) || [];
    const submitMatches = content.match(/<input[^>]*type=["']submit["'][^>]*>/g) || [];
    
    return {
        button: buttonMatches.length,
        submit: submitMatches.length,
        total: buttonMatches.length + submitMatches.length
    };
}

/**
 * Generate testing guide
 */
function generateTestingGuide() {
    logHeader('FORM TESTING GUIDE');
    
    // Group forms by purpose
    const formsByPurpose = {};
    
    [...formAnalysis.pages, ...formAnalysis.components].forEach(fileInfo => {
        fileInfo.forms.forEach(form => {
            if (!formsByPurpose[form.purpose]) {
                formsByPurpose[form.purpose] = [];
            }
            formsByPurpose[form.purpose].push({
                file: fileInfo.file,
                form: form
            });
        });
    });
    
    Object.keys(formsByPurpose).forEach(purpose => {
        log(`\n📋 ${purpose.toUpperCase().replace('_', ' ')} FORMS:`, 'yellow');
        formsByPurpose[purpose].forEach(item => {
            log(`   • ${item.file}`, 'cyan');
        });
    });
    
    // Testing recommendations
    logHeader('TESTING RECOMMENDATIONS');
    
    log('🔍 FORMS TO TEST:', 'bright');
    Object.keys(formAnalysis.formTypes).forEach(type => {
        const count = formAnalysis.formTypes[type];
        log(`   • ${type.replace('_', ' ').toUpperCase()}: ${count} form(s)`, 'green');
    });
    
    log('\n🧪 TEST SCENARIOS:', 'bright');
    log('   1. Valid data submission', 'green');
    log('   2. Invalid data validation', 'yellow');
    log('   3. Required field validation', 'yellow');
    log('   4. Form reset functionality', 'blue');
    log('   5. Error message display', 'red');
    log('   6. Success message display', 'green');
    log('   7. Loading states', 'blue');
    log('   8. Responsive design', 'magenta');
    
    log('\n🎯 SPECIFIC TESTS BY FORM TYPE:', 'bright');
    
    if (formAnalysis.formTypes.login) {
        log('   LOGIN FORMS:', 'cyan');
        log('     • Test email/username validation');
        log('     • Test password visibility toggle');
        log('     • Test "Remember me" functionality');
        log('     • Test forgot password link');
        log('     • Test role selection (if applicable)');
    }
    
    if (formAnalysis.formTypes.registration) {
        log('   REGISTRATION FORMS:', 'cyan');
        log('     • Test email format validation');
        log('     • Test password strength validation');
        log('     • Test password confirmation matching');
        log('     • Test phone number validation');
        log('     • Test terms and conditions checkbox');
        log('     • Test role-specific fields');
    }
    
    if (formAnalysis.formTypes.job_application) {
        log('   JOB APPLICATION FORMS:', 'cyan');
        log('     • Test file upload functionality');
        log('     • Test resume upload');
        log('     • Test cover letter submission');
        log('     • Test application form validation');
    }
    
    if (formAnalysis.formTypes.search) {
        log('   SEARCH FORMS:', 'cyan');
        log('     • Test search query validation');
        log('     • Test filter functionality');
        log('     • Test autocomplete features');
        log('     • Test search results display');
    }
}

/**
 * Create test accounts data
 */
function generateTestAccounts() {
    logHeader('TEST ACCOUNTS TO CREATE');
    
    const testAccounts = [
        {
            type: 'Applicant 1',
            email: 'applicant1.test@example.com',
            password: 'TestPass123!',
            firstName: 'John',
            lastName: 'Doe',
            phone: '9876543210',
            role: 'applicant'
        },
        {
            type: 'Applicant 2',
            email: 'applicant2.test@example.com',
            password: 'TestPass123!',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '9876543211',
            role: 'applicant'
        },
        {
            type: 'Recruiter 1',
            email: 'recruiter1.test@example.com',
            password: 'TestPass123!',
            firstName: 'Mike',
            lastName: 'Johnson',
            phone: '9876543212',
            role: 'recruiter',
            company: 'Tech Corp',
            designation: 'HR Manager'
        },
        {
            type: 'Recruiter 2',
            email: 'recruiter2.test@example.com',
            password: 'TestPass123!',
            firstName: 'Sarah',
            lastName: 'Wilson',
            phone: '9876543213',
            role: 'recruiter',
            company: 'StartupXYZ',
            designation: 'Talent Acquisition'
        }
    ];
    
    testAccounts.forEach(account => {
        log(`\n👤 ${account.type}:`, 'cyan');
        log(`   Email: ${account.email}`, 'green');
        log(`   Password: ${account.password}`, 'green');
        log(`   Name: ${account.firstName} ${account.lastName}`, 'green');
        log(`   Phone: ${account.phone}`, 'green');
        log(`   Role: ${account.role}`, 'green');
        if (account.company) log(`   Company: ${account.company}`, 'green');
        if (account.designation) log(`   Designation: ${account.designation}`, 'green');
    });
}

/**
 * Main analysis function
 */
function analyzeAllForms() {
    logHeader('FINAUTOJOBS FORM ANALYSIS');
    
    if (!fs.existsSync(FRONTEND_SRC)) {
        log('❌ Frontend source directory not found!', 'red');
        return;
    }
    
    logInfo('Scanning for JSX files...');
    const jsxFiles = getAllJSXFiles(FRONTEND_SRC);
    logInfo(`Found ${jsxFiles.length} JSX/JS files`);
    
    logInfo('Analyzing files for forms...');
    jsxFiles.forEach(file => {
        const analysis = analyzeFile(file);
        if (analysis) {
            logSuccess(`Found forms in: ${analysis.file}`);
        }
    });
    
    // Generate summary
    formAnalysis.summary = {
        totalFiles: formAnalysis.totalFiles,
        filesWithForms: formAnalysis.filesWithForms,
        totalForms: formAnalysis.totalForms,
        formTypes: Object.keys(formAnalysis.formTypes).length,
        pages: formAnalysis.pages.length,
        components: formAnalysis.components.length
    };
    
    // Print results
    logHeader('ANALYSIS RESULTS');
    logSuccess(`Total Files Scanned: ${formAnalysis.totalFiles}`);
    logSuccess(`Files with Forms: ${formAnalysis.filesWithForms}`);
    logSuccess(`Total Forms Found: ${formAnalysis.totalForms}`);
    logSuccess(`Form Types: ${Object.keys(formAnalysis.formTypes).length}`);
    logSuccess(`Pages with Forms: ${formAnalysis.pages.length}`);
    logSuccess(`Components with Forms: ${formAnalysis.components.length}`);
    
    // Detailed breakdown
    logHeader('DETAILED BREAKDOWN');
    
    log('\n📄 PAGES WITH FORMS:', 'bright');
    formAnalysis.pages.forEach(page => {
        log(`   • ${page.file} (${page.formCount} forms, ${page.inputs.total} inputs, ${page.buttons.total} buttons)`, 'cyan');
    });
    
    log('\n🧩 COMPONENTS WITH FORMS:', 'bright');
    formAnalysis.components.forEach(component => {
        log(`   • ${component.file} (${component.formCount} forms, ${component.inputs.total} inputs, ${component.buttons.total} buttons)`, 'magenta');
    });
    
    // Generate testing guide
    generateTestingGuide();
    
    // Generate test accounts
    generateTestAccounts();
    
    // Save results to file
    const resultsFile = path.join(__dirname, 'form-analysis-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(formAnalysis, null, 2));
    logInfo(`Detailed results saved to: ${resultsFile}`);
    
    return formAnalysis;
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeAllForms();
}

export default { analyzeAllForms, formAnalysis };
