'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building, Save, Loader2, Briefcase } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/hooks/useAuth';

export default function OrganizationPage() {
  const { organization, isLoading, updateOrganization } = useOrganization();
  const { refreshProfile } = useAuth();
  const settings = (organization?.settings ?? {}) as any;
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization?.name) {
      setName(organization.name);
    }
  }, [organization]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateOrganization({ name: name.trim() });
      await refreshProfile();
      toast.success('Organization updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update organization');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Organization</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your company details and preferences.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border-default)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] flex items-center justify-center">
            <Building className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Organization Details</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Update your company information.</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="orgName" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Organization Name
              </label>
              <input
                id="orgName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                className="w-full px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Slug (URL Identifier)
              </label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {organization?.slug || 'kantaswara-hq'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Current Plan
              </label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed capitalize">
                {organization?.plan || 'Free'} Plan
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Plan upgrades are managed via the billing dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Max Agents
                </label>
                <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                  {organization?.max_agents ?? 0}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Max Concurrent Calls
                </label>
                <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                  {organization?.max_concurrent_calls ?? 0}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Account Status
                </label>
                <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                  {organization?.is_active ? (
                    <span className="text-emerald-500 font-medium">Active</span>
                  ) : (
                    <span className="text-red-500 font-medium">Inactive</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                  Created At
                </label>
                <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                  {organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !name.trim() || name.trim() === organization?.name}
                className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-text-disabled)] text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-[var(--color-border-default)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Business Profile</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Information provided during onboarding.</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Business Domain</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.business_domain || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Company Website</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed truncate" title={settings?.business_profile?.company_website}>
                {settings?.business_profile?.company_website || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Contact Number</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.business_contact_number || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Location</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {[settings?.business_profile?.city, settings?.business_profile?.state_province, settings?.business_profile?.country].filter(Boolean).join(', ') || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Timezone</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.timezone || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Company Size</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.company_size || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Monthly Call Volume</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.monthly_call_volume || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Primary Use Case</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed">
                {settings?.business_profile?.primary_use_case || 'N/A'}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Business Description</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed min-h-[5rem]">
                {settings?.business_profile?.business_description || 'N/A'}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Additional Requirements</label>
              <div className="px-4 py-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl text-[var(--color-text-secondary)] bg-opacity-50 cursor-not-allowed min-h-[5rem]">
                {settings?.business_profile?.additional_requirements || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
