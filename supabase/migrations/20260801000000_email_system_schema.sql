-- =============================================================================
-- KantaSwara — Migration: Email System Schema
-- =============================================================================
-- Purpose : Create all email system tables, enums, indexes, and RLS policies
--           that are defined in schema.prisma but missing from PostgreSQL.
-- Strategy: Fully idempotent — uses CREATE TYPE IF NOT EXISTS (via DO blocks)
--           and CREATE TABLE IF NOT EXISTS throughout. Safe to re-run.
-- Tables  : email_logs, email_templates, email_preferences, email_queue
-- Enums   : EmailStatus, EmailCategory, EmailPriority, EmailTemplateStatus
-- Follows : Project convention established in migrations 012 and 013.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS
--    All Prisma enums use PascalCase quoted identifiers to match the generated
--    Prisma client expectations (e.g. "EmailStatus").
-- ─────────────────────────────────────────────────────────────────────────────

-- EmailStatus
DO $$ BEGIN
  CREATE TYPE "EmailStatus" AS ENUM (
    'QUEUED',
    'SENDING',
    'SENT',
    'FAILED',
    'BOUNCED',
    'COMPLAINED',
    'SKIPPED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EmailCategory
DO $$ BEGIN
  CREATE TYPE "EmailCategory" AS ENUM (
    'AUTH',
    'ORGANIZATION',
    'EMPLOYEE',
    'DELIVERY',
    'AI_BUILDER',
    'BILLING',
    'SUPPORT',
    'DEMO',
    'SECURITY',
    'NOTIFICATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EmailPriority
DO $$ BEGIN
  CREATE TYPE "EmailPriority" AS ENUM (
    'CRITICAL',
    'HIGH',
    'NORMAL',
    'LOW'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EmailTemplateStatus
DO $$ BEGIN
  CREATE TYPE "EmailTemplateStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DRAFT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. EMAIL LOGS
--    Immutable record of every email send attempt.
--    Maps to Prisma model: EmailLog → @@map("email_logs")
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_logs (
  -- Primary key (UUID, matches Prisma @id @default(uuid()))
  id                 TEXT         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- Recipient info
  recipient          TEXT         NOT NULL,
  recipient_name     TEXT,

  -- Email content identifiers
  subject            TEXT         NOT NULL,
  template_key       TEXT,

  -- Classification
  category           "EmailCategory"  NOT NULL DEFAULT 'NOTIFICATION',
  priority           "EmailPriority"  NOT NULL DEFAULT 'NORMAL',
  status             "EmailStatus"    NOT NULL DEFAULT 'QUEUED',

  -- Context
  organization_id    TEXT,
  triggered_by       TEXT,           -- userId or 'system'
  triggered_by_event TEXT,

  -- Provider tracking
  provider_id        TEXT,           -- Resend message ID
  provider_response  JSONB,

  -- Template variables stored for retry
  variables          JSONB        NOT NULL DEFAULT '{}'::jsonb,

  -- Retry counter
  retry_count        INTEGER      NOT NULL DEFAULT 0,

  -- Timestamps
  sent_at            TIMESTAMPTZ,
  failed_at          TIMESTAMPTZ,
  error_message      TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes matching Prisma @@index declarations
CREATE INDEX IF NOT EXISTS idx_email_logs_org_id_created_at
  ON public.email_logs (organization_id, created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_status_created_at
  ON public.email_logs (status, created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_created_at
  ON public.email_logs (recipient, created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_template_key
  ON public.email_logs (template_key);

-- updated_at trigger (consistent with project pattern)
CREATE OR REPLACE FUNCTION public.set_email_logs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER trg_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_email_logs_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. EMAIL TEMPLATES
--    Metadata registry for all known email templates.
--    Maps to Prisma model: EmailTemplate → @@map("email_templates")
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_templates (
  id                 TEXT               NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key                TEXT               NOT NULL UNIQUE,   -- e.g. "welcome", "org-approved"
  name               TEXT               NOT NULL,
  description        TEXT,
  category           "EmailCategory"    NOT NULL,
  subject            TEXT               NOT NULL,          -- Default subject (can use {{vars}})
  variables          JSONB              NOT NULL DEFAULT '[]'::jsonb, -- [{name, required, description}]
  is_system_template BOOLEAN            NOT NULL DEFAULT false,
  is_mandatory       BOOLEAN            NOT NULL DEFAULT false,       -- Cannot be disabled
  status             "EmailTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
  created_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Indexes matching Prisma @@index declarations
CREATE INDEX IF NOT EXISTS idx_email_templates_category
  ON public.email_templates (category);

CREATE INDEX IF NOT EXISTS idx_email_templates_status
  ON public.email_templates (status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_templates_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_email_templates_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. EMAIL PREFERENCES
--    Per-user opt-in/opt-out settings.
--    Maps to Prisma model: EmailPreference → @@map("email_preferences")
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_preferences (
  id                    TEXT         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id               TEXT         NOT NULL UNIQUE,
  organization_id       TEXT,

  -- Individual preference toggles (all default to opted-in)
  marketing             BOOLEAN      NOT NULL DEFAULT true,
  system_notifications  BOOLEAN      NOT NULL DEFAULT true,
  billing_emails        BOOLEAN      NOT NULL DEFAULT true,
  security_alerts       BOOLEAN      NOT NULL DEFAULT true,
  project_notifications BOOLEAN      NOT NULL DEFAULT true,
  support_emails        BOOLEAN      NOT NULL DEFAULT true,
  newsletter            BOOLEAN      NOT NULL DEFAULT false,

  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes matching Prisma @@index declarations
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id
  ON public.email_preferences (user_id);

CREATE INDEX IF NOT EXISTS idx_email_preferences_org_id
  ON public.email_preferences (organization_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_preferences_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_preferences_updated_at ON public.email_preferences;
CREATE TRIGGER trg_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_email_preferences_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. EMAIL QUEUE
--    Retry and deferred send tracking.
--    Maps to Prisma model: EmailQueue → @@map("email_queue")
--    Foreign key → email_logs(id)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.email_queue (
  id              TEXT           NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email_log_id    TEXT           NOT NULL UNIQUE
                    REFERENCES public.email_logs(id) ON DELETE CASCADE,
  status          "EmailStatus"  NOT NULL DEFAULT 'QUEUED',
  scheduled_at    TIMESTAMPTZ,
  processed_at    TIMESTAMPTZ,
  max_retries     INTEGER        NOT NULL DEFAULT 3,
  current_retry   INTEGER        NOT NULL DEFAULT 0,
  next_retry_at   TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Indexes matching Prisma @@index declarations
CREATE INDEX IF NOT EXISTS idx_email_queue_status_next_retry
  ON public.email_queue (status, next_retry_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at
  ON public.email_queue (scheduled_at);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_email_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_queue_updated_at ON public.email_queue;
CREATE TRIGGER trg_email_queue_updated_at
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_email_queue_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
--    Enable RLS on all tables. Server-side Prisma (service role) bypasses RLS.
--    Deny all direct client access — only the service role can read/write.
--    Consistent with the project pattern established in 002_rls_policies.sql.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.email_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue       ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_logs' AND policyname = 'email_logs_service_role_bypass'
  ) THEN
    CREATE POLICY email_logs_service_role_bypass ON public.email_logs
      AS PERMISSIVE FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_templates' AND policyname = 'email_templates_service_role_bypass'
  ) THEN
    CREATE POLICY email_templates_service_role_bypass ON public.email_templates
      AS PERMISSIVE FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_preferences' AND policyname = 'email_preferences_service_role_bypass'
  ) THEN
    CREATE POLICY email_preferences_service_role_bypass ON public.email_preferences
      AS PERMISSIVE FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_queue' AND policyname = 'email_queue_service_role_bypass'
  ) THEN
    CREATE POLICY email_queue_service_role_bypass ON public.email_queue
      AS PERMISSIVE FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEED — Register all templates from templateRegistry.ts into email_templates
--    Guard-wrapped: only inserts rows that do not already exist.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.email_templates (key, name, description, category, subject, is_system_template, is_mandatory, status)
VALUES
  -- Auth templates
  ('auth-welcome',              'Welcome Email',                'Sent when a new user registers',               'AUTH',         'Welcome to KantaSwara, {{userName}}!',                 true, true,  'ACTIVE'),
  ('auth-verify-email',         'Verify Email',                 'Email verification link',                      'AUTH',         'Verify your email address',                            true, true,  'ACTIVE'),
  ('auth-password-reset',       'Password Reset',               'Password reset link',                          'AUTH',         'Reset your KantaSwara password',                       true, true,  'ACTIVE'),
  ('auth-password-changed',     'Password Changed',             'Confirms password was changed',                'AUTH',         'Your password was changed',                            true, true,  'ACTIVE'),
  ('auth-login-alert',          'Login Alert',                  'Alert on new device/location login',           'AUTH',         'New sign-in to your KantaSwara account',               true, true,  'ACTIVE'),
  ('auth-account-locked',       'Account Locked',               'Account locked notification',                  'AUTH',         'Your KantaSwara account has been locked',              true, true,  'ACTIVE'),
  -- Employee templates
  ('employee-invite',           'Employee Invitation',          'Sent when an employee is invited',             'EMPLOYEE',     'You have been invited to join KantaSwara',             true, true,  'ACTIVE'),
  ('employee-activated',        'Employee Activated',           'Welcome for activated employee accounts',      'EMPLOYEE',     'Your KantaSwara employee account is active',           true, false, 'ACTIVE'),
  ('employee-password-reset',   'Employee Password Reset',      'Password reset for employee accounts',         'EMPLOYEE',     'Reset your KantaSwara employee password',              true, true,  'ACTIVE'),
  ('employee-role-changed',     'Employee Role Changed',        'Notifies employee of role change',             'EMPLOYEE',     'Your role has been updated on KantaSwara',             true, false, 'ACTIVE'),
  -- Organization templates
  ('org-registration-submitted', 'Registration Submitted',      'Confirms registration is under review',        'ORGANIZATION', 'Your KantaSwara registration is under review',         true, true,  'ACTIVE'),
  ('org-admin-new-registration', 'New Registration (Admin)',    'Notifies admin of new org registration',       'ORGANIZATION', 'New organization registration requires review',         true, true,  'ACTIVE'),
  ('org-approved',              'Organization Approved',        'Sent when org is approved',                    'ORGANIZATION', 'Your KantaSwara account has been approved!',           true, true,  'ACTIVE'),
  ('org-rejected',              'Organization Rejected',        'Sent when org registration is rejected',       'ORGANIZATION', 'Update on your KantaSwara application',                true, true,  'ACTIVE'),
  ('org-suspended',             'Organization Suspended',       'Sent when org is suspended',                   'ORGANIZATION', 'Your KantaSwara account has been suspended',           true, true,  'ACTIVE'),
  -- Billing templates
  ('billing-subscription-created', 'Subscription Created',     'Sent when subscription starts',                'BILLING',      'Your KantaSwara subscription is active',               true, false, 'ACTIVE'),
  ('billing-invoice-generated',    'Invoice Generated',         'Sent with new invoice',                        'BILLING',      'Invoice {{invoiceNumber}} from KantaSwara',            true, false, 'ACTIVE'),
  ('billing-payment-failed',       'Payment Failed',            'Sent when payment fails',                      'BILLING',      'Action required: Payment failed for KantaSwara',      true, false, 'ACTIVE'),
  ('billing-payment-successful',   'Payment Successful',        'Sent on successful payment',                   'BILLING',      'Payment received — Thank you!',                        true, false, 'ACTIVE'),
  ('billing-subscription-expiring','Subscription Expiring',     'Sent before subscription expires',             'BILLING',      'Your KantaSwara subscription is expiring soon',        true, false, 'ACTIVE'),
  ('billing-trial-ending',         'Trial Ending',              'Sent before trial ends',                       'BILLING',      'Your KantaSwara trial ends in {{daysRemaining}} days', true, false, 'ACTIVE'),
  -- Delivery templates
  ('delivery-project-assigned',    'Project Assigned',          'Internal — project assigned to team member',  'DELIVERY',     'New project assigned: {{projectName}}',                true, false, 'ACTIVE'),
  ('delivery-deployment-complete', 'Deployment Complete',       'Sent when agent deployment is done',          'DELIVERY',     'Your AI agent {{agentName}} is deployed!',             true, false, 'ACTIVE'),
  ('delivery-deployment-failed',   'Deployment Failed',         'Sent when agent deployment fails',            'DELIVERY',     'Deployment failed for {{agentName}}',                  true, false, 'ACTIVE'),
  ('delivery-qa-approved',         'QA Approved',               'Sent when QA passes',                         'DELIVERY',     '{{agentName}} passed QA review',                       true, false, 'ACTIVE'),
  -- AI Builder templates
  ('builder-draft-saved',          'Draft Saved',               'Confirms agent draft was saved',              'AI_BUILDER',   'Your agent draft has been saved',                      true, false, 'ACTIVE'),
  ('builder-validation-passed',    'Validation Passed',         'Agent passed validation',                     'AI_BUILDER',   '{{agentName}} passed validation',                      true, false, 'ACTIVE'),
  ('builder-validation-failed',    'Validation Failed',         'Agent failed validation',                     'AI_BUILDER',   'Validation failed for {{agentName}}',                  true, false, 'ACTIVE'),
  ('builder-published',            'Agent Published',           'Confirms agent was published',                'AI_BUILDER',   '{{agentName}} is now published',                       true, false, 'ACTIVE'),
  ('builder-deployment-started',   'Deployment Started',        'Deployment has begun',                        'AI_BUILDER',   'Deploying {{agentName}} to {{environment}}',            true, false, 'ACTIVE'),
  ('builder-rollback-complete',    'Rollback Complete',         'Agent rolled back to previous version',       'AI_BUILDER',   '{{agentName}} rolled back to version {{version}}',     true, false, 'ACTIVE'),
  -- Support templates
  ('support-ticket-created',       'Ticket Created',            'Confirms support ticket creation',            'SUPPORT',      'Support ticket #{{ticketId}} received',                true, false, 'ACTIVE'),
  ('support-ticket-assigned',      'Ticket Assigned',           'Notifies agent of ticket assignment',         'SUPPORT',      'Ticket #{{ticketId}} assigned to you',                 true, false, 'ACTIVE'),
  ('support-ticket-updated',       'Ticket Updated',            'Update on support ticket',                    'SUPPORT',      'Update on ticket #{{ticketId}}',                       true, false, 'ACTIVE'),
  ('support-ticket-closed',        'Ticket Closed',             'Ticket closure notification',                 'SUPPORT',      'Your ticket #{{ticketId}} has been resolved',          true, false, 'ACTIVE'),
  ('support-customer-reply',       'Customer Reply',            'Notifies agent of customer reply',            'SUPPORT',      'Customer replied to ticket #{{ticketId}}',             true, false, 'ACTIVE'),
  ('support-internal-reply',       'Internal Reply',            'Notifies customer of agent reply',            'SUPPORT',      'New reply on your ticket #{{ticketId}}',               true, false, 'ACTIVE'),
  -- Demo templates
  ('demo-completed',               'Demo Completed',            'Follow-up after voice demo session',          'DEMO',         'Thanks for trying KantaSwara!',                        true, false, 'ACTIVE'),
  ('demo-contact-sales',           'Contact Sales',             'Connects prospect with sales team',           'DEMO',         'Our team will be in touch soon',                       true, false, 'ACTIVE'),
  ('demo-meeting-confirmed',       'Meeting Confirmed',         'Confirms scheduled demo meeting',             'DEMO',         'Your KantaSwara demo is confirmed',                    true, false, 'ACTIVE'),
  ('demo-trial-invitation',        'Trial Invitation',          'Invites prospect to start a trial',           'DEMO',         'Start your KantaSwara trial today',                    true, false, 'ACTIVE'),
  -- Security templates
  ('security-suspicious-login',    'Suspicious Login',          'Alert for suspicious login activity',         'SECURITY',     'Suspicious sign-in detected on your account',          true, true,  'ACTIVE'),
  ('security-api-key-created',     'API Key Created',           'Confirms new API key was created',            'SECURITY',     'New API key created for your account',                 true, false, 'ACTIVE'),
  ('security-api-key-revoked',     'API Key Revoked',           'Confirms API key was revoked',                'SECURITY',     'API key revoked for your account',                     true, false, 'ACTIVE'),
  ('security-mfa-enabled',         'MFA Enabled',               'Confirms MFA was enabled',                    'SECURITY',     'Two-factor authentication enabled',                    true, false, 'ACTIVE'),
  ('security-mfa-disabled',        'MFA Disabled',              'Confirms MFA was disabled',                   'SECURITY',     'Two-factor authentication disabled',                   true, true,  'ACTIVE')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- END OF MIGRATION: Email System Schema
-- ─────────────────────────────────────────────────────────────────────────────
