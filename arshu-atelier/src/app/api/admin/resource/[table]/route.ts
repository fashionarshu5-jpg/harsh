export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, getTableColumns } from 'drizzle-orm';
import { db } from '@/db';
import * as s from '@/db/schema';
import { slugify } from '@/lib/util';

const T: Record<string, any> = {
  collections: s.collections, outfits: s.outfits, materials: s.materialArchive,
  moodboards: s.moodboards, sketches: s.sketches, research: s.aiResearchEntries,
};

function clean(table: any, body: any) {
  const out: any = {};
  for (const k of Object.keys(getTableColumns(table))) {
    if (k === 'id' || k === 'createdAt' || !(k in body)) continue;
    let v = body[k];
    if (k === 'collectionId' && !v) v = null;
    if (k === 'sortOrder') v = Number(v) || 0;
    out[k] = v;
  }
  return out;
}
const guard = (t: string) => T[t] || null;

export async function GET(_: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  return NextResponse.json(await db.select().from(t).orderBy(desc(t.createdAt)));
}

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  const data = clean(t, await req.json());
  if ('slug' in getTableColumns(t) && !data.slug) data.slug = slugify(data.title || 'untitled');
  const [row] = await db.insert(t).values(data).returning();
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  const body = await req.json();
  const data = clean(t, body);
  if ('slug' in getTableColumns(t) && !data.slug && data.title) data.slug = slugify(data.title);
  const [row] = await db.update(t).set(data).where(eq(t.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  await db.delete(t).where(eq(t.id, req.nextUrl.searchParams.get('id') || ''));
  return NextResponse.json({ ok: true });
}
