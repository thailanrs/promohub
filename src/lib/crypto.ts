import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_DEV_SECRET = 'promohub_default_encryption_secret_key_32bytes!!';

function deriveKey(secretKeyHex?: string): Buffer {
  const secret = secretKeyHex || process.env.ENCRYPTION_SECRET || DEFAULT_DEV_SECRET;
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts plain text string using AES-256-GCM algorithm.
 * Returns payload string formatted as: `ivHex:authTagHex:encryptedHex`.
 */
export function encryptGCM(plainText: string, secretKeyHex?: string): string {
  if (!plainText) return '';

  const key = deriveKey(secretKeyHex);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM payload string formatted as: `ivHex:authTagHex:encryptedHex`.
 */
export function decryptGCM(encryptedPayload: string, secretKeyHex?: string): string {
  if (!encryptedPayload) return '';

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:encryptedText');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = deriveKey(secretKeyHex);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
