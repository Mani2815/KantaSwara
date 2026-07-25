import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_API_URL'
];

const PLACEHOLDERS = [
  '[project-ref]',
  '[password]',
  '[region]'
];

function validate() {
  console.log('🔍 Validating environment variables...');
  
  const envPath = resolve(process.cwd(), '.env.local');
  let loadedEnv = { ...process.env };

  if (existsSync(envPath)) {
    try {
      const content = readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [key, ...rest] = trimmed.split('=');
        loadedEnv[key.trim()] = rest.join('=').trim();
      }
      console.log('✅ Loaded env variables from .env.local');
    } catch (err) {
      console.error('⚠️ Failed to read .env.local:', err.message);
    }
  } else {
    // If not in CI/CD and no .env.local, alert the developer
    const inCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
    const hasAny = REQUIRED_VARS.some(key => process.env[key]);
    if (!inCI && !hasAny) {
      console.error('\n❌ Error: .env.local file is missing.');
      console.error('👉 Please copy .env.local.example to .env.local and fill in your actual values:');
      console.error('   cp .env.local.example .env.local\n');
      process.exit(1);
    }
  }

  const missing = [];
  const placeholderVars = [];

  for (const key of REQUIRED_VARS) {
    const val = loadedEnv[key];
    if (!val) {
      missing.push(key);
    } else if (PLACEHOLDERS.some(placeholder => val.includes(placeholder))) {
      placeholderVars.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Error: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('👉 Please configure them in your .env.local or shell environment.\n');
    process.exit(1);
  }

  if (placeholderVars.length > 0) {
    console.error('\n❌ Error: Placeholder values detected in environment variables:');
    placeholderVars.forEach(key => console.error(`   - ${key} contains: ${loadedEnv[key]}`));
    console.error('👉 Please replace placeholders with your actual connection details in .env.local.\n');
    process.exit(1);
  }

  console.log('✅ Environment configuration is valid.\n');
}

validate();
