-- =============================================================================
-- KantaSwara — Migration 013: Full Prisma Schema Synchronisation
-- =============================================================================
-- Purpose : Align the live PostgreSQL (Supabase) database with schema.prisma.
-- Strategy: ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS throughout.
--           This is a safe, idempotent, non-destructive migration.
--           No data is dropped. Can be re-run safely.
-- Fixes   : The runtime crash "column subscription_plans.has_sla does not exist"
--           and every other column / table that schema.prisma defines but the
--           database currently lacks.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS — add missing values where required
-- ─────────────────────────────────────────────────────────────────────────────

-- PaymentStatus — add 'failed' and 'cancelled' if not present
DO $$ BEGIN
  ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'failed';
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION WHEN others THEN null; END $$;

-- AddOnType enum
DO $$ BEGIN
  CREATE TYPE "AddOnType" AS ENUM (
    'ADDITIONAL_AGENT','ADDITIONAL_MINUTES','CRM_INTEGRATION',
    'ERP_INTEGRATION','WHATSAPP_INTEGRATION','API_INTEGRATION',
    'VOICE_CUSTOMIZATION','ADDITIONAL_LANGUAGE','CUSTOM_WORKFLOW',
    'PROMPT_OPTIMIZATION','DEDICATED_TRAINING','PREMIUM_SUPPORT'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AddOnBillingType enum
DO $$ BEGIN
  CREATE TYPE "AddOnBillingType" AS ENUM ('ONE_TIME','RECURRING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AddOnStatus enum
DO $$ BEGIN
  CREATE TYPE "AddOnStatus" AS ENUM ('ACTIVE','INACTIVE','PENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DiscountType enum
DO $$ BEGIN
  CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE','FIXED_AMOUNT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DiscountScope enum
DO $$ BEGIN
  CREATE TYPE "DiscountScope" AS ENUM ('SUBSCRIPTION','IMPLEMENTATION','ADDON','ALL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- NotificationType enum
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM (
    'QUOTATION_CREATED','QUOTATION_SENT','QUOTATION_APPROVED','QUOTATION_REJECTED',
    'INVOICE_GENERATED','PAYMENT_RECEIVED','PAYMENT_FAILED','SUBSCRIPTION_EXPIRING',
    'PLAN_UPGRADED','PLAN_DOWNGRADED','USAGE_LIMIT_REACHED','USAGE_LIMIT_WARNING',
    'MINUTES_PURCHASED','RENEWAL_REMINDER','SUBSCRIPTION_SUSPENDED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SUBSCRIPTION PLANS — add ALL columns that 006 did not create
--    PRIMARY FIX: has_sla (and all siblings that were also missing)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS display_name          TEXT         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS implementation_fee    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS has_sla               BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_dedicated_infra   BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_white_label       BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_custom             BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order         INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS features              JSONB        NOT NULL DEFAULT '[]'::jsonb;

-- Backfill display_name for any existing rows that still have the empty default
UPDATE public.subscription_plans
SET display_name = name
WHERE display_name = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ORGANIZATION SUBSCRIPTIONS — add columns missing from 006
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.organization_subscriptions
  ADD COLUMN IF NOT EXISTS canceled_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason     TEXT,
  ADD COLUMN IF NOT EXISTS custom_minutes        INTEGER,
  ADD COLUMN IF NOT EXISTS custom_monthly_price  DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS discount_id           TEXT,
  ADD COLUMN IF NOT EXISTS notes                 TEXT,
  ADD COLUMN IF NOT EXISTS created_by            TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INVOICES — align with current Prisma schema
--    006 used tax_total / discount_total; Prisma uses tax_amount / discount_amount
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS quotation_id       TEXT,
  ADD COLUMN IF NOT EXISTS subscription_id    TEXT,
  ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_period_end   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS tax_amount         DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS paid_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS balance_due        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS notes              TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes     TEXT,
  ADD COLUMN IF NOT EXISTS created_by         TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INVOICE ITEMS — add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS taxable    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PAYMENTS — add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS verified_by      TEXT,
  ADD COLUMN IF NOT EXISTS verified_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS created_by       TEXT NOT NULL DEFAULT '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. PROFESSIONAL SERVICES — add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.professional_services
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. USAGE REPORTS — add missing columns (006 had minimal definition)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.usage_reports
  ADD COLUMN IF NOT EXISTS billing_month         DATE,
  ADD COLUMN IF NOT EXISTS inbound_calls         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outbound_calls        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_calls           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overage_rate_per_min  DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS storage_used_gb       DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS api_requests          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_agents         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recordings_count      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_id            TEXT,
  ADD COLUMN IF NOT EXISTS finalized_at          TIMESTAMPTZ;

-- Add unique constraint for (organization_id, billing_month) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usage_reports_organization_id_billing_month_key'
  ) THEN
    ALTER TABLE public.usage_reports
      ADD CONSTRAINT usage_reports_organization_id_billing_month_key
      UNIQUE (organization_id, billing_month);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. NEW TABLES — create all tables that exist in Prisma schema but not in DB
-- ─────────────────────────────────────────────────────────────────────────────

-- 9a. Discounts
CREATE TABLE IF NOT EXISTS public.discounts (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code         TEXT NOT NULL UNIQUE,
  description  TEXT,
  type         "DiscountType" NOT NULL,
  scope        "DiscountScope" NOT NULL,
  value        DECIMAL(10,4) NOT NULL,
  max_usages   INTEGER,
  usage_count  INTEGER NOT NULL DEFAULT 0,
  valid_from   TIMESTAMPTZ NOT NULL,
  valid_until  TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  approved_by  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9b. Tax Configurations
CREATE TABLE IF NOT EXISTS public.tax_configurations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  rate        DECIMAL(6,4) NOT NULL,
  description TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9c. Add-Ons
CREATE TABLE IF NOT EXISTS public.add_ons (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  code         TEXT NOT NULL UNIQUE,
  description  TEXT,
  type         "AddOnType" NOT NULL,
  billing_type "AddOnBillingType" NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,
  unit         TEXT NOT NULL,
  taxable      BOOLEAN NOT NULL DEFAULT true,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9d. Subscription Add-Ons
CREATE TABLE IF NOT EXISTS public.subscription_add_ons (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  subscription_id TEXT NOT NULL REFERENCES public.organization_subscriptions(id) ON DELETE CASCADE,
  add_on_id       TEXT NOT NULL REFERENCES public.add_ons(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      DECIMAL(12,2) NOT NULL,
  status          "AddOnStatus" NOT NULL DEFAULT 'ACTIVE',
  activated_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscription_add_ons_subscription_id
  ON public.subscription_add_ons (subscription_id);

-- 9e. Renewal History
CREATE TABLE IF NOT EXISTS public.renewal_history (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  subscription_id TEXT NOT NULL REFERENCES public.organization_subscriptions(id) ON DELETE CASCADE,
  plan_id         TEXT NOT NULL,
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  invoice_id      TEXT,
  status          TEXT NOT NULL,
  renewed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_renewal_history_subscription_id
  ON public.renewal_history (subscription_id);

-- 9f. Quotation Items (the full Quotation table was in 006 with a different shape;
--     add items table if missing)
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quotation_id TEXT NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  add_on_id   TEXT REFERENCES public.add_ons(id),
  description TEXT NOT NULL,
  quantity    DECIMAL(10,2) NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  type        TEXT NOT NULL,
  taxable     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id
  ON public.quotation_items (quotation_id);

-- Align quotations table to current Prisma schema (006 had different columns)
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS quotation_number      TEXT,
  ADD COLUMN IF NOT EXISTS agent_request_id      TEXT,
  ADD COLUMN IF NOT EXISTS plan_id               TEXT,
  ADD COLUMN IF NOT EXISTS title                 TEXT,
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS type                  TEXT,
  ADD COLUMN IF NOT EXISTS implementation_fee    DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS subscription_monthly  DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS subtotal              DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS discount_id           TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount            DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_amount          DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS sent_at               TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason      TEXT,
  ADD COLUMN IF NOT EXISTS notes                 TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes        TEXT,
  ADD COLUMN IF NOT EXISTS created_by            TEXT,
  ADD COLUMN IF NOT EXISTS approved_by           TEXT;

-- Add unique constraint on quotation_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'quotations_quotation_number_key'
  ) THEN
    -- Only add if no nulls exist yet (safe default for new setups)
    ALTER TABLE public.quotations
      ADD CONSTRAINT quotations_quotation_number_key UNIQUE (quotation_number);
  END IF;
EXCEPTION WHEN others THEN null;
END $$;

-- 9g. Usage Records
CREATE TABLE IF NOT EXISTS public.usage_records (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  agent_id        TEXT,
  call_id         TEXT,
  type            TEXT NOT NULL,
  duration_seconds INTEGER,
  quantity        DECIMAL(12,4) NOT NULL DEFAULT 1,
  unit            TEXT NOT NULL,
  billing_month   DATE NOT NULL,
  is_billed       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_records_org_billing_month
  ON public.usage_records (organization_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_usage_records_org_billed
  ON public.usage_records (organization_id, is_billed);

-- 9h. Billing Notifications
CREATE TABLE IF NOT EXISTS public.billing_notifications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT,
  type            "NotificationType" NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_notifications_org_id
  ON public.billing_notifications (organization_id);

-- 9i. Agent Requests (AI solutions delivery)
CREATE TABLE IF NOT EXISTS public.agent_requests (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  domain          TEXT NOT NULL,
  priority        TEXT NOT NULL DEFAULT 'medium',
  status          TEXT NOT NULL DEFAULT 'pending_review',
  requirements    JSONB NOT NULL DEFAULT '{}'::jsonb,
  assigned_to     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agent_requests_org_id ON public.agent_requests (organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status  ON public.agent_requests (status);

-- 9j. Agent Projects
CREATE TABLE IF NOT EXISTS public.agent_projects (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  request_id      TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL,
  assigned_to     TEXT,
  status          TEXT NOT NULL DEFAULT 'in_development',
  completion_pct  INTEGER NOT NULL DEFAULT 0,
  milestones      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agent_projects_org_id ON public.agent_projects (organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_projects_status  ON public.agent_projects (status);

-- 9k. Agent Configurations (delivery console — NOT the builder schema)
CREATE TABLE IF NOT EXISTS public.agent_configurations (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id   TEXT NOT NULL,
  name         TEXT NOT NULL,
  purpose      TEXT NOT NULL,
  version      INTEGER NOT NULL DEFAULT 1,
  prompt_id    TEXT,
  workflow_id  TEXT,
  voice_id     TEXT,
  knowledge_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_project_id
  ON public.agent_configurations (project_id);

-- 9l. Prompt Configurations
CREATE TABLE IF NOT EXISTS public.prompt_configurations (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  system_prompt   TEXT NOT NULL,
  greeting_prompt TEXT NOT NULL,
  fallback_prompt TEXT NOT NULL,
  variables       JSONB NOT NULL DEFAULT '{}'::jsonb,
  version         INTEGER NOT NULL DEFAULT 1
);

-- 9m. Workflow Configurations
CREATE TABLE IF NOT EXISTS public.workflow_configurations (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  decision_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  integrations  JSONB NOT NULL DEFAULT '[]'::jsonb,
  version       INTEGER NOT NULL DEFAULT 1
);

-- 9n. Voice Configurations
CREATE TABLE IF NOT EXISTS public.voice_configurations (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider TEXT NOT NULL,
  model    TEXT NOT NULL,
  language TEXT NOT NULL,
  accent   TEXT NOT NULL,
  tone     TEXT NOT NULL,
  speed    DECIMAL NOT NULL DEFAULT 1.0
);

-- 9o. Knowledge Configurations
CREATE TABLE IF NOT EXISTS public.knowledge_configurations (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sources      JSONB NOT NULL DEFAULT '[]'::jsonb,
  index_status TEXT NOT NULL DEFAULT 'pending'
);

-- 9p. QA Reviews
CREATE TABLE IF NOT EXISTS public.qa_reviews (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id  TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  status      TEXT NOT NULL,
  checklist   JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_project_id ON public.qa_reviews (project_id);

-- 9q. Deployments
CREATE TABLE IF NOT EXISTS public.deployments (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id  TEXT NOT NULL,
  version     INTEGER NOT NULL,
  environment TEXT NOT NULL,
  deployed_by TEXT NOT NULL,
  status      TEXT NOT NULL,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deployments_project_env
  ON public.deployments (project_id, environment);

-- 9r. Agent Assignments
CREATE TABLE IF NOT EXISTS public.agent_assignments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  deployment_id   TEXT NOT NULL,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'active'
);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_org_id
  ON public.agent_assignments (organization_id);

-- 9s. Change Requests
CREATE TABLE IF NOT EXISTS public.change_requests (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  assignment_id   TEXT NOT NULL,
  category        TEXT NOT NULL,
  priority        TEXT NOT NULL DEFAULT 'medium',
  status          TEXT NOT NULL DEFAULT 'pending',
  details         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_change_requests_org_id
  ON public.change_requests (organization_id);
CREATE INDEX IF NOT EXISTS idx_change_requests_assignment_id
  ON public.change_requests (assignment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. FOREIGN KEY CONSTRAINTS — add missing FK from discount_id columns
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organization_subscriptions_discount_id_fkey'
  ) THEN
    ALTER TABLE public.organization_subscriptions
      ADD CONSTRAINT organization_subscriptions_discount_id_fkey
      FOREIGN KEY (discount_id) REFERENCES public.discounts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotations_discount_id_fkey'
  ) THEN
    ALTER TABLE public.quotations
      ADD CONSTRAINT quotations_discount_id_fkey
      FOREIGN KEY (discount_id) REFERENCES public.discounts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quotations_plan_id_fkey'
  ) THEN
    ALTER TABLE public.quotations
      ADD CONSTRAINT quotations_plan_id_fkey
      FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. SEED — Default Tax Configuration (GST 18%)
--     Guard-wrapped so it's safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tax_configurations WHERE name = 'GST 18%'
  ) THEN
    INSERT INTO public.tax_configurations
      (id, name, rate, description, is_default, is_active, created_at, updated_at)
    VALUES
      (gen_random_uuid()::text, 'GST 18%', 0.18, 'Standard GST rate for B2B SaaS', TRUE, TRUE, NOW(), NOW());
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- END OF MIGRATION 013
-- ─────────────────────────────────────────────────────────────────────────────
