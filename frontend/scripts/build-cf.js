const fs = require('fs');
const path = require('path');

// Load environment variables from local .env files if they exist (for local builds/testing)
const envLocalPath = path.join(process.cwd(), '.env.local');
const envDefaultPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  try {
    require('dotenv').config({ path: envLocalPath });
    console.log('⚡️ Antigravity: Loaded env from .env.local');
  } catch (e) {
    console.warn('⚠️ Antigravity: Failed to load .env.local', e.message);
  }
} else if (fs.existsSync(envDefaultPath)) {
  try {
    require('dotenv').config({ path: envDefaultPath });
    console.log('⚡️ Antigravity: Loaded env from .env');
  } catch (e) {
    console.warn('⚠️ Antigravity: Failed to load .env', e.message);
  }
}

// Required environment variables for a functioning build
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PRIVATE_SUPABASE_SECRET_KEY'
];

const missing = requiredVars.filter(
  v => !process.env[v] || 
       process.env[v] === 'dummy_key_for_build' || 
       process.env[v] === 'dummy_key_for_client' ||
       process.env[v].trim() === ''
);

if (missing.length > 0) {
  console.error('\n🔴 CRITICAL BUILD ERROR: Missing or invalid required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease ensure these variables are configured correctly in your Cloudflare Pages dashboard (under Settings > Environment Variables) or your local .env.local file.\n');
  process.exit(1);
}

// Extract all NEXT_PUBLIC_ and NEXT_PRIVATE_ environment variables from the build system
const envContent = Object.keys(process.env)
  .filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('NEXT_PRIVATE_'))
  .map(k => `${k}=${process.env[k]}`)
  .join('\n');

const envPath = path.join(process.cwd(), '.env.production');
fs.writeFileSync(envPath, envContent);

console.log(`⚡️ Antigravity: Verified build variables & successfully injected ${Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('NEXT_PRIVATE_')).length} variables into .env.production`);

