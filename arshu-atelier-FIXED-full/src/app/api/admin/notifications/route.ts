export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { adminNotifications } from '@/db/schema';

export async function GET() {
  const rows = await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(20);
  return NextResponse.json({ items: rows, unread: rows.filter((r) => !r.isRead).length });
}
export async function PATCH() {
  await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.isRead, false));
  return NextResponse.json({ ok: true });
}
