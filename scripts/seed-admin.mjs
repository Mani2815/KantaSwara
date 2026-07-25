import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Read .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function provision(email, fullName, role) {
  console.log(`🔍 Provisioning user: ${email} as ${role}`);

  // Create auth user
  const password = 'Password123!';
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: {
      user_type: 'INTERNAL',
      employee_role: role.toUpperCase(),
      account_status: 'ACTIVE'
    }
  });

  let userId;
  if (authError && (authError.code === 'email_exists' || authError.message.includes('already exists'))) {
     const { data: users } = await supabase.auth.admin.listUsers();
     const existing = users.users.find(u => u.email === email);
     if (existing) {
         userId = existing.id;
         await supabase.auth.admin.updateUserById(userId, {
            password,
            app_metadata: { user_type: 'INTERNAL', employee_role: role.toUpperCase(), account_status: 'ACTIVE' }
         });
         console.log(`✅ Updated existing user ${email} as ${role} with password: ${password}`);
     }
  } else if (authError) {
      console.error(authError);
      return;
  } else {
      userId = authData.user.id;
      console.log(`✅ Provisioned ${email} as ${role} with password: ${password}`);
  }
}

async function main() {
  await provision('superadmin@kantaswara.com', 'Super Admin', 'SUPER_ADMIN');
  await provision('aiadmin@kantaswara.com', 'AI Solutions Admin', 'AI_SOLUTIONS_ADMIN');
}

main().catch(err => { console.error(err); process.exit(1); });
