export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminNotifications } from '@/db/schema';

// Appointment requests appear inside the admin notification bell (no email / SMS).
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const t = (v: any, n = 300) => (typeof v === 'string' ? v.slice(0, n) : '');
  if (!t(b.name) || !t(b.phone || b.email)) return NextResponse.json({ error: 'Name and a phone or email are required' }, { status: 400 });
  await db.insert(adminNotifications).values({
    title: `Appointment request: ${t(b.name, 80)}`,
    message: `Phone: ${t(b.phone, 40)} | Email: ${t(b.email, 120)} | Preferred date: ${t(b.date, 40)} | ${t(b.message, 600)}`,
    type: 'system',
  });
  return NextResponse.json({ ok: true });
}
