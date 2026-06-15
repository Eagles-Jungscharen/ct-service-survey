#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Paths
const rootEnvPath = join(rootDir, '.env.local');
const frontendEnvPath = join(rootDir, 'packages', 'frontend', '.env.local');
const backendSettingsPath = join(rootDir, 'packages', 'backend', 'local.settings.json');

console.log('🔄 Synchronizing environment variables...\n');

// Check if root .env.local exists
if (!existsSync(rootEnvPath)) {
  console.error('❌ Error: .env.local not found in root directory');
  console.error('   Please copy .env.example to .env.local and configure your values');
  process.exit(1);
}

// Read root .env.local
let envContent;
try {
  envContent = readFileSync(rootEnvPath, 'utf-8');
} catch (error) {
  console.error(`❌ Error reading ${rootEnvPath}:`, error.message);
  process.exit(1);
}

// Parse environment variables
const envVars = {};
const lines = envContent.split('\n');

for (const line of lines) {
  const trimmedLine = line.trim();
  
  // Skip empty lines and comments
  if (!trimmedLine || trimmedLine.startsWith('#')) {
    continue;
  }
  
  // Parse KEY=VALUE
  const equalIndex = trimmedLine.indexOf('=');
  if (equalIndex > 0) {
    const key = trimmedLine.substring(0, equalIndex).trim();
    const value = trimmedLine.substring(equalIndex + 1).trim();
    envVars[key] = value;
  }
}

// Separate frontend and backend variables
const frontendVars = {};
const backendVars = {};

for (const [key, value] of Object.entries(envVars)) {
  if (key.startsWith('VITE_')) {
    frontendVars[key] = value;
  } else {
    backendVars[key] = value;
  }
}

console.log(`📊 Found ${Object.keys(frontendVars).length} frontend variables (VITE_*)`);
console.log(`📊 Found ${Object.keys(backendVars).length} backend variables\n`);

// Write frontend .env.local
try {
  const frontendEnvContent = Object.entries(frontendVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  writeFileSync(frontendEnvPath, frontendEnvContent, 'utf-8');
  console.log('✅ Frontend .env.local updated:', frontendEnvPath);
} catch (error) {
  console.error('❌ Error writing frontend .env.local:', error.message);
  process.exit(1);
}

// Write backend local.settings.json
try {
  const localSettings = {
    IsEncrypted: false,
    Values: backendVars,
    Host: {
      CORS: 'http://localhost:5173',
      CORSCredentials: true
    }
  };
  
  writeFileSync(
    backendSettingsPath,
    JSON.stringify(localSettings, null, 2),
    'utf-8'
  );
  console.log('✅ Backend local.settings.json updated:', backendSettingsPath);
} catch (error) {
  console.error('❌ Error writing backend local.settings.json:', error.message);
  process.exit(1);
}

console.log('\n✨ Environment synchronization complete!\n');
console.log('📝 Summary:');
console.log(`   - Frontend: ${Object.keys(frontendVars).length} variables`);
console.log(`   - Backend:  ${Object.keys(backendVars).length} variables`);
console.log('\n🚀 You can now start the development servers:');
console.log('   npm run dev:frontend  (Terminal 1)');
console.log('   npm run dev:backend   (Terminal 2)');
