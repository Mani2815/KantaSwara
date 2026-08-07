-- =============================================================================
-- KantaSwara — Migration: Fix Email System Schema (updated_at defaults + seed)
-- =============================================================================
-- Purpose : Fix the updated_at column defaults on email tables (they were
--           created without a default because the previous migration ran
--           partially). Add the NOW() default so the seed INSERT works.
--           Then seed the email_templates table.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Fix updated_at defaults on all email tables
--    The column exists (NOT NULL) but has no DEFAULT — set it to NOW().
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.email_logs
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.email_templates
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.email_preferences
  ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE public.email_queue
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Also fix id defaults — Prisma generates UUID in app layer but we want DB defaults
-- for direct SQL inserts
ALTER TABLE public.email_logs
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.email_templates
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.email_preferences
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.email_queue
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SEED — Register all templates from templateRegistry.ts
--    ON CONFLICT DO NOTHING makes this idempotent.
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
  ('org-registration-submitted','Registration Submitted',       'Confirms registration is under review',        'ORGANIZATION', 'Your KantaSwara registration is under review',         true, true,  'ACTIVE'),
  ('org-admin-new-registration','New Registration (Admin)',     'Notifies admin of new org registration',       'ORGANIZATION', 'New organization registration requires review',         true, true,  'ACTIVE'),
  ('org-approved',              'Organization Approved',        'Sent when org is approved',                    'ORGANIZATION', 'Your KantaSwara account has been approved!',           true, true,  'ACTIVE'),
  ('org-rejected',              'Organization Rejected',        'Sent when org registration is rejected',       'ORGANIZATION', 'Update on your KantaSwara application',                true, true,  'ACTIVE'),
  ('org-suspended',             'Organization Suspended',       'Sent when org is suspended',                   'ORGANIZATION', 'Your KantaSwara account has been suspended',           true, true,  'ACTIVE'),
  -- Billing templates
  ('billing-subscription-created',  'Subscription Created',    'Sent when subscription starts',                'BILLING',      'Your KantaSwara subscription is active',               true, false, 'ACTIVE'),
  ('billing-invoice-generated',     'Invoice Generated',        'Sent with new invoice',                        'BILLING',      'Invoice {{invoiceNumber}} from KantaSwara',            true, false, 'ACTIVE'),
  ('billing-payment-failed',        'Payment Failed',           'Sent when payment fails',                      'BILLING',      'Action required: Payment failed for KantaSwara',      true, false, 'ACTIVE'),
  ('billing-payment-successful',    'Payment Successful',       'Sent on successful payment',                   'BILLING',      'Payment received — Thank you!',                        true, false, 'ACTIVE'),
  ('billing-subscription-expiring', 'Subscription Expiring',   'Sent before subscription expires',             'BILLING',      'Your KantaSwara subscription is expiring soon',        true, false, 'ACTIVE'),
  ('billing-trial-ending',          'Trial Ending',             'Sent before trial ends',                       'BILLING',      'Your KantaSwara trial ends in {{daysRemaining}} days', true, false, 'ACTIVE'),
  -- Delivery templates
  ('delivery-project-assigned',     'Project Assigned',         'Internal — project assigned to team member',  'DELIVERY',     'New project assigned: {{projectName}}',                true, false, 'ACTIVE'),
  ('delivery-deployment-complete',  'Deployment Complete',      'Sent when agent deployment is done',          'DELIVERY',     'Your AI agent {{agentName}} is deployed!',             true, false, 'ACTIVE'),
  ('delivery-deployment-failed',    'Deployment Failed',        'Sent when agent deployment fails',            'DELIVERY',     'Deployment failed for {{agentName}}',                  true, false, 'ACTIVE'),
  ('delivery-qa-approved',          'QA Approved',              'Sent when QA passes',                         'DELIVERY',     '{{agentName}} passed QA review',                       true, false, 'ACTIVE'),
  -- AI Builder templates
  ('builder-draft-saved',           'Draft Saved',              'Confirms agent draft was saved',              'AI_BUILDER',   'Your agent draft has been saved',                      true, false, 'ACTIVE'),
  ('builder-validation-passed',     'Validation Passed',        'Agent passed validation',                     'AI_BUILDER',   '{{agentName}} passed validation',                      true, false, 'ACTIVE'),
  ('builder-validation-failed',     'Validation Failed',        'Agent failed validation',                     'AI_BUILDER',   'Validation failed for {{agentName}}',                  true, false, 'ACTIVE'),
  ('builder-published',             'Agent Published',          'Confirms agent was published',                'AI_BUILDER',   '{{agentName}} is now published',                       true, false, 'ACTIVE'),
  ('builder-deployment-started',    'Deployment Started',       'Deployment has begun',                        'AI_BUILDER',   'Deploying {{agentName}} to {{environment}}',            true, false, 'ACTIVE'),
  ('builder-rollback-complete',     'Rollback Complete',        'Agent rolled back to previous version',       'AI_BUILDER',   '{{agentName}} rolled back to version {{version}}',     true, false, 'ACTIVE'),
  -- Support templates
  ('support-ticket-created',        'Ticket Created',           'Confirms support ticket creation',            'SUPPORT',      'Support ticket #{{ticketId}} received',                true, false, 'ACTIVE'),
  ('support-ticket-assigned',       'Ticket Assigned',          'Notifies agent of ticket assignment',         'SUPPORT',      'Ticket #{{ticketId}} assigned to you',                 true, false, 'ACTIVE'),
  ('support-ticket-updated',        'Ticket Updated',           'Update on support ticket',                    'SUPPORT',      'Update on ticket #{{ticketId}}',                       true, false, 'ACTIVE'),
  ('support-ticket-closed',         'Ticket Closed',            'Ticket closure notification',                 'SUPPORT',      'Your ticket #{{ticketId}} has been resolved',          true, false, 'ACTIVE'),
  ('support-customer-reply',        'Customer Reply',           'Notifies agent of customer reply',            'SUPPORT',      'Customer replied to ticket #{{ticketId}}',             true, false, 'ACTIVE'),
  ('support-internal-reply',        'Internal Reply',           'Notifies customer of agent reply',            'SUPPORT',      'New reply on your ticket #{{ticketId}}',               true, false, 'ACTIVE'),
  -- Demo templates
  ('demo-completed',                'Demo Completed',           'Follow-up after voice demo session',          'DEMO',         'Thanks for trying KantaSwara!',                        true, false, 'ACTIVE'),
  ('demo-contact-sales',            'Contact Sales',            'Connects prospect with sales team',           'DEMO',         'Our team will be in touch soon',                       true, false, 'ACTIVE'),
  ('demo-meeting-confirmed',        'Meeting Confirmed',        'Confirms scheduled demo meeting',             'DEMO',         'Your KantaSwara demo is confirmed',                    true, false, 'ACTIVE'),
  ('demo-trial-invitation',         'Trial Invitation',         'Invites prospect to start a trial',           'DEMO',         'Start your KantaSwara trial today',                    true, false, 'ACTIVE'),
  -- Security templates
  ('security-suspicious-login',     'Suspicious Login',         'Alert for suspicious login activity',         'SECURITY',     'Suspicious sign-in detected on your account',          true, true,  'ACTIVE'),
  ('security-api-key-created',      'API Key Created',          'Confirms new API key was created',            'SECURITY',     'New API key created for your account',                 true, false, 'ACTIVE'),
  ('security-api-key-revoked',      'API Key Revoked',          'Confirms API key was revoked',                'SECURITY',     'API key revoked for your account',                     true, false, 'ACTIVE'),
  ('security-mfa-enabled',          'MFA Enabled',              'Confirms MFA was enabled',                    'SECURITY',     'Two-factor authentication enabled',                    true, false, 'ACTIVE'),
  ('security-mfa-disabled',         'MFA Disabled',             'Confirms MFA was disabled',                   'SECURITY',     'Two-factor authentication disabled',                   true, true,  'ACTIVE')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- END OF MIGRATION: Fix Email System Schema
-- ─────────────────────────────────────────────────────────────────────────────
