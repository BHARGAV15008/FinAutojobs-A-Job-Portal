#!/usr/bin/env node

/**
 * Script to update all ThemeContext imports to IntegratedThemeContext
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

// Files that need to be updated
const filesToUpdate = [
  'components/modals/ScheduleModal.jsx',
  'components/dashboard/EnhancedInterviewsTab.jsx',
  'components/modals/ContactModal.jsx',
  'components/modals/CandidateProfileModal.jsx',
  'components/dashboard/EnhancedCandidatesTab.jsx',
  'components/dashboard/EnhancedApplicantsTab.jsx',
  'components/layout/ModernDashboardLayout.jsx',
  'components/layout/DashboardSidebar.jsx',
  'components/layout/DashboardLayout.jsx',
  'components/layout/DashboardHeader.jsx',
  'pages/ApplicantDashboardNew.jsx',
  'pages/RecruiterDashboard.jsx',
  'pages/ApplicantDashboard.jsx',
  'pages/AdminDashboard.jsx'
];

function updateFile(filePath) {
  const fullPath = path.join(srcDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update the import statement
    const oldImport = `import { useTheme } from '../../contexts/ThemeContext';`;
    const newImport = `import { useTheme } from '../../contexts/IntegratedThemeContext';`;
    
    const oldImportAlt = `import { useTheme } from '../contexts/ThemeContext';`;
    const newImportAlt = `import { useTheme } from '../contexts/IntegratedThemeContext';`;
    
    const oldThemeProvider = `import { ThemeProvider } from "../contexts/ThemeContext";`;
    const newThemeProvider = `import { IntegratedThemeProvider } from "../contexts/IntegratedThemeContext";`;
    
    let updated = false;
    
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      updated = true;
    }
    
    if (content.includes(oldImportAlt)) {
      content = content.replace(oldImportAlt, newImportAlt);
      updated = true;
    }
    
    if (content.includes(oldThemeProvider)) {
      content = content.replace(oldThemeProvider, newThemeProvider);
      content = content.replace(/ThemeProvider>/g, 'IntegratedThemeProvider>');
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔄 Updating ThemeContext imports...\n');

filesToUpdate.forEach(updateFile);

console.log('\n✨ Theme import update completed!');
