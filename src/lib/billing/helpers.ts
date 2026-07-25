/**
 * KantaSwara — Billing Helpers
 * Shared utilities for invoice/quotation number generation, tax calculation, and pro-rata.
 */
import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Number Generation
// ─────────────────────────────────────────────────────────────────────────────

/** Generates a unique, sequential invoice number: INV-YYYY-NNNN */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `INV-${year}-${seq}`;
}

/** Generates a unique, sequential quotation number: QT-YYYY-NNNN */
export async function generateQuotationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count({
    where: { quotationNumber: { startsWith: `QT-${year}-` } },
  });
  const seq = String(count + 1).padStart(4, '0');
  return `QT-${year}-${seq}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax Calculation
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the default tax rate (e.g., 0.18 for GST 18%) */
export async function getDefaultTaxRate(): Promise<number> {
  const tax = await prisma.taxConfiguration.findFirst({
    where: { isDefault: true, isActive: true },
  });
  return tax ? Number(tax.rate) : 0.18;
}

/** Calculates tax on a given subtotal using the default tax rate */
export async function calculateTax(subtotal: number): Promise<number> {
  const rate = await getDefaultTaxRate();
  return Math.round(subtotal * rate * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Discount Application
// ─────────────────────────────────────────────────────────────────────────────

/** Applies a discount to a subtotal and returns the discount amount */
export function applyDiscount(
  subtotal: number,
  discount: { type: string; value: Prisma.Decimal | number }
): number {
  const val = Number(discount.value);
  if (discount.type === 'PERCENTAGE') {
    return Math.round(subtotal * (val / 100) * 100) / 100;
  }
  return Math.min(val, subtotal); // can't discount more than subtotal
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice Totals
// ─────────────────────────────────────────────────────────────────────────────

interface LineItem {
  amount: number;
  taxable: boolean;
}

interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
}

export async function calculateInvoiceTotals(
  items: LineItem[],
  discountAmount = 0,
  paidAmount = 0
): Promise<InvoiceTotals> {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxableSubtotal = items
    .filter((i) => i.taxable)
    .reduce((s, i) => s + i.amount, 0);
  const taxAmount = await calculateTax(taxableSubtotal - discountAmount);
  const totalAmount = subtotal - discountAmount + taxAmount;
  const balanceDue = totalAmount - paidAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pro-rata Calculation (for mid-cycle plan upgrades)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the pro-rata charge for a plan upgrade in the middle of a billing cycle.
 * @param oldMonthlyPrice - Current plan price
 * @param newMonthlyPrice - New plan price
 * @param currentPeriodStart - Start of current billing period
 * @param currentPeriodEnd - End of current billing period
 * @param upgradeDate - Date of upgrade (default: now)
 */
export function calculateProRata(
  oldMonthlyPrice: number,
  newMonthlyPrice: number,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  upgradeDate: Date = new Date()
): number {
  const totalDays = Math.ceil(
    (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const remainingDays = Math.ceil(
    (currentPeriodEnd.getTime() - upgradeDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dailyDiff = (newMonthlyPrice - oldMonthlyPrice) / totalDays;
  return Math.round(remainingDays * dailyDiff * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Status Updater
// ─────────────────────────────────────────────────────────────────────────────

/** Recalculates and updates the payment status of an invoice based on paid amount */
export async function recalculateInvoicePaymentStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { totalAmount: true, paidAmount: true, dueDate: true },
  });

  if (!invoice) return;

  const total = Number(invoice.totalAmount);
  const paid = Number(invoice.paidAmount);
  const balance = total - paid;
  const isOverdue = invoice.dueDate < new Date();

  let paymentStatus: string;
  if (paid >= total) {
    paymentStatus = 'paid';
  } else if (paid > 0 && paid < total) {
    paymentStatus = 'partially_paid';
  } else if (balance > 0 && isOverdue) {
    paymentStatus = 'overdue';
  } else {
    paymentStatus = 'pending';
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      balanceDue: balance,
      paymentStatus: paymentStatus as any,
      status: paid >= total ? 'paid' : isOverdue ? 'overdue' : 'open',
    },
  });

  return { paymentStatus, balance };
}
