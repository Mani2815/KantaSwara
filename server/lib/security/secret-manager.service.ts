// =============================================================================
// Secret Manager
// =============================================================================
// AES-256-GCM encryption for API keys and secrets.
// Master key from ENCRYPTION_MASTER_KEY env var.
//
// IMPORTANT: The master key must be a 64-char hex string (32 bytes).
// Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// =============================================================================

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING = 'hex';

// =============================================================================
// ENCRYPT
// =============================================================================

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:ciphertext (hex-encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

// =============================================================================
// DECRYPT
// =============================================================================

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Input format: iv:authTag:ciphertext (hex-encoded)
 */
export function decrypt(encryptedData: string): string {
  const key = getMasterKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new SecretManagerError(
      'INVALID_FORMAT',
      'Encrypted data must be in format iv:authTag:ciphertext'
    );
  }

  const [ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// =============================================================================
// KEY ROTATION
// =============================================================================

/**
 * Re-encrypt a value using a new master key.
 * Used during key rotation — decrypt with old key, encrypt with new.
 */
export function rotateEncryption(
  encryptedData: string,
  oldKeyHex: string
): string {
  // Decrypt with old key
  const oldKey = Buffer.from(oldKeyHex, ENCODING);
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new SecretManagerError('INVALID_FORMAT', 'Invalid data');

  const [ivHex, authTagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, oldKey, iv);
  decipher.setAuthTag(authTag);
  let plaintext = decipher.update(ciphertext, ENCODING, 'utf8');
  plaintext += decipher.final('utf8');

  // Re-encrypt with current master key
  return encrypt(plaintext);
}

// =============================================================================
// HASH (for API key storage)
// =============================================================================

/**
 * Hash a value using SHA-256. Used for API key lookup (store hash, compare hash).
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest(ENCODING);
}

/**
 * Compare a plaintext value against its hash.
 */
export function compareHash(plaintext: string, hash: string): boolean {
  const computed = hashValue(plaintext);
  return crypto.timingSafeEqual(
    Buffer.from(computed, ENCODING),
    Buffer.from(hash, ENCODING)
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getMasterKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_MASTER_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new SecretManagerError(
      'MISSING_KEY',
      'ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(keyHex, ENCODING);
}

// =============================================================================
// Error
// =============================================================================

export class SecretManagerError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SecretManagerError';
    this.code = code;
  }
}
