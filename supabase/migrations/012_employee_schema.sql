-- =============================================================================
-- KantaSwara — Console Employees and Audit Logs Schema
-- Migration: 012_employee_schema.sql
-- =============================================================================

-- Create Enums if they do not exist
DO $$ BEGIN
  CREATE TYPE "EmployeeRole" AS ENUM (
    'SUPER_ADMIN', 'AI_SOLUTIONS_ADMIN', 'SUPPORT_ADMIN', 'FINANCE_ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "EmployeeDepartment" AS ENUM (
    'ENGINEERING', 'SUPPORT', 'SALES', 'LEADERSHIP', 'FINANCE', 'OPERATIONS'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "EmployeeStatus" AS ENUM (
    'ACTIVE', 'INACTIVE', 'SUSPENDED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  role              "EmployeeRole" NOT NULL,
  department        "EmployeeDepartment" NOT NULL,
  status            "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  invitation_status TEXT,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Employee Invitations Table
CREATE TABLE IF NOT EXISTS public.employee_invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  full_name  TEXT NOT NULL,
  department "EmployeeDepartment" NOT NULL,
  role       "EmployeeRole" NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  notes      TEXT,
  invited_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Employee Audit Logs Table
CREATE TABLE IF NOT EXISTS public.employee_audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  action         TEXT NOT NULL,
  ip_address     TEXT,
  user_agent     TEXT,
  target_id      TEXT,
  previous_value JSONB,
  new_value      JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees (email);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_token ON public.employee_invitations (token);
CREATE INDEX IF NOT EXISTS idx_employee_audit_logs_emp_created ON public.employee_audit_logs (employee_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check super admin is already defined as: auth.is_super_admin()
-- Let's define policies

-- Employees Policies
CREATE POLICY "Super Admins have full access to employees" 
  ON public.employees FOR ALL USING (auth.is_super_admin());

CREATE POLICY "Employees can view their own profile" 
  ON public.employees FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Employee Invitations Policies
CREATE POLICY "Super Admins have full access to employee_invitations" 
  ON public.employee_invitations FOR ALL USING (auth.is_super_admin());

-- Employee Audit Logs Policies
CREATE POLICY "Super Admins have full access to employee_audit_logs" 
  ON public.employee_audit_logs FOR ALL USING (auth.is_super_admin());
