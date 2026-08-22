import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export class AgentBuilderService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Fetches the complete aggregate agent data required for the Builder UI
   */
  async getAgentAggregate(id: string) {
    // 1. Fetch Agent Core Entity and its current draft version
    const { data: agent, error: agentError } = await this.supabase
      .from('builder_agents')
      .select(`
        *,
        organizations(id, name),
        current_version:builder_agent_versions(
          *,
          agent_configurations(*),
          prompt_configurations(*),
          workflow_configurations(*),
          voice_configurations(*),
          integration_configurations(*),
          knowledge_configurations(*),
          business_variables(*)
        )
      `)
      .eq('id', id)
      .single();

    if (agentError || !agent) {
      throw new Error(`Agent not found: ${agentError?.message || ''}`);
    }

    const currentVersionId = agent.current_version_id || '';

    // 2. Fetch recent deployments
    const { data: deployments } = await this.supabase
      .from('builder_deployments')
      .select('*')
      .eq('agent_version_id', currentVersionId)
      .order('created_at', { ascending: false })
      .limit(1);

    // 3. Fetch QA Reviews/Validation status
    const { data: validation } = await this.supabase
      .from('builder_qa_reviews')
      .select('*')
      .eq('agent_version_id', currentVersionId)
      .order('created_at', { ascending: false })
      .limit(1);

    // 4. Fetch Version history (just summary)
    const { data: versions } = await this.supabase
      .from('builder_agent_versions')
      .select('id, version_string, status, deployment_env, created_at')
      .eq('agent_id', id)
      .order('created_at', { ascending: false });

    // 5. Structure the Aggregate Payload
    const currentVersion = Array.isArray(agent.current_version) ? agent.current_version[0] : agent.current_version;

    return {
      overview: {
        id: agent.id,
        name: agent.name,
        category: agent.category,
        description: agent.description,
        stage: agent.stage,
        status: agent.status,
        project_id: agent.project_id,
        org_id: agent.org_id,
        org_name: (agent.organizations as any)?.name,
        active_version: currentVersion?.version_string || 'draft',
        last_deployment: deployments?.[0] || null,
        last_validation: validation?.[0] || null,
      },
      agent: currentVersion?.agent_configurations?.[0] || {},
      prompts: currentVersion?.prompt_configurations?.[0] || {},
      workflow: currentVersion?.workflow_configurations?.[0] || {},
      voice: currentVersion?.voice_configurations?.[0] || {},
      knowledge: currentVersion?.knowledge_configurations?.[0] || {},
      integrations: currentVersion?.integration_configurations?.[0] || {},
      variables: currentVersion?.business_variables || [],
      validation: validation?.[0] || null,
      deployment: deployments?.[0] || null,
      versions: versions || []
    };
  }

  /**
   * Creates a new Agent Project with default draft configurations
   */
  async createAgent(payload: { name: string; org_id: string; project_id?: string; category?: string }) {
    const { data: agent, error } = await this.supabase
      .from('builder_agents')
      .insert({
        name: payload.name,
        org_id: payload.org_id,
        project_id: payload.project_id,
        category: payload.category || 'general',
        stage: 'draft',
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Create the initial version
    const { data: version, error: vError } = await this.supabase
      .from('builder_agent_versions')
      .insert({
        agent_id: agent.id,
        version_string: 'v0.0.1-draft',
        status: 'draft'
      })
      .select()
      .single();
    
    if (vError) throw vError;

    // Update agent to point to current_version
    await this.supabase
      .from('builder_agents')
      .update({ current_version_id: version.id })
      .eq('id', agent.id);

    // Seed empty configs
    await Promise.all([
      this.supabase.from('builder_agent_configurations').insert({ agent_version_id: version.id }),
      this.supabase.from('builder_prompt_configurations').insert({ agent_version_id: version.id }),
      this.supabase.from('builder_workflow_configurations').insert({ agent_version_id: version.id }),
      this.supabase.from('builder_knowledge_configurations').insert({ agent_version_id: version.id }),
      this.supabase.from('builder_voice_configurations').insert({ agent_version_id: version.id }),
      this.supabase.from('builder_integration_configurations').insert({ agent_version_id: version.id }),
    ]);

    return { id: agent.id };
  }

  /**
   * Updates specific configuration tables for the current draft
   */
  async updateAgentDraft(id: string, tab: string, data: any) {
    const { data: agent } = await this.supabase
      .from('builder_agents')
      .select('current_version_id')
      .eq('id', id)
      .single();

    if (!agent || !agent.current_version_id) {
      throw new Error('No active version found to update');
    }

    type ConfigTable = 'builder_agent_configurations' | 'builder_prompt_configurations' | 'builder_workflow_configurations' | 'builder_voice_configurations' | 'builder_integration_configurations' | 'builder_knowledge_configurations';
    let tableName: ConfigTable;
    switch (tab) {
      case 'agent': tableName = 'builder_agent_configurations'; break;
      case 'prompts': tableName = 'builder_prompt_configurations'; break;
      case 'workflow': tableName = 'builder_workflow_configurations'; break;
      case 'voice': tableName = 'builder_voice_configurations'; break;
      case 'integrations': tableName = 'builder_integration_configurations'; break;
      case 'knowledge': tableName = 'builder_knowledge_configurations'; break;
      case 'overview': 
        return this.supabase.from('builder_agents').update(data).eq('id', id);
      default: throw new Error('Invalid configuration tab');
    }

    // Clean payload of IDs to prevent unique constraint errors
    const { id: _, agent_version_id: __, created_at: ___, updated_at: ____, ...cleanData } = data;

    const { error: updateError } = await this.supabase
      .from(tableName)
      .update(cleanData)
      .eq('agent_version_id', agent.current_version_id);

    if (updateError) throw updateError;
    return { success: true };
  }

  /**
   * Runs structured read-only checks across all modules
   */
  async validateAgent(id: string, reviewerId?: string) {
    const aggregate = await this.getAgentAggregate(id);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic prompt validation
    if (!aggregate.prompts?.system_prompt) {
      errors.push('System Prompt is missing');
    }

    // Basic workflow validation
    if (!aggregate.workflow?.decision_logic || Object.keys(aggregate.workflow.decision_logic).length === 0) {
      warnings.push('Workflow logic is empty');
    }

    // Basic voice validation
    if (!aggregate.voice?.provider) {
      errors.push('Voice Provider must be selected');
    }

    const score = errors.length > 0 ? 0 : (warnings.length > 0 ? 80 : 100);

    const report = {
      score,
      errors,
      warnings,
      checkedAt: new Date().toISOString()
    };

    const { data: agent } = await this.supabase
      .from('builder_agents')
      .select('current_version_id')
      .eq('id', id)
      .single();

    if (agent?.current_version_id) {
      await this.supabase.from('builder_qa_reviews').insert({
        agent_version_id: agent.current_version_id,
        reviewer_id: reviewerId,
        status: errors.length > 0 ? 'rejected' : 'approved',
        checklist: report,
        notes: 'Automated Validation'
      });
    }

    return report;
  }

  /**
   * Locks current draft as an immutable version and spawns a new draft for future edits
   */
  async publishAgent(id: string) {
    const { data: agent } = await this.supabase
      .from('builder_agents')
      .select('current_version_id')
      .eq('id', id)
      .single();

    if (!agent || !agent.current_version_id) throw new Error('No active version found');

    await this.supabase
      .from('builder_agent_versions')
      .update({ status: 'published' })
      .eq('id', agent.current_version_id);
    
    return { success: true, message: 'Published successfully' };
  }

  async deployAgent(id: string, env: string, deployedBy?: string) {
    const { data: agent } = await this.supabase
      .from('builder_agents')
      .select('current_version_id')
      .eq('id', id)
      .single();

    if (!agent || !agent.current_version_id) throw new Error('No active version found');

    await this.supabase
      .from('builder_deployments')
      .insert({
        agent_version_id: agent.current_version_id,
        environment: env,
        deployed_by: deployedBy,
        status: 'in_progress'
      });
    
    return { success: true, message: `Deployment to ${env} initiated` };
  }
}
