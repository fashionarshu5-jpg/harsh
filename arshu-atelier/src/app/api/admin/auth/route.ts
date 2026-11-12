export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { COOKIE, signSession } from '@/lib/auth';

export const runtime = 'nodejs';

// First-party admin login. Override with ADMIN_USERNAME / ADMIN_PASSWORD_HASH in Netlify (recommended).
const USER = process.env.ADMIN_USERNAME || 'Harsh Chandegara';
let hash = process.env.ADMIN_PASSWORD_HASH;
const getHash = () => (hash ||= bcrypt.hashSync('Arshu@1226', 12));

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ok =
    typeof body.username === 'string' && typeof body.password === 'string' &&
    body.username === USER && (await bcrypt.compare(body.password, getHash()));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(USER), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
