-- Enable RLS on core tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Helper functions to read custom JWT claims securely
CREATE OR REPLACE FUNCTION public.get_jwt_org_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::text;
$$;

CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_employee')::boolean, false);
$$;

-- ====================================================================
-- ORGANIZATIONS
-- ====================================================================
-- Users can read their own organization
CREATE POLICY "Users can read their own organization"
ON public.organizations FOR SELECT
USING (id::text = public.get_jwt_org_id() OR public.is_employee());

-- Users can update their own organization
CREATE POLICY "Users can update their own organization"
ON public.organizations FOR UPDATE
USING (id::text = public.get_jwt_org_id() OR public.is_employee());

-- ====================================================================
-- PROFILES
-- ====================================================================
-- Users can read profiles within their organization
CREATE POLICY "Users can read profiles in their org"
ON public.profiles FOR SELECT
USING (organization_id::text = public.get_jwt_org_id() OR public.is_employee());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid() OR public.is_employee());

-- ====================================================================
-- AGENTS
-- ====================================================================
CREATE POLICY "Users can access their org's agents"
ON public.agents FOR ALL
USING (organization_id::text = public.get_jwt_org_id() OR public.is_employee());

-- ====================================================================
-- WORKFLOWS
-- ====================================================================
CREATE POLICY "Users can access their org's workflows"
ON public.workflows FOR ALL
USING (organization_id::text = public.get_jwt_org_id() OR public.is_employee());

-- ====================================================================
-- CRM LEADS
-- ====================================================================
CREATE POLICY "Users can access their org's leads"
ON public.crm_leads FOR ALL
USING (organization_id::text = public.get_jwt_org_id() OR public.is_employee());

-- ====================================================================
-- CONVERSATIONS
-- ====================================================================
CREATE POLICY "Users can access their org's conversations"
ON public.conversations FOR ALL
USING (organization_id::text = public.get_jwt_org_id() OR public.is_employee());
