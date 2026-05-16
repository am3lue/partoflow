// Web Crypto API based encryption for Vercel Edge Runtime
const ENCRYPTION_KEY_STR = process.env.ENCRYPTION_KEY || "fallback_secret_for_dev_mode_only";

async function getCryptoKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY_STR.padEnd(32, '0').substring(0, 32));
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(text: string): Promise<string> {
  if (!text) return text;
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    encoder.encode(text)
  );

  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const contentHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${ivHex}:${contentHex}`;
}

export async function decrypt(text: string): Promise<string> {
  if (!text || !text.includes(':')) return text;
  try {
    const [ivHex, contentHex] = text.split(':');
    const key = await getCryptoKey();
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(contentHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    return text;
  }
}

export function uuidv4() {
  return crypto.randomUUID();
}
