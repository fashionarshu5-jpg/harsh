import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'arshu_admin';
export const secretProblem = () => {
  const v = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV !== 'production') return null;
  if (!v || v.length < 32 || v.startsWith('dev-only') || v.startsWith('put-a-long')) return 'SESSION_SECRET is missing or too weak (use 40+ random characters).';
  return null;
};
// No built-in fallback secret in production: a known secret would let anyone forge an admin cookie.
const key = () => {
  if (secretProblem()) throw new Error(secretProblem()!);
  return new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-only-secret-change-me-please-123456');
};

export async function signSession(sub: string) {
  return new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub).setIssuedAt().setExpirationTime('1d').sign(key());
}
export async function verifySession(token?: string) {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, key()); return payload.role === 'admin' ? payload : null; }
  catch { return null; }
}
export async function signPreview(outfitId: string) {
  return new SignJWT({ role: 'preview', outfitId }).setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt().setExpirationTime('24h').sign(key());
}
export async function verifyPreview(token?: string): Promise<string | null> {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, key()); return payload.role === 'preview' ? (payload.outfitId as string) : null; }
  catch { return null; }
}
