/**
 * Supabase Database Types
 *
 * This file is the hand-authored initial version.
 * Once your Supabase project is live, REPLACE this file with:
 *
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/supabase/types.ts
 *
 * Or use the Supabase CLI local dev:
 *   npx supabase gen types typescript --local > src/lib/supabase/types.ts
 */

export type UserRole =
  | 'super_admin'
  | 'org_admin'
  | 'manager'
  | 'agent'
  | 'viewer'
  | 'solutions_admin';

export type AgentStatus = 'active' | 'inactive' | 'draft' | 'error';
export type WorkflowStatus = 'draft' | 'published' | 'archived';
export type CallDirection = 'inbound' | 'outbound';
export type CallOutcome =
  | 'completed'
  | 'transferred'
  | 'voicemail'
  | 'abandoned'
  | 'failed';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost';

export interface Database {
  public: {
    Tables: {

      org_settings: {
        Row: {
          id: string;
          organization_id: string;
          business_domain?: string;
          country?: string;
          business_hours?: string;
          branding?: any;
          timezone?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          business_domain?: string;
          country?: string;
          business_hours?: string;
          branding?: any;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          business_domain?: string;
          country?: string;
          business_hours?: string;
          branding?: any;
          timezone?: string;
          created_at?: string;
        };
        Relationships: any[];
      };


      agent_projects: {
        Row: {
          id: string;
          request_id: string;
          organization_id: string;
          status: string;
          completion_pct: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          organization_id: string;
          status?: string;
          completion_pct?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          organization_id?: string;
          status?: string;
          completion_pct?: number;
          created_at?: string;
        };
        Relationships: any[];
      };
      agent_requests: {
        Row: {
          id: string;
          organization_id: string;
          domain: string;
          priority: string;
          requirements?: any;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          domain: string;
          priority?: string;
          requirements?: any;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          domain?: string;
          priority?: string;
          requirements?: any;
          status?: string;
          created_at?: string;
        };
        Relationships: any[];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: string;
          max_agents: number;
          max_concurrent_calls: number;
          status: string;
          approval_status: string;
          approved_at: string | null;
          activation_date: string | null;
          approved_by: string | null;
          rejected_at: string | null;
          rejection_reason: string | null;
          settings: Record<string, unknown>;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: string;
          max_agents?: number;
          max_concurrent_calls?: number;
          status?: string;
          approval_status?: string;
          approved_at?: string | null;
          activation_date?: string | null;
          approved_by?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          settings?: Record<string, unknown>;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: string;
          max_agents?: number;
          max_concurrent_calls?: number;
          status?: string;
          approval_status?: string;
          approved_at?: string | null;
          activation_date?: string | null;
          approved_by?: string | null;
          rejected_at?: string | null;
          rejection_reason?: string | null;
          settings?: Record<string, unknown>;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          role: UserRole;
          phone: string | null;
          is_active: boolean;
          last_seen_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          is_active?: boolean;
          last_seen_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          is_active?: boolean;
          last_seen_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      agents: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          status: AgentStatus;
          workflow_id: string | null;
          voice_config: Record<string, unknown>;
          greeting: string;
          system_prompt: string;
          knowledge_base_ids: string[];
          active_calls: number;
          total_calls: number;
          avg_call_duration: number;
          success_rate: number;
          deployed_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: AgentStatus;
          workflow_id?: string | null;
          voice_config?: Record<string, unknown>;
          greeting?: string;
          system_prompt?: string;
          knowledge_base_ids?: string[];
          active_calls?: number;
          total_calls?: number;
          avg_call_duration?: number;
          success_rate?: number;
          deployed_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: AgentStatus;
          workflow_id?: string | null;
          voice_config?: Record<string, unknown>;
          greeting?: string;
          system_prompt?: string;
          knowledge_base_ids?: string[];
          active_calls?: number;
          total_calls?: number;
          avg_call_duration?: number;
          success_rate?: number;
          deployed_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      workflows: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          status: WorkflowStatus;
          contract: Record<string, unknown>;
          version: number;
          last_published_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: WorkflowStatus;
          contract?: Record<string, unknown>;
          version?: number;
          last_published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          status?: WorkflowStatus;
          contract?: Record<string, unknown>;
          version?: number;
          last_published_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      knowledge_bases: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          document_count: number;
          total_size_bytes: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          document_count?: number;
          total_size_bytes?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          document_count?: number;
          total_size_bytes?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      crm_leads: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          phone: string;
          email: string | null;
          status: LeadStatus;
          source: string | null;
          notes: string | null;
          metadata: Record<string, unknown>;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          status?: LeadStatus;
          source?: string | null;
          notes?: string | null;
          metadata?: Record<string, unknown>;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          status?: LeadStatus;
          source?: string | null;
          notes?: string | null;
          metadata?: Record<string, unknown>;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          agent_id: string;
          lead_id: string | null;
          direction: CallDirection;
          caller_number: string;
          caller_name: string | null;
          status: string;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          transcript: Record<string, unknown>[];
          sentiment: string | null;
          outcome: CallOutcome | null;
          recording_url: string | null;
          metadata: Record<string, unknown>;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          agent_id?: string;
          lead_id?: string | null;
          direction?: CallDirection;
          caller_number?: string;
          caller_name?: string | null;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          transcript?: Record<string, unknown>[];
          sentiment?: string | null;
          outcome?: CallOutcome | null;
          recording_url?: string | null;
          metadata?: Record<string, unknown>;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          agent_id?: string;
          lead_id?: string | null;
          direction?: CallDirection;
          caller_number?: string;
          caller_name?: string | null;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          transcript?: Record<string, unknown>[];
          sentiment?: string | null;
          outcome?: CallOutcome | null;
          recording_url?: string | null;
          metadata?: Record<string, unknown>;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      analytics: {
        Row: {
          id: string;
          organization_id: string;
          agent_id: string | null;
          date: string;
          total_calls: number;
          answered_calls: number;
          avg_duration_seconds: number;
          success_rate: number;
          sentiment_positive: number;
          sentiment_neutral: number;
          sentiment_negative: number;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          agent_id?: string | null;
          date?: string;
          total_calls?: number;
          answered_calls?: number;
          avg_duration_seconds?: number;
          success_rate?: number;
          sentiment_positive?: number;
          sentiment_neutral?: number;
          sentiment_negative?: number;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          agent_id?: string | null;
          date?: string;
          total_calls?: number;
          answered_calls?: number;
          avg_duration_seconds?: number;
          success_rate?: number;
          sentiment_positive?: number;
          sentiment_neutral?: number;
          sentiment_negative?: number;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: any[];
      }
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: any[];
      }
      builder_agents: {
        Row: {
          id: string;
          org_id: string | null;
          project_id: string | null;
          name: string;
          category: string | null;
          description: string | null;
          stage: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          current_version_id: string | null;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          project_id?: string | null;
          name?: string;
          category?: string | null;
          description?: string | null;
          stage?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          current_version_id?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          project_id?: string | null;
          name?: string;
          category?: string | null;
          description?: string | null;
          stage?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          current_version_id?: string | null;
        };
        Relationships: any[];
      }
      builder_agent_versions: {
        Row: {
          id: string;
          agent_id: string | null;
          version_string: string;
          deployment_env: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_id?: string | null;
          version_string?: string;
          deployment_env?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_id?: string | null;
          version_string?: string;
          deployment_env?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_agent_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          language: string | null;
          supported_languages: unknown | null;
          timezone: string | null;
          business_hours: unknown | null;
          welcome_message: string | null;
          fallback_behavior: string | null;
          escalation_behavior: string | null;
          call_timeout_seconds: number | null;
          max_conversation_duration: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          language?: string | null;
          supported_languages?: unknown | null;
          timezone?: string | null;
          business_hours?: unknown | null;
          welcome_message?: string | null;
          fallback_behavior?: string | null;
          escalation_behavior?: string | null;
          call_timeout_seconds?: number | null;
          max_conversation_duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          language?: string | null;
          supported_languages?: unknown | null;
          timezone?: string | null;
          business_hours?: unknown | null;
          welcome_message?: string | null;
          fallback_behavior?: string | null;
          escalation_behavior?: string | null;
          call_timeout_seconds?: number | null;
          max_conversation_duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_prompt_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          system_prompt: string | null;
          greeting_prompt: string | null;
          conversation_prompt: string | null;
          qualification_prompt: string | null;
          knowledge_retrieval_prompt: string | null;
          booking_prompt: string | null;
          escalation_prompt: string | null;
          closing_prompt: string | null;
          fallback_prompt: string | null;
          error_handling_prompt: string | null;
          variables: unknown | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          system_prompt?: string | null;
          greeting_prompt?: string | null;
          conversation_prompt?: string | null;
          qualification_prompt?: string | null;
          knowledge_retrieval_prompt?: string | null;
          booking_prompt?: string | null;
          escalation_prompt?: string | null;
          closing_prompt?: string | null;
          fallback_prompt?: string | null;
          error_handling_prompt?: string | null;
          variables?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          system_prompt?: string | null;
          greeting_prompt?: string | null;
          conversation_prompt?: string | null;
          qualification_prompt?: string | null;
          knowledge_retrieval_prompt?: string | null;
          booking_prompt?: string | null;
          escalation_prompt?: string | null;
          closing_prompt?: string | null;
          fallback_prompt?: string | null;
          error_handling_prompt?: string | null;
          variables?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_workflow_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          decision_logic: unknown | null;
          intent_routing: unknown | null;
          webhooks: unknown | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          decision_logic?: unknown | null;
          intent_routing?: unknown | null;
          webhooks?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          decision_logic?: unknown | null;
          intent_routing?: unknown | null;
          webhooks?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_knowledge_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          attached_documents: unknown | null;
          crawled_urls: unknown | null;
          processing_status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          attached_documents?: unknown | null;
          crawled_urls?: unknown | null;
          processing_status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          attached_documents?: unknown | null;
          crawled_urls?: unknown | null;
          processing_status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_voice_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          provider: string | null;
          model: string | null;
          accent: string | null;
          speaking_style: string | null;
          speed: number | null;
          pitch: number | null;
          interrupt_handling: boolean | null;
          fallback_voice: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          provider?: string | null;
          model?: string | null;
          accent?: string | null;
          speaking_style?: string | null;
          speed?: number | null;
          pitch?: number | null;
          interrupt_handling?: boolean | null;
          fallback_voice?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          provider?: string | null;
          model?: string | null;
          accent?: string | null;
          speaking_style?: string | null;
          speed?: number | null;
          pitch?: number | null;
          interrupt_handling?: boolean | null;
          fallback_voice?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_integration_configurations: {
        Row: {
          id: string;
          agent_version_id: string | null;
          crm_mapping: unknown | null;
          calendar_mapping: unknown | null;
          custom_webhooks: unknown | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          crm_mapping?: unknown | null;
          calendar_mapping?: unknown | null;
          custom_webhooks?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          crm_mapping?: unknown | null;
          calendar_mapping?: unknown | null;
          custom_webhooks?: unknown | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_business_variables: {
        Row: {
          id: string;
          agent_version_id: string | null;
          key: string;
          value: string;
          type: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          key?: string;
          value?: string;
          type?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          key?: string;
          value?: string;
          type?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_test_runs: {
        Row: {
          id: string;
          agent_version_id: string | null;
          tester_id: string | null;
          status: string | null;
          results: unknown | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          tester_id?: string | null;
          status?: string | null;
          results?: unknown | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          tester_id?: string | null;
          status?: string | null;
          results?: unknown | null;
          created_at?: string | null;
        };
        Relationships: any[];
      }
      builder_qa_reviews: {
        Row: {
          id: string;
          agent_version_id: string | null;
          reviewer_id: string | null;
          status: string | null;
          checklist: unknown | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          reviewer_id?: string | null;
          status?: string | null;
          checklist?: unknown | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          reviewer_id?: string | null;
          status?: string | null;
          checklist?: unknown | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      }
      builder_deployments: {
        Row: {
          id: string;
          agent_version_id: string | null;
          environment: string;
          deployed_by: string | null;
          status: string | null;
          logs: unknown | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          agent_version_id?: string | null;
          environment?: string;
          deployed_by?: string | null;
          status?: string | null;
          logs?: unknown | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          agent_version_id?: string | null;
          environment?: string;
          deployed_by?: string | null;
          status?: string | null;
          logs?: unknown | null;
          created_at?: string | null;
        };
        Relationships: any[];
      }
      builder_change_logs: {
        Row: {
          id: string;
          agent_id: string | null;
          user_id: string | null;
          action: string;
          entity: string;
          old_value: unknown | null;
          new_value: unknown | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          agent_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity?: string;
          old_value?: unknown | null;
          new_value?: unknown | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          agent_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity?: string;
          old_value?: unknown | null;
          new_value?: unknown | null;
          created_at?: string | null;
        };
        Relationships: any[];
      }
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      get_user_organization: {
        Args: { user_id: string };
        Returns: string;
      };
      is_org_admin: {
        Args: { org_id: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };

    Enums: {
      user_role: UserRole;
      agent_status: AgentStatus;
      workflow_status: WorkflowStatus;
      call_direction: CallDirection;
      call_outcome: CallOutcome;
      lead_status: LeadStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
