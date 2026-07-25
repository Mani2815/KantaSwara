-- =============================================================================
-- KantaSwara — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- for LIKE search optimization
CREATE EXTENSION IF NOT EXISTS "unaccent";          -- for accent-insensitive search

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'org_admin', 'manager', 'agent', 'viewer'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'draft', 'error');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE call_outcome AS ENUM (
    'completed', 'transferred', 'voicemail', 'abandoned', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'new', 'contacted', 'qualified', 'converted', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'create', 'update', 'delete', 'login', 'logout',
    'password_reset', 'role_change', 'settings_change'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Organizations
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organizations (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT        NOT NULL,
  slug                 TEXT        NOT NULL UNIQUE,
  logo_url             TEXT,
  plan                 TEXT        NOT NULL DEFAULT 'free',
  max_agents           INT         NOT NULL DEFAULT 5,
  max_concurrent_calls INT         NOT NULL DEFAULT 10,
  settings             JSONB       NOT NULL DEFAULT '{}',
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations (is_active)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- User Profiles (linked to auth.users)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY,  -- matches auth.users.id
  organization_id UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  full_name       TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  avatar_url      TEXT,
  role            user_role   NOT NULL DEFAULT 'org_admin',
  phone           TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  last_seen_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles (organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (organization_id, role)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Agents
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agents (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id   UUID          NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name              TEXT          NOT NULL,
  description       TEXT,
  status            agent_status  NOT NULL DEFAULT 'draft',
  workflow_id       UUID,
  voice_config      JSONB         NOT NULL DEFAULT '{}',
  greeting          TEXT          NOT NULL DEFAULT '',
  system_prompt     TEXT          NOT NULL DEFAULT '',
  knowledge_base_ids UUID[]       NOT NULL DEFAULT '{}',
  active_calls      INT           NOT NULL DEFAULT 0,
  total_calls       INT           NOT NULL DEFAULT 0,
  avg_call_duration FLOAT         NOT NULL DEFAULT 0,
  success_rate      FLOAT         NOT NULL DEFAULT 0,
  deployed_at       TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents (organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents (organization_id, status)
  WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Workflows
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workflows (
  id              UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID             NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            TEXT             NOT NULL,
  description     TEXT,
  status          workflow_status  NOT NULL DEFAULT 'draft',
  contract        JSONB            NOT NULL DEFAULT '{}',
  version         INT              NOT NULL DEFAULT 1,
  last_published_at TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON public.workflows (organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows (organization_id, status)
  WHERE deleted_at IS NULL;

-- Fix forward reference: agents.workflow_id → workflows
ALTER TABLE public.agents
  ADD CONSTRAINT fk_agents_workflow
  FOREIGN KEY (workflow_id) REFERENCES public.workflows (id) ON DELETE SET NULL
  NOT VALID;  -- skip validation for performance on existing data

-- ─────────────────────────────────────────────────────────────────────────────
-- Knowledge Bases
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.knowledge_bases (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  description      TEXT,
  document_count   INT         NOT NULL DEFAULT 0,
  total_size_bytes BIGINT      NOT NULL DEFAULT 0,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID        NOT NULL REFERENCES public.knowledge_bases (id) ON DELETE CASCADE,
  organization_id   UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  mime_type         TEXT        NOT NULL,
  size_bytes        BIGINT      NOT NULL,
  storage_key       TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'processing',
  metadata          JSONB       NOT NULL DEFAULT '{}',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_bases_org ON public.knowledge_bases (organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_kb ON public.knowledge_documents (knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_org ON public.knowledge_documents (organization_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CRM Leads
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_leads (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  phone           TEXT        NOT NULL,
  email           TEXT,
  status          lead_status NOT NULL DEFAULT 'new',
  source          TEXT,
  notes           TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.crm_leads (organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.crm_leads (organization_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.crm_leads (phone);

-- ─────────────────────────────────────────────────────────────────────────────
-- Conversations (Call Records)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID          NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  agent_id         UUID          NOT NULL REFERENCES public.agents (id) ON DELETE RESTRICT,
  lead_id          UUID          REFERENCES public.crm_leads (id) ON DELETE SET NULL,
  direction        call_direction NOT NULL,
  caller_number    TEXT          NOT NULL,
  caller_name      TEXT,
  status           TEXT          NOT NULL DEFAULT 'active',
  started_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INT           NOT NULL DEFAULT 0,
  transcript       JSONB[]       NOT NULL DEFAULT '{}',
  sentiment        TEXT,
  outcome          call_outcome,
  recording_url    TEXT,
  metadata         JSONB         NOT NULL DEFAULT '{}',
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_org ON public.conversations (organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON public.conversations (organization_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON public.conversations (organization_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON public.conversations (lead_id)
  WHERE lead_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Analytics (daily aggregations)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id      UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  agent_id             UUID        REFERENCES public.agents (id) ON DELETE SET NULL,
  date                 DATE        NOT NULL,
  total_calls          INT         NOT NULL DEFAULT 0,
  answered_calls       INT         NOT NULL DEFAULT 0,
  avg_duration_seconds FLOAT       NOT NULL DEFAULT 0,
  success_rate         FLOAT       NOT NULL DEFAULT 0,
  sentiment_positive   INT         NOT NULL DEFAULT 0,
  sentiment_neutral    INT         NOT NULL DEFAULT 0,
  sentiment_negative   INT         NOT NULL DEFAULT 0,
  metadata             JSONB       NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, agent_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_org_date ON public.analytics (organization_id, date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Organization Settings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.org_settings (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID        NOT NULL UNIQUE REFERENCES public.organizations (id) ON DELETE CASCADE,
  timezone        TEXT        NOT NULL DEFAULT 'UTC',
  language        TEXT        NOT NULL DEFAULT 'en',
  webhook_url     TEXT,
  webhook_secret  TEXT,
  custom_domain   TEXT,
  branding        JSONB       NOT NULL DEFAULT '{}',
  notifications   JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Audit Logs (append-only)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID         NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  action          audit_action NOT NULL,
  resource_type   TEXT         NOT NULL,
  resource_id     UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs (resource_type, resource_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations', 'profiles', 'agents', 'workflows',
    'knowledge_bases', 'knowledge_documents', 'crm_leads',
    'conversations', 'analytics', 'org_settings'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;
