const crypto = require('crypto');

function resolveKey() {
  const k = process.env.ENCRYPTION_KEY || '';
  if (!k) {
    // Derive a key from a default phrase to avoid crashes in dev; recommend setting ENCRYPTION_KEY in prod
    return crypto.scryptSync('happytailz-dev-default', 'happytailz-salt', 32);
  }
  // hex
  if (/^[0-9a-fA-F]{64}$/.test(k)) return Buffer.from(k, 'hex');
  // base64 (rough check)
  try {
    const b = Buffer.from(k, 'base64');
    if (b.length === 32) return b;
  } catch (_) {}
  // derive from provided string
  return crypto.scryptSync(k, 'happytailz-salt', 32);
}

const KEY = resolveKey(); // 32 bytes for AES-256-GCM

function encrypt(buffer) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

function decrypt(payload) {
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext;
}

module.exports = { encrypt, decrypt };
