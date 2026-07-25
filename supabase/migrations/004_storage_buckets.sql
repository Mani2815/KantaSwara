-- =============================================================================
-- KantaSwara — Storage Buckets & Policies
-- Migration: 004_storage_buckets.sql
-- Run this in: Supabase Dashboard → SQL Editor (after 003_profile_trigger.sql)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Create Storage Buckets
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTE: Supabase creates the storage schema automatically.
-- These inserts create the bucket configurations.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- User avatars — public read (for displaying in UI)
  (
    'avatars',
    'avatars',
    true,
    2097152,  -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  -- Knowledge base documents — private
  (
    'knowledge-base',
    'knowledge-base',
    false,
    104857600,  -- 100 MB
    ARRAY[
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/markdown'
    ]
  ),
  -- Call recordings — private
  (
    'recordings',
    'recordings',
    false,
    524288000,  -- 500 MB
    ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4']
  ),
  -- General documents — private
  (
    'documents',
    'documents',
    false,
    52428800,  -- 50 MB
    ARRAY[
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- AVATARS — Public read, authenticated write
-- ─────────────────────────────────────────────────────────────────────────────

-- Anyone can view avatars (they're public)
CREATE POLICY "avatars_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload to their own avatar folder
-- Path convention: avatars/{user_id}/{filename}
CREATE POLICY "avatars_user_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Users can update/delete their own avatar
CREATE POLICY "avatars_user_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- KNOWLEDGE BASE — Org-scoped access
-- Path convention: knowledge-base/{org_id}/{kb_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "kb_select_own_org"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'knowledge-base'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
  );

CREATE POLICY "kb_insert_manager"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'knowledge-base'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
    AND public.has_min_role('manager')
  );

CREATE POLICY "kb_delete_manager"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'knowledge-base'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
    AND public.has_min_role('manager')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- RECORDINGS — Org-scoped, read-only for users (written by backend)
-- Path convention: recordings/{org_id}/{conversation_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "recordings_select_own_org"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
  );

-- Recordings are written by the backend (service role bypasses RLS)
-- No INSERT/UPDATE/DELETE policies for authenticated users

-- ─────────────────────────────────────────────────────────────────────────────
-- DOCUMENTS — Org-scoped
-- Path convention: documents/{org_id}/{filename}
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "documents_select_own_org"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
  );

CREATE POLICY "documents_insert_manager"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
    AND public.has_min_role('manager')
  );

CREATE POLICY "documents_delete_admin"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.get_user_organization_id()::TEXT
    AND public.is_org_admin()
  );
