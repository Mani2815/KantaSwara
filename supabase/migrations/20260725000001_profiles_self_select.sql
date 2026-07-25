-- Allow users to always read their own profile row regardless of JWT claims.
-- This is needed for the middleware DB fallback that looks up org status
-- when the JWT hook has not yet populated organization_id in app_metadata.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_self'
  ) THEN
    CREATE POLICY profiles_select_self ON public.profiles
      FOR SELECT USING (id = auth.uid());
  END IF;
END $$;
