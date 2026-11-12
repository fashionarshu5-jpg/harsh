import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'arshu_admin';
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-only-secret-change-me-please-123456');

export async function signSession(sub: string) {
  return new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub).setIssuedAt().setExpirationTime('7d').sign(key());
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
