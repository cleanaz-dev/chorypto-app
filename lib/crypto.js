// lib/crypto.js
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// --- CORRECT KEY HANDLING START ---
// Ensure process.env.CRYPTO_SECRET is EXACTLY 32 bytes long AFTER HEX DECODING
const secretEnvVar = process.env.CRYPTO_SECRET;
if (!secretEnvVar) {
  throw new Error('CRYPTO_SECRET environment variable is not set.');
}

let secretKey; // This will hold the 32-byte Buffer
try {
  // *** CRITICAL: Use 'hex' for decoding ***
  secretKey = Buffer.from(secretEnvVar, 'hex');
} catch (e) {
  throw new Error('Failed to decode CRYPTO_SECRET from hex. Is it a valid 64-character hex string?');
}

if (secretKey.length !== 32) {
  throw new Error(`Invalid CRYPTO_SECRET length after hex decoding: ${secretKey.length}. Must be 32 bytes (64 hex characters).`);
}
// --- CORRECT KEY HANDLING END ---


const algorithm = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16; // Standard GCM auth tag length

// --- CORRECT encrypt FUNCTION START ---
export function encrypt(text) {
  const iv = randomBytes(IV_LENGTH);
  // Use the 'secretKey' Buffer, remove invalid options
  const cipher = createCipheriv(algorithm, secretKey, iv);

  // Encrypt the data
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  // Get the auth tag separately AFTER final()
  const authTag = cipher.getAuthTag();

  // Return iv, authTag, and encrypted data as hex strings, separated by ':'
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
// --- CORRECT encrypt FUNCTION END ---


// --- CORRECT decrypt FUNCTION START ---
export function decrypt(text) {
  try {
    // Split into three parts: iv, authTag, encryptedData
    const parts = text.split(':');
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format: Expected 3 parts separated by ':'.");
    }
    const [ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    // Verify auth tag length
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid authentication tag length: Expected ${AUTH_TAG_LENGTH}, got ${authTag.length}.`);
    }

    // Use the 'secretKey' Buffer, remove invalid options
    const decipher = createDecipheriv(algorithm, secretKey, iv);

    // Set the expected auth tag BEFORE processing data
    decipher.setAuthTag(authTag);

    // Decrypt the data - final() will throw here if auth tag is invalid
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');

  } catch (error) {
    // Catch decryption errors (like auth failure)
    console.error("Decryption failed (GCM):", error.message);
    // Do not provide specific details to the caller, just indicate failure
    throw new Error("Decryption failed. Data might be corrupt or key incorrect.");
  }
}
// --- CORRECT decrypt FUNCTION END ---