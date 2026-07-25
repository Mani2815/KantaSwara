-- File: supabase/migrations/20260724000002_billing_enhancement.sql

-- Sequences for invoice/quotation numbers
CREATE SEQUENCE IF NOT EXISTS quotation_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT AS $$
  SELECT 'QT-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('quotation_number_seq')::TEXT, 4, '0');
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
  SELECT 'INV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
$$ LANGUAGE sql;

-- Enums (already handled by Prisma migrate, but good practice to explicitly create if doing pure raw SQL)
-- NOTE: Prisma migrate dev will handle table creations automatically.
-- We are just creating the sequences and default data here.

-- Insert Default Tax Configuration (GST 18%)
-- We use DO block to prevent errors if running multiple times
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "tax_configurations" WHERE "name" = 'GST 18%') THEN
        INSERT INTO "tax_configurations" ("id", "name", "rate", "description", "is_default", "is_active", "created_at", "updated_at")
        VALUES (gen_random_uuid(), 'GST 18%', 0.18, 'Standard GST rate for B2B SaaS', TRUE, TRUE, NOW(), NOW());
    END IF;
END $$;
