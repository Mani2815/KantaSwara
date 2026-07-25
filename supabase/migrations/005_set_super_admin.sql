-- =============================================================================
-- Promote user to org_admin
-- Run in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- Step 1: Confirm the user exists in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'smartcitycms@gmail.com';

-- Step 2: If the user exists and has a profile, promote to org_admin
UPDATE public.profiles
SET role = 'org_admin', updated_at = NOW()
WHERE email = 'smartcitycms@gmail.com';

-- Step 3: Confirm the change
SELECT p.id, p.email, p.full_name, p.role, p.organization_id, o.name AS org_name
FROM public.profiles p
JOIN public.organizations o ON o.id = p.organization_id
WHERE p.email = 'smartcitycms@gmail.com';
