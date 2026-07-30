// =============================================================================
// KantaSwara — Email Preferences Manager
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type { EmailCategory } from '@prisma/client';

/** Categories that are always sent regardless of user preferences */
const MANDATORY_CATEGORIES: EmailCategory[] = ['AUTH', 'SECURITY'];

/** Maps email category to the preference field name */
const CATEGORY_TO_PREFERENCE: Partial<
  Record<EmailCategory, keyof PreferenceFields>
> = {
  BILLING: 'billingEmails',
  NOTIFICATION: 'systemNotifications',
  DELIVERY: 'projectNotifications',
  AI_BUILDER: 'projectNotifications',
  SUPPORT: 'supportEmails',
  EMPLOYEE: 'systemNotifications',
  ORGANIZATION: 'systemNotifications',
  DEMO: 'marketing',
};

interface PreferenceFields {
  marketing: boolean;
  systemNotifications: boolean;
  billingEmails: boolean;
  securityAlerts: boolean;
  projectNotifications: boolean;
  supportEmails: boolean;
  newsletter: boolean;
}

export class EmailPreferenceManager {
  /**
   * Check whether an email should be sent to this user.
   * Returns { allowed, reason }.
   */
  static async canSend(
    userId: string,
    category: EmailCategory,
    isMandatory: boolean = false
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Mandatory emails bypass all preferences
    if (isMandatory || MANDATORY_CATEGORIES.includes(category)) {
      return { allowed: true };
    }

    try {
      const pref = await prisma.emailPreference.findUnique({
        where: { userId },
      });

      // If no preferences set, default to allowed
      if (!pref) return { allowed: true };

      const prefField = CATEGORY_TO_PREFERENCE[category];
      if (!prefField) return { allowed: true };

      const isAllowed = Boolean(pref[prefField]);
      if (!isAllowed) {
        return {
          allowed: false,
          reason: `User has opted out of ${prefField} emails`,
        };
      }
    } catch {
      // On DB error, allow the email (fail open)
      console.error('[EmailPreferences] Failed to check preferences, allowing send');
    }

    return { allowed: true };
  }

  /**
   * Get or create preferences for a user.
   */
  static async getOrCreate(userId: string, organizationId?: string) {
    const existing = await prisma.emailPreference.findUnique({
      where: { userId },
    });

    if (existing) return existing;

    return prisma.emailPreference.create({
      data: { userId, organizationId },
    });
  }

  /**
   * Update a user's preferences.
   */
  static async update(
    userId: string,
    updates: Partial<PreferenceFields>,
    organizationId?: string
  ) {
    return prisma.emailPreference.upsert({
      where: { userId },
      create: { userId, organizationId, ...updates },
      update: updates,
    });
  }
}
