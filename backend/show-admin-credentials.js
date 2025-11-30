#!/usr/bin/env node

console.log('\n' + '═'.repeat(80));
console.log('🎉 ADMIN ACCOUNTS CREATED SUCCESSFULLY!');
console.log('═'.repeat(80) + '\n');

console.log('✅ 5 admin accounts have been created with different permission levels:\n');

const admins = [
  {
    level: '👑 SUPER-ADMIN',
    email: 'superadmin@finautojobs.com',
    password: 'SuperAdmin@2025!',
    name: 'Super Admin',
    access: 'Full System Access (All Permissions)'
  },
  {
    level: '🔑 ADMIN',
    email: 'admin@finautojobs.com',
    password: 'Admin@2025!',
    name: 'System Administrator',
    access: 'High (All except System & Moderation)'
  },
  {
    level: '🛡️  MODERATOR',
    email: 'moderator@finautojobs.com',
    password: 'Moderator@2025!',
    name: 'Content Moderator',
    access: 'Medium (Content, Jobs, Moderation)'
  },
  {
    level: '🔑 ADMIN',
    email: 'hr.admin@finautojobs.com',
    password: 'HRAdmin@2025!',
    name: 'HR Administrator',
    access: 'High (Users, Jobs, Recruiters, Applicants)'
  },
  {
    level: '🛡️  MODERATOR',
    email: 'support.admin@finautojobs.com',
    password: 'Support@2025!',
    name: 'Support Administrator',
    access: 'Medium (Users, Applicants, Support)'
  }
];

admins.forEach((admin, index) => {
  console.log(`${index + 1}. ${admin.level}`);
  console.log(`   Name:     ${admin.name}`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${admin.password}`);
  console.log(`   Access:   ${admin.access}`);
  console.log('');
});

console.log('═'.repeat(80));
console.log('⚠️  SECURITY WARNING');
console.log('═'.repeat(80));
console.log('');
console.log('🔒 Change all passwords immediately after first login!');
console.log('🔐 Enable Two-Factor Authentication (2FA)');
console.log('🗑️  Delete credential files after securing in password manager');
console.log('🚫 Never share credentials via email, chat, or screenshots');
console.log('');

console.log('═'.repeat(80));
console.log('📚 DOCUMENTATION');
console.log('═'.repeat(80));
console.log('');
console.log('📄 ADMIN_CREDENTIALS.md         - Complete credential documentation');
console.log('📄 ADMIN_QUICK_REFERENCE.txt    - Quick reference card');
console.log('📄 ADMIN_MANAGEMENT_GUIDE.md    - Full management guide');
console.log('');

console.log('═'.repeat(80));
console.log('🚀 QUICK COMMANDS');
console.log('═'.repeat(80));
console.log('');
console.log('List admins:    npm run list:admins');
console.log('Create admins:  npm run create:admins');
console.log('Start backend:  npm run dev');
console.log('');

console.log('═'.repeat(80));
console.log('🔗 LOGIN');
console.log('═'.repeat(80));
console.log('');
console.log('URL: http://192.168.41.134:3000/admin/login');
console.log('');

console.log('═'.repeat(80) + '\n');
