-- =============================================================================
-- KantaSwara — Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Run this in: Supabase Dashboard → SQL Editor (after 001_initial_schema.sql)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper Functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Get the organization_id for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if the current user is an org admin or higher
CREATE OR REPLACE FUNCTION public.is_org_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'org_admin')
      AND deleted_at IS NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if the current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND deleted_at IS NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if the current user has at least a given role level
CREATE OR REPLACE FUNCTION public.has_min_role(min_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  role_order TEXT[] := ARRAY['viewer', 'agent', 'manager', 'org_admin', 'super_admin'];
  user_role  TEXT;
  user_idx   INT;
  min_idx    INT;
BEGIN
  SELECT p.role::TEXT INTO user_role
  FROM public.profiles p
  WHERE p.id = auth.uid() AND p.deleted_at IS NULL;

  IF user_role IS NULL THEN RETURN FALSE; END IF;

  user_idx := array_position(role_order, user_role);
  min_idx  := array_position(role_order, min_role);

  RETURN user_idx >= min_idx;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on all public tables
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_bases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- ORGANIZATIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can only read their own organization
CREATE POLICY "org_select_own"
  ON public.organizations
  FOR SELECT
  USING (
    id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

-- Only org admins and super admins can update org details
CREATE POLICY "org_update_admin"
  ON public.organizations
  FOR UPDATE
  USING (
    id = public.get_user_organization_id()
    AND public.is_org_admin()
  );

-- Only super admins can create organizations (normal flow goes via service role)
CREATE POLICY "org_insert_super_admin"
  ON public.organizations
  FOR INSERT
  WITH CHECK (public.is_super_admin());

-- Soft delete only — no hard delete for users
CREATE POLICY "org_delete_super_admin"
  ON public.organizations
  FOR DELETE
  USING (public.is_super_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can view all profiles within their organization
CREATE POLICY "profiles_select_own_org"
  ON public.profiles
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

-- Users can only update their own profile (name, avatar, phone)
-- Org admins can update any profile in their org (role changes etc.)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      organization_id = public.get_user_organization_id()
      AND public.is_org_admin()
    )
    OR public.is_super_admin()
  );

-- Only service role inserts profiles (via trigger)
-- No explicit INSERT policy — service role bypasses RLS

-- ─────────────────────────────────────────────────────────────────────────────
-- AGENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "agents_select_own_org"
  ON public.agents
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "agents_insert_manager"
  ON public.agents
  FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

CREATE POLICY "agents_update_manager"
  ON public.agents
  FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

CREATE POLICY "agents_delete_admin"
  ON public.agents
  FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.is_org_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WORKFLOWS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "workflows_select_own_org"
  ON public.workflows
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "workflows_insert_manager"
  ON public.workflows
  FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

CREATE POLICY "workflows_update_manager"
  ON public.workflows
  FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

CREATE POLICY "workflows_delete_admin"
  ON public.workflows
  FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.is_org_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- KNOWLEDGE BASES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "knowledge_bases_select_own_org"
  ON public.knowledge_bases
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "knowledge_bases_write_manager"
  ON public.knowledge_bases
  FOR ALL
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

-- Knowledge documents follow the same org isolation
CREATE POLICY "knowledge_docs_select_own_org"
  ON public.knowledge_documents
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "knowledge_docs_write_manager"
  ON public.knowledge_documents
  FOR ALL
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('manager')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CRM LEADS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "leads_select_own_org"
  ON public.crm_leads
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "leads_write_agent"
  ON public.crm_leads
  FOR ALL
  USING (
    organization_id = public.get_user_organization_id()
    AND public.has_min_role('agent')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "conversations_select_own_org"
  ON public.conversations
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

-- Conversations are written by the backend (service role); deny from client
CREATE POLICY "conversations_write_service"
  ON public.conversations
  FOR INSERT
  WITH CHECK (FALSE);  -- Only service role (bypasses RLS) can insert

-- ─────────────────────────────────────────────────────────────────────────────
-- ANALYTICS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "analytics_select_own_org"
  ON public.analytics
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

-- Analytics are written by backend service role only
CREATE POLICY "analytics_write_service"
  ON public.analytics
  FOR INSERT
  WITH CHECK (FALSE);

-- ─────────────────────────────────────────────────────────────────────────────
-- ORG SETTINGS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "org_settings_select_own_org"
  ON public.org_settings
  FOR SELECT
  USING (
    organization_id = public.get_user_organization_id()
    OR public.is_super_admin()
  );

CREATE POLICY "org_settings_update_admin"
  ON public.org_settings
  FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.is_org_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- AUDIT LOGS (read-only for users)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs
  FOR SELECT
  USING (
    (
      organization_id = public.get_user_organization_id()
      AND public.is_org_admin()
    )
    OR public.is_super_admin()
  );

-- Audit logs are written by backend service role only
CREATE POLICY "audit_logs_write_service"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (FALSE);
