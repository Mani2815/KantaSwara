import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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

async function main() {
  console.log('Fetching existing users...');
  let hasMore = true;
  let page = 1;
  while (hasMore) {
    const { data: usersData, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      console.error('Error fetching users:', error);
      break;
    }
    
    for (const user of usersData.users) {
      console.log(`Deleting user ${user.email} (${user.id})...`);
      await supabase.auth.admin.deleteUser(user.id);
    }
    
    if (usersData.users.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  console.log('All existing credentials deleted.');
  
  console.log('Provisioning admin@kantaswara.com...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@kantaswara.com',
    password: '123456',
    email_confirm: true,
    user_metadata: { full_name: 'KantaSwara Admin' },
    app_metadata: {
      user_type: 'INTERNAL',
      employee_role: 'SUPER_ADMIN',
      account_status: 'ACTIVE'
    }
  });

  if (authError) {
    console.error('Failed to create admin:', authError);
    return;
  }
  
  const userId = authData.user.id;
  console.log('Admin created with ID:', userId);

  // We need to ensure the organization and profile are correctly set up
  // The trigger might have created the profile, let's update it or create it if missing
  console.log('Setting up organization and profile...');
  
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .upsert({ name: 'KantaSwara HQ', slug: 'kantaswara-hq', is_active: true }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (orgErr) { console.error('Org upsert failed:', orgErr); return; }
  
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      organization_id: org.id,
      full_name: 'KantaSwara Admin',
      email: 'admin@kantaswara.com',
      role: 'super_admin',
    }, { onConflict: 'id' });

  if (profileErr) { console.error('Profile upsert failed:', profileErr); return; }

  console.log('Successfully seeded superadmin! You can log in with:');
  console.log('Email: admin@kantaswara.com');
  console.log('Password: 123456');
}

main().catch(console.error);
