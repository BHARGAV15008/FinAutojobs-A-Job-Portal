import { sanitizeSocialLinks } from './utils/urlValidator.js';

// Test the URL validator with localhost URLs
const testUrls = {
  linkedin_url: 'http://192.168.41.134:3000/applicant-dashboard/profile',
  github_url: 'http://192.168.41.134:3000/applicant-dashboard/profile1',
  portfolio_url: 'http://192.168.41.134:3000/applicant-dashboard/profile2'
};

console.log('🔍 Testing URL validator...');
console.log('Input URLs:', testUrls);

const sanitized = sanitizeSocialLinks(testUrls);
console.log('Sanitized URLs:', sanitized);

// Test individual validation
import { isValidExternalUrl } from './utils/urlValidator.js';

console.log('\n🔍 Individual URL validation:');
console.log('192.168.41.134:3000 valid?', isValidExternalUrl('http://192.168.41.134:3000/test'));
console.log('github.com valid?', isValidExternalUrl('https://github.com/user'));
console.log('linkedin.com valid?', isValidExternalUrl('https://linkedin.com/in/user'));
