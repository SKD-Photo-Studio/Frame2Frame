const fs = require('fs');
const path = require('path');

// Extract all NEXT_PUBLIC_ and NEXT_PRIVATE_ environment variables from the build system
const envContent = Object.keys(process.env)
  .filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('NEXT_PRIVATE_'))
  .map(k => `${k}=${process.env[k]}`)
  .join('\n');

const envPath = path.join(process.cwd(), '.env.production');
fs.writeFileSync(envPath, envContent);

console.log(`⚡️ Antigravity: Injected ${Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('NEXT_PRIVATE_')).length} variables into .env.production`);
