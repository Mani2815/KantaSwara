-- Enums
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'suspended');
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'open', 'paid', 'overdue', 'void', 'uncollectible');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'partially_paid', 'overdue', 'refunded');
CREATE TYPE "QuotationStatus" AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired', 'invoiced');
CREATE TYPE "ServiceStatus" AS ENUM ('pending', 'in_progress', 'delivered');

-- Alter organizations
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" TEXT;

-- Subscription Plans
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_monthly" DECIMAL(65,30) NOT NULL,
    "max_agents" INTEGER NOT NULL,
    "included_minutes" INTEGER NOT NULL,
    "max_team_members" INTEGER NOT NULL,
    "storage_limit_gb" INTEGER NOT NULL,
    "api_rate_limit" INTEGER NOT NULL,
    "support_level" TEXT NOT NULL,
    "overage_rate_per_min" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- Organization Subscriptions
CREATE TABLE "organization_subscriptions" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "renewal_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_subscriptions_organization_id_key" ON "organization_subscriptions"("organization_id");
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "billing_period_start" TIMESTAMP(3),
    "billing_period_end" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL,
    "tax_total" DECIMAL(65,30) NOT NULL,
    "discount_total" DECIMAL(65,30) NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE INDEX "invoices_organization_id_idx" ON "invoices"("organization_id");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Invoice Items
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Quotations
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "requested_service" TEXT NOT NULL,
    "estimated_cost" DECIMAL(65,30) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'draft',
    "invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "quotations_organization_id_idx" ON "quotations"("organization_id");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Professional Services
CREATE TABLE "professional_services" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_services_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "professional_services_organization_id_idx" ON "professional_services"("organization_id");
ALTER TABLE "professional_services" ADD CONSTRAINT "professional_services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Voice Usages
CREATE TABLE "voice_usages" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "agent_id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "stt_usage" INTEGER,
    "tts_usage" INTEGER,
    "llm_tokens" INTEGER,
    "provider_cost" DECIMAL(65,30),
    "billed_to_customer" DECIMAL(65,30),
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_usages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "voice_usages_organization_id_timestamp_idx" ON "voice_usages"("organization_id", "timestamp");
ALTER TABLE "voice_usages" ADD CONSTRAINT "voice_usages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Usage Reports
CREATE TABLE "usage_reports" (
    "id" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "billing_period_start" TIMESTAMP(3) NOT NULL,
    "billing_period_end" TIMESTAMP(3) NOT NULL,
    "total_minutes" INTEGER NOT NULL,
    "included_minutes" INTEGER NOT NULL,
    "overage_minutes" INTEGER NOT NULL,
    "overage_charge" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "usage_reports_organization_id_billing_period_start_idx" ON "usage_reports"("organization_id", "billing_period_start");
ALTER TABLE "usage_reports" ADD CONSTRAINT "usage_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
