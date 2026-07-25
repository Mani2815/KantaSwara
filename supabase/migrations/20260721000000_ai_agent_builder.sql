-- AI Agent Builder Schema Migration
-- Designed for Internal Delivery Team (Solutions Admin)

-- 1. agents (Core Entity)
CREATE TABLE public.builder_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  stage VARCHAR(50) DEFAULT 'draft', -- draft, configuration, testing, in_qa, ready_for_deployment, deployed
  status VARCHAR(50) DEFAULT 'active', -- active, archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. agent_versions (Immutable releases)
CREATE TABLE public.builder_agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.builder_agents(id) ON DELETE CASCADE,
  version_string VARCHAR(20) NOT NULL,
  deployment_env VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link agents to their current version
ALTER TABLE public.builder_agents 
ADD COLUMN current_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE SET NULL;

-- 3. agent_configurations
CREATE TABLE public.builder_agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  language VARCHAR(20) DEFAULT 'en-US',
  supported_languages JSONB DEFAULT '[]'::jsonb,
  timezone VARCHAR(50) DEFAULT 'UTC',
  business_hours JSONB DEFAULT '{}'::jsonb,
  welcome_message TEXT,
  fallback_behavior VARCHAR(50) DEFAULT 'escalate',
  escalation_behavior VARCHAR(50) DEFAULT 'transfer_to_human',
  call_timeout_seconds INTEGER DEFAULT 3600,
  max_conversation_duration INTEGER DEFAULT 7200,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. prompt_configurations
CREATE TABLE public.builder_prompt_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  system_prompt TEXT,
  greeting_prompt TEXT,
  conversation_prompt TEXT,
  qualification_prompt TEXT,
  knowledge_retrieval_prompt TEXT,
  booking_prompt TEXT,
  escalation_prompt TEXT,
  closing_prompt TEXT,
  fallback_prompt TEXT,
  error_handling_prompt TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. workflow_configurations
CREATE TABLE public.builder_workflow_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  decision_logic JSONB DEFAULT '{}'::jsonb,
  intent_routing JSONB DEFAULT '{}'::jsonb,
  webhooks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. knowledge_configurations
CREATE TABLE public.builder_knowledge_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  attached_documents JSONB DEFAULT '[]'::jsonb,
  crawled_urls JSONB DEFAULT '[]'::jsonb,
  processing_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. voice_configurations
CREATE TABLE public.builder_voice_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  provider VARCHAR(50),
  model VARCHAR(100),
  accent VARCHAR(50),
  speaking_style VARCHAR(50),
  speed DECIMAL DEFAULT 1.0,
  pitch DECIMAL DEFAULT 1.0,
  interrupt_handling BOOLEAN DEFAULT true,
  fallback_voice VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. integration_configurations
CREATE TABLE public.builder_integration_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE UNIQUE,
  crm_mapping JSONB DEFAULT '{}'::jsonb,
  calendar_mapping JSONB DEFAULT '{}'::jsonb,
  custom_webhooks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. business_variables
CREATE TABLE public.builder_business_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Operational Entities
CREATE TABLE public.builder_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE,
  tester_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'running',
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.builder_qa_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, revision_requested
  checklist JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.builder_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.builder_agent_versions(id) ON DELETE CASCADE,
  environment VARCHAR(50) NOT NULL,
  deployed_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'in_progress',
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.builder_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.builder_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builder_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_prompt_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_workflow_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_knowledge_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_voice_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_integration_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_business_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_qa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_change_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin Full Access Policy for builder tables
DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'builder_%'
  LOOP
    EXECUTE format('
      CREATE POLICY "Super admin full access on %I" 
      ON public.%I
      FOR ALL 
      TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid() 
          AND (auth.users.raw_user_meta_data->>''role'') = ''super_admin''
        )
      )', table_name, table_name);
  END LOOP;
END $$;
