export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { COOKIE, secretProblem, signSession } from '@/lib/auth';
import { clearFailures, clientIp, lockedMinutes, recordFailure } from '@/lib/rateLimit';
import { verifyTotp } from '@/lib/totp';

export const runtime = 'nodejs';

// Credentials come ONLY from Netlify environment variables (no password is stored in the code any more):
//   ADMIN_USERNAME, ADMIN_PASSWORD_HASH (bcrypt, cost 12), optional ADMIN_TOTP_SECRET (2-factor).
const safeEq = (a: string, b: string) => {
  const x = crypto.createHash('sha256').update(a).digest(); const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
};
// A real bcrypt hash used to keep timing identical when the username is wrong.
const DUMMY = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5x8nVq0n1Yb2o9yQ8eZk0mY3Lw1hZ2K';

export async function POST(req: NextRequest) {
  const USER = process.env.ADMIN_USERNAME;
  const HASH = process.env.ADMIN_PASSWORD_HASH;
  const problem = secretProblem();
  if (!USER || !HASH || problem) {
    return NextResponse.json({ error: 'Admin login is not configured yet. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET in Netlify (see README).' }, { status: 503 });
  }
  const ip = clientIp(req);
  const wait = await lockedMinutes(ip);
  if (wait > 0) return NextResponse.json({ error: `Too many failed attempts. Try again in about ${wait} minute(s).` }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const u = typeof body.username === 'string' ? body.username : '';
  const p = typeof body.password === 'string' ? body.password : '';
  const userOk = safeEq(u, USER);
  const passOk = await bcrypt.compare(p, userOk ? HASH : DUMMY);
  if (!(userOk && passOk)) {
    await recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }
  const totp = process.env.ADMIN_TOTP_SECRET;
  if (totp) {
    const c = typeof body.code === 'string' ? body.code.replace(/\s/g, '') : '';
    if (!c) return NextResponse.json({ error: 'Enter the 6-digit code from your authenticator app.', needCode: true }, { status: 401 });
    if (!verifyTotp(totp, c)) { await recordFailure(ip); return NextResponse.json({ error: 'Invalid authenticator code', needCode: true }, { status: 401 }); }
  }
  await clearFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(USER), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
