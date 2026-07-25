-- =============================================================================
-- KantaSwara — Fix Profile Auto-Creation Trigger
-- Migration: 007_fix_superadmin_trigger.sql
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id     UUID;
  org_name   TEXT;
  org_slug   TEXT;
  base_slug  TEXT;
  slug_count INT;
BEGIN
  -- ── Special Interception for Super Admin ────────────────────────────────────
  -- When the Super Admin logs in with Google, do NOT create a random new org.
  -- Instead, assign them strictly to KantaSwara HQ as a super_admin.
  IF NEW.email = 'smartcitycms@gmail.com' THEN
    
    -- Find KantaSwara HQ
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'kantaswara-hq' LIMIT 1;
    
    -- If it doesn't exist, create it
    IF org_id IS NULL THEN
      INSERT INTO public.organizations (name, slug, is_active)
      VALUES ('KantaSwara HQ', 'kantaswara-hq', true)
      RETURNING id INTO org_id;
      
      INSERT INTO public.org_settings (organization_id) VALUES (org_id);
    END IF;

    -- Create super_admin profile
    INSERT INTO public.profiles (
      id, organization_id, full_name, email, role
    ) VALUES (
      NEW.id, org_id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Smart City CMS'), NEW.email, 'super_admin'
    );
    
    RETURN NEW;
  END IF;

  -- ── Standard Organization Creation for Normal Users ───────────────────────
  org_name := NEW.raw_user_meta_data->>'organization_name';
  
  -- If there's no organization name provided (e.g., Google OAuth signups),
  -- skip creating the organization and profile. They will configure it later.
  IF org_name IS NULL OR trim(org_name) = '' THEN
    RETURN NEW;
  END IF;

  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);

  org_slug := base_slug;
  slug_count := 1;
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) LOOP
    org_slug := base_slug || '-' || slug_count;
    slug_count := slug_count + 1;
  END LOOP;

  INSERT INTO public.organizations (name, slug, is_active)
  VALUES (org_name, org_slug, false)
  RETURNING id INTO org_id;

  INSERT INTO public.org_settings (organization_id)
  VALUES (org_id);

  INSERT INTO public.profiles (
    id, organization_id, full_name, email, role
  ) VALUES (
    NEW.id, org_id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.email, 'org_admin'
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
