-- =============================================================================
-- KantaSwara — Profile Auto-Creation Trigger
-- Migration: 003_profile_trigger.sql
-- Run this in: Supabase Dashboard → SQL Editor (after 002_rls_policies.sql)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- handle_new_user()
--
-- Fired after a new row is inserted in auth.users (on registration).
-- 1. Creates the organization from user metadata
-- 2. Creates the profile linked to the organization
-- 3. Creates default org_settings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as postgres (bypasses RLS)
SET search_path = public
AS $$
DECLARE
  org_id     UUID;
  org_name   TEXT;
  org_slug   TEXT;
  base_slug  TEXT;
  slug_count INT;
BEGIN
  -- ── Extract metadata ──────────────────────────────────────────────────────
  org_name := COALESCE(
    NEW.raw_user_meta_data->>'organization_name',
    'My Organization'
  );

  -- Generate a URL-safe slug from the org name
  base_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 50);

  -- Ensure slug uniqueness
  org_slug := base_slug;
  slug_count := 1;
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = org_slug) LOOP
    org_slug := base_slug || '-' || slug_count;
    slug_count := slug_count + 1;
  END LOOP;

  -- ── Create Organization ───────────────────────────────────────────────────
  INSERT INTO public.organizations (name, slug, is_active)
  VALUES (org_name, org_slug, true)
  RETURNING id INTO org_id;

  -- ── Create Organization Settings (defaults) ───────────────────────────────
  INSERT INTO public.org_settings (organization_id)
  VALUES (org_id);

  -- ── Create User Profile ───────────────────────────────────────────────────
  INSERT INTO public.profiles (
    id,
    organization_id,
    full_name,
    email,
    role
  ) VALUES (
    NEW.id,
    org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'org_admin'  -- first user in an org is always the admin
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block auth user creation
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Attach to auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- handle_user_deleted()
--
-- Fired when a user is deleted from auth.users.
-- Soft-deletes the profile (we keep org and data intact).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    deleted_at = NOW(),
    is_active  = false,
    updated_at = NOW()
  WHERE id = OLD.id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();

-- ─────────────────────────────────────────────────────────────────────────────
-- update_profile_last_seen()
--
-- Called from the backend (service role) each time a user makes a request.
-- Avoids the overhead of updating on every request by using a 5-min cooldown.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_last_seen(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = NOW()
  WHERE id = user_id
    AND (last_seen_at IS NULL OR last_seen_at < NOW() - INTERVAL '5 minutes');
END;
$$;
