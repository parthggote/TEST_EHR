#!/usr/bin/env node

/**
 * Epic FHIR Setup Script
 * Helps configure the Epic FHIR integration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function main() {
  console.log('🏥 Epic FHIR Integration Setup');
  console.log('=====================================\n');

  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('Choose your integration mode:\n');
  console.log('1. Mock Data Mode (for development/testing)');
  console.log('2. Real Epic API Mode (requires Epic registration)\n');

  const mode = await question('Select mode (1 or 2): ');

  let config = {};

  if (mode === '1') {
    // Mock data mode
    console.log('\n📊 Setting up Mock Data Mode...\n');
    
    config = {
      '# Epic FHIR Configuration - Mock Data Mode': '',
      'CLIENT_ID': '',
      'REDIRECT_URI': 'http://localhost:3000/auth/callback',
      'FHIR_BASE_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
      '': '',
      '# Epic OAuth2 Endpoints': '',
      'EPIC_AUTHORIZE_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      'EPIC_TOKEN_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      ' ': '',
      '# Development Mode - Use mock data': '',
      'USE_MOCK_DATA': 'true',
      '  ': '',
      '# Security (development keys)': '',
      'NEXTAUTH_SECRET': generateSecureKey(),
      'NEXTAUTH_URL': 'http://localhost:3000',
      'ENCRYPTION_KEY': generateSecureKey(16),
      '   ': '',
      '# Epic Test Patient': '',
      'TEST_PATIENT_ID': 'eq081-VQEgP8drUUqCWzHfw3',
      '    ': '',
      '# Environment': '',
      'NODE_ENV': 'development'
    };

    console.log('✅ Mock data mode configured!');
    console.log('   - Synthetic test data will be used');
    console.log('   - No Epic registration required');
    console.log('   - Perfect for development and testing\n');

  } else if (mode === '2') {
    // Real Epic API mode
    console.log('\n🌐 Setting up Real Epic API Mode...\n');
    
    console.log('You need to register your application with Epic first:');
    console.log('1. Visit: https://fhir.epic.com/Developer');
    console.log('2. Create an account and register your app');
    console.log('3. Get your Client ID from Epic\n');

    const clientId = await question('Enter your Epic Client ID: ');
    const redirectUri = await question('Enter your Redirect URI (default: http://localhost:3000/auth/callback): ') || 'http://localhost:3000/auth/callback';

    config = {
      '# Epic FHIR Configuration - Real Epic API': '',
      'CLIENT_ID': clientId,
      'REDIRECT_URI': redirectUri,
      'FHIR_BASE_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
      '': '',
      '# Epic OAuth2 Endpoints': '',
      'EPIC_AUTHORIZE_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
      'EPIC_TOKEN_URL': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
      ' ': '',
      '# Real Epic API Mode': '',
      'USE_MOCK_DATA': 'false',
      '  ': '',
      '# Security (production-grade keys)': '',
      'NEXTAUTH_SECRET': generateSecureKey(),
      'NEXTAUTH_URL': 'http://localhost:3000',
      'ENCRYPTION_KEY': generateSecureKey(16),
      '   ': '',
      '# Epic Test Patient': '',
      'TEST_PATIENT_ID': 'eq081-VQEgP8drUUqCWzHfw3',
      '    ': '',
      '# Environment': '',
      'NODE_ENV': 'development'
    };

    console.log('✅ Real Epic API mode configured!');
    console.log('   - Will connect to Epic FHIR sandbox');
    console.log('   - Requires valid Epic Client ID');
    console.log('   - Uses production-grade security\n');

  } else {
    console.log('❌ Invalid selection. Setup cancelled.');
    rl.close();
    return;
  }

  // Write .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => {
      if (key.startsWith('#') || key.trim() === '') {
        return key;
      }
      return `${key}=${value}`;
    })
    .join('\n');

  fs.writeFileSync(envPath, envContent);

  console.log('📝 Configuration saved to .env file');
  console.log('\n🚀 Next Steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Check status: http://localhost:3000/status');
  
  if (mode === '1') {
    console.log('4. Try demo: http://localhost:3000/demo');
  } else {
    console.log('4. Click "Connect to Epic MyChart" to test');
  }

  console.log('\n📚 Documentation:');
  console.log('- Setup Guide: ./EPIC_REAL_SETUP.md');
  console.log('- Epic Developer Portal: https://fhir.epic.com/Developer');
  console.log('- SMART on FHIR: http://hl7.org/fhir/smart-app-launch/');

  rl.close();
}

main().catch(console.error);