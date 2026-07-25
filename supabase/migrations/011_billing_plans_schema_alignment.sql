-- =============================================================================
-- KantaSwara — Align subscription_plans Table with Prisma Schema
-- Migration: 011_billing_plans_schema_alignment.sql
-- =============================================================================

ALTER TABLE public.subscription_plans 
  ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS implementation_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS has_sla BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_dedicated_infra BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_white_label BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Populate display_name with the value of name for existing rows
UPDATE public.subscription_plans 
SET display_name = name 
WHERE display_name = '';
