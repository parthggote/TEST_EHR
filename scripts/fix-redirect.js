#!/usr/bin/env node

/**
 * Epic Redirect URI Fix Script
 * Helps diagnose and fix common redirect URI issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Epic Redirect URI Diagnostic Tool\n');

// Read current .env file
const envPath = path.join(process.cwd(), '.env');
let envContent = '';
let currentRedirectUri = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  const redirectMatch = envContent.match(/REDIRECT_URI=(.+)/);
  currentRedirectUri = redirectMatch ? redirectMatch[1].trim() : '';
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
  process.exit(1);
}

console.log('Current configuration:');
console.log(`📍 Redirect URI: ${currentRedirectUri || 'Not set'}\n`);

// Common issues and fixes
const issues = [
  {
    name: 'Missing REDIRECT_URI',
    check: () => !currentRedirectUri,
    fix: 'REDIRECT_URI=http://localhost:3000/auth/callback',
    description: 'Set the redirect URI to the callback endpoint'
  },
  {
    name: 'Wrong path',
    check: () => currentRedirectUri && !currentRedirectUri.includes('/auth/callback'),
    fix: currentRedirectUri.replace(/\/[^\/]*$/, '/auth/callback'),
    description: 'Redirect URI must end with /auth/callback'
  },
  {
    name: 'HTTPS in development',
    check: () => currentRedirectUri && currentRedirectUri.startsWith('https://localhost'),
    fix: currentRedirectUri.replace('https://', 'http://'),
    description: 'Use HTTP for localhost development'
  },
  {
    name: 'Wrong port',
    check: () => currentRedirectUri && currentRedirectUri.includes('localhost') && !currentRedirectUri.includes(':3000'),
    fix: currentRedirectUri.replace(/localhost:\d+/, 'localhost:3000'),
    description: 'Ensure port matches your dev server (usually 3000)'
  },
  {
    name: 'Trailing slash',
    check: () => currentRedirectUri && currentRedirectUri.endsWith('/auth/callback/'),
    fix: currentRedirectUri.replace(/\/$/, ''),
    description: 'Remove trailing slash from callback URL'
  }
];

let foundIssues = [];
let fixes = [];

issues.forEach(issue => {
  if (issue.check()) {
    foundIssues.push(issue);
    fixes.push(`${issue.name}: ${issue.description}`);
  }
});

if (foundIssues.length === 0) {
  console.log('✅ No obvious redirect URI issues found!');
  console.log('\nIf you\'re still having issues, check:');
  console.log('1. Your Epic app registration matches exactly');
  console.log('2. No extra spaces or characters');
  console.log('3. Case sensitivity');
  console.log('4. Your dev server is running on the correct port');
} else {
  console.log('🚨 Found potential issues:');
  foundIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.name}: ${issue.description}`);
  });

  console.log('\n🔧 Suggested fixes:');
  foundIssues.forEach((issue, index) => {
    console.log(`${index + 1}. Change REDIRECT_URI to: ${issue.fix}`);
  });

  // Ask if user wants to apply fixes
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nWould you like to apply the first fix automatically? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      const firstFix = foundIssues[0];
      const newEnvContent = envContent.replace(
        /REDIRECT_URI=.+/,
        `REDIRECT_URI=${firstFix.fix}`
      );

      try {
        fs.writeFileSync(envPath, newEnvContent);
        console.log(`✅ Updated REDIRECT_URI to: ${firstFix.fix}`);
        console.log('🔄 Please restart your dev server for changes to take effect');
      } catch (error) {
        console.error('❌ Failed to update .env file:', error.message);
      }
    } else {
      console.log('No changes made. You can manually update your .env file.');
    }
    rl.close();
  });
}

console.log('\n📚 Additional troubleshooting:');
console.log('- Visit http://localhost:3000/debug for more diagnostic info');
console.log('- Check browser console for detailed error messages');
console.log('- Verify your Epic app registration at https://fhir.epic.com/Developer');