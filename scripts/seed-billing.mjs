import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Read .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ Error: .env.local file is missing.');
  console.error('👉 Please copy .env.local.example to .env.local and fill in your actual values.');
  process.exit(1);
}

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
  console.log('Seeding Billing Data via Supabase Client...');

  // ──────────────────────────────────────────────────────────────
  // Subscription Plans — all fields aligned with schema.prisma
  // ──────────────────────────────────────────────────────────────
  const plans = [
    {
      id: 'plan_free',
      name: 'Free',
      display_name: 'Free',
      description: 'Get started with KantaSwara at no cost.',
      price_monthly: 0,
      implementation_fee: 0,
      max_agents: 1,
      included_minutes: 100,
      max_team_members: 1,
      storage_limit_gb: 1,
      api_rate_limit: 60,
      support_level: 'Community',
      overage_rate_per_min: 0.10,
      has_sla: false,
      has_dedicated_infra: false,
      has_white_label: false,
      is_custom: false,
      display_order: 1,
      features: JSON.stringify(['1 AI Agent', '100 minutes/month', 'Community support']),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'plan_pro',
      name: 'Pro',
      display_name: 'Pro',
      description: 'Scale your voice AI operations with advanced features.',
      price_monthly: 299,
      implementation_fee: 499,
      max_agents: 5,
      included_minutes: 2000,
      max_team_members: 5,
      storage_limit_gb: 10,
      api_rate_limit: 300,
      support_level: 'Email & Chat',
      overage_rate_per_min: 0.08,
      has_sla: false,
      has_dedicated_infra: false,
      has_white_label: false,
      is_custom: false,
      display_order: 2,
      features: JSON.stringify(['5 AI Agents', '2,000 minutes/month', 'Email & Chat support', 'CRM integration']),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      display_name: 'Enterprise',
      description: 'Full-scale enterprise deployment with SLA, dedicated infra, and white-label.',
      price_monthly: 999,
      implementation_fee: 2499,
      max_agents: 20,
      included_minutes: 10000,
      max_team_members: 20,
      storage_limit_gb: 100,
      api_rate_limit: 1000,
      support_level: '24/7 Dedicated',
      overage_rate_per_min: 0.05,
      has_sla: true,
      has_dedicated_infra: true,
      has_white_label: true,
      is_custom: false,
      display_order: 3,
      features: JSON.stringify([
        '20 AI Agents', '10,000 minutes/month', '24/7 dedicated support',
        'SLA guarantee', 'Dedicated infrastructure', 'White-label branding',
      ]),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const plan of plans) {
    const { error } = await supabase
      .from('subscription_plans')
      .upsert(plan, { onConflict: 'id' });
    if (error) console.error(`❌ Error upserting plan ${plan.name}:`, error.message);
  }
  console.log('✅ Plans Seeded');

  // ──────────────────────────────────────────────────────────────
  // Subscriptions & Invoices per org
  // ──────────────────────────────────────────────────────────────
  const { data: orgs } = await supabase.from('organizations').select('*');

  for (const org of (orgs ?? [])) {
    let planId = 'plan_free';
    if (org.slug.includes('client')) planId = 'plan_pro';
    if (org.slug.includes('voice'))  planId = 'plan_enterprise';

    const { error: subErr } = await supabase.from('organization_subscriptions').upsert({
      id: `sub_${org.id}`,
      organization_id: org.id,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id' });

    if (subErr) console.error(`❌ Error assigning subscription to ${org.name}:`, subErr.message);

    if (planId !== 'plan_free') {
      const price = planId === 'plan_pro' ? 299 : 999;
      const tax   = Math.round(price * 0.18 * 100) / 100; // 18% GST
      const total = price + tax;

      const { error: invErr } = await supabase.from('invoices').upsert({
        id: `inv_${org.id}`,
        invoice_number: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        organization_id: org.id,
        type: 'subscription',
        subtotal: price,
        discount_amount: 0,   // matches schema.prisma field (not discount_total)
        tax_amount: tax,      // matches schema.prisma field (not tax_total)
        paid_amount: total,
        balance_due: 0,
        total_amount: total,
        status: 'paid',
        due_date: new Date().toISOString(),
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (invErr) console.error(`❌ Error creating invoice for ${org.name}:`, invErr.message);
    }
  }

  console.log('✅ Subscriptions and Invoices Seeded');
  console.log('🎉 Done!');
}

main().catch(console.error);
