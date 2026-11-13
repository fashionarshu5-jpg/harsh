import crypto from 'node:crypto';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32decode(s: string) {
  const clean = s.replace(/[\s=-]/g, '').toUpperCase();
  let bits = '';
  for (const ch of clean) { const i = B32.indexOf(ch); if (i < 0) return null; bits += i.toString(2).padStart(5, '0'); }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function code(secret: Buffer, counter: number) {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', secret).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}
/** Verifies a 6-digit authenticator-app code (RFC 6238), allowing ±1 time step for clock drift. */
export function verifyTotp(secretB32: string, token: string) {
  const secret = b32decode(secretB32);
  if (!secret || !/^\d{6}$/.test(token)) return false;
  const step = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((d) => {
    const a = Buffer.from(code(secret, step + d)); const b = Buffer.from(token);
    return crypto.timingSafeEqual(a, b);
  });
}
