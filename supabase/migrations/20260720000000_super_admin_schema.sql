-- Migration: Super Admin Platform Schemas
-- Note: These tables are meant to exist in the public schema but be strictly 
-- protected via Row Level Security (RLS) such that only 'super_admin' roles can access them.

-- 1. Platform Settings (Global Configuration)
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode boolean DEFAULT false,
  global_announcement text,
  allowed_signups boolean DEFAULT true,
  default_trial_days int DEFAULT 14,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- 2. Audit Logs (Immutable Ledger of Admin Actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- e.g., 'org_suspended', 'feature_flag_toggled'
  target_resource text,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Feature Flags (Rollout & Gating)
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  description text,
  is_enabled_globally boolean DEFAULT false,
  enabled_for_orgs uuid[] DEFAULT '{}', -- Array of specific org IDs
  rollout_percentage int DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Security Incidents (Threat Monitoring)
CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type text NOT NULL, -- e.g., 'brute_force', 'api_abuse'
  target_user_id uuid REFERENCES auth.users(id),
  target_org_id uuid REFERENCES organizations(id),
  ip_address text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

-- 5. Platform Announcements (Broadcasts to Tenants)
CREATE TABLE IF NOT EXISTS platform_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance', 'release')),
  is_published boolean DEFAULT false,
  publish_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Row Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Super Admin Policies (Full Access)
CREATE POLICY "Super Admins have full access to platform_settings" ON platform_settings FOR ALL USING (auth.is_super_admin());
CREATE POLICY "Super Admins have full access to audit_logs" ON audit_logs FOR ALL USING (auth.is_super_admin());
CREATE POLICY "Super Admins have full access to feature_flags" ON feature_flags FOR ALL USING (auth.is_super_admin());
CREATE POLICY "Super Admins have full access to security_incidents" ON security_incidents FOR ALL USING (auth.is_super_admin());
CREATE POLICY "Super Admins have full access to platform_announcements" ON platform_announcements FOR ALL USING (auth.is_super_admin());

-- Read-only policies for Org Admins (Announcements)
CREATE POLICY "Org Admins can view published announcements" 
ON platform_announcements FOR SELECT 
USING (is_published = true AND (publish_at IS NULL OR publish_at <= now()) AND (expires_at IS NULL OR expires_at >= now()));
