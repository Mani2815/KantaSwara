// =============================================================================
// API Key Service
// =============================================================================
// Generate, validate, and revoke API keys for organizations.
// Keys are hashed (SHA-256) for storage — full key only shown once on creation.
// Scoped to organization for multi-tenant isolation.
// =============================================================================

import * as crypto from 'crypto';
import { prisma } from '@server/lib/prisma';
import { hashValue, compareHash } from './secret-manager.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiKeyCreateResult {
  /** The full API key — only shown once */
  key: string;
  /** Key ID for management */
  keyId: string;
  /** First 8 chars for display */
  prefix: string;
  /** Creation timestamp */
  createdAt: Date;
}

export interface ApiKeyInfo {
  keyId: string;
  prefix: string;
  name: string;
  scopes: string[];
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  revoked: boolean;
}

// =============================================================================
// GENERATE API KEY
// =============================================================================

/**
 * Generate a new API key for an organization.
 * Returns the full key (only shown once) and stores the hash.
 */
export async function generateApiKey(
  organizationId: string,
  name: string,
  scopes: string[] = ['read', 'write'],
  expiresInDays?: number
): Promise<ApiKeyCreateResult> {
  // Generate key: ks_live_ prefix + 40 random hex chars
  const rawKey = crypto.randomBytes(20).toString('hex');
  const fullKey = `ks_live_${rawKey}`;
  const prefix = fullKey.slice(0, 12);
  const keyHash = hashValue(fullKey);
  const keyId = crypto.randomUUID();

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await prisma.apiKey.create({
    data: {
      id: keyId,
      organizationId,
      name,
      keyHash,
      prefix,
      scopes,
      expiresAt,
    },
  });

  return {
    key: fullKey,
    keyId,
    prefix,
    createdAt: new Date(),
  };
}

// =============================================================================
// VALIDATE API KEY
// =============================================================================

/**
 * Validate an API key and return its organization context.
 * Returns null if key is invalid, expired, or revoked.
 */
export async function validateApiKey(
  key: string
): Promise<{
  organizationId: string;
  keyId: string;
  scopes: string[];
} | null> {
  const keyHash = hashValue(key);

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
    },
    select: {
      id: true,
      organizationId: true,
      scopes: true,
      expiresAt: true,
    },
  });

  if (!apiKey) return null;

  // Check expiry
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {}); // Non-blocking

  return {
    organizationId: apiKey.organizationId,
    keyId: apiKey.id,
    scopes: apiKey.scopes as string[],
  };
}

// =============================================================================
// REVOKE API KEY
// =============================================================================

/**
 * Revoke an API key. The key can no longer be used for authentication.
 */
export async function revokeApiKey(
  keyId: string,
  organizationId: string
): Promise<boolean> {
  try {
    await prisma.apiKey.updateMany({
      where: {
        id: keyId,
        organizationId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// LIST API KEYS
// =============================================================================

/**
 * List all API keys for an organization (without sensitive data).
 */
export async function listApiKeys(
  organizationId: string
): Promise<ApiKeyInfo[]> {
  const keys = await prisma.apiKey.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      lastUsedAt: true,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return keys.map((k) => ({
    keyId: k.id,
    prefix: k.prefix,
    name: k.name,
    scopes: k.scopes as string[],
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
    expiresAt: k.expiresAt,
    revoked: k.revokedAt !== null,
  }));
}
