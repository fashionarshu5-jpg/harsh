export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, getTableColumns } from 'drizzle-orm';
import { db } from '@/db';
import * as s from '@/db/schema';
import { slugify } from '@/lib/util';
import { refreshSite } from '@/lib/revalidate';

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
const TITLE_KEY: Record<string, string> = { collections: 'title', outfits: 'title', moodboards: 'title', sketches: 'title', materials: 'materialName', research: 'title' };
/** Blank/"untitled" titles are never allowed to be saved as published (this created the public "untitled" collection). */
function validate(table: string, data: any, isNew: boolean): string | null {
  const k = TITLE_KEY[table];
  if (!k) return null;
  const has = k in data;
  const v = String(data[k] ?? '').trim();
  if ((isNew || has) && (!v || v.toLowerCase() === 'untitled')) {
    if (isNew || data.status === 'published') return 'Please enter a real title before saving or publishing.';
  }
  return null;
}
const guard = (t: string) => T[t] || null;
const fail = (e: any) => NextResponse.json({ error: String(e?.message || e).slice(0, 300) }, { status: 500 });

export async function GET(_: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  try { return NextResponse.json(await db.select().from(t).orderBy(desc(t.createdAt))); } catch (e) { return fail(e); }
}

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  try {
    const data = clean(t, await req.json());
    const bad = validate(params.table, data, true);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });
    if ('slug' in getTableColumns(t) && !data.slug) data.slug = slugify(data.title || 'untitled');
    const [row] = await db.insert(t).values(data).returning();
    refreshSite();
    return NextResponse.json(row);
  } catch (e) { return fail(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  try {
    const body = await req.json();
    const data = clean(t, body);
    const bad = validate(params.table, data, false);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });
    if ('slug' in getTableColumns(t) && !data.slug && data.title) data.slug = slugify(data.title);
    const [row] = await db.update(t).set(data).where(eq(t.id, body.id)).returning();
    refreshSite();
    return NextResponse.json(row);
  } catch (e) { return fail(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { table: string } }) {
  const t = guard(params.table);
  if (!t) return NextResponse.json({ error: 'Unknown table' }, { status: 404 });
  try {
    await db.delete(t).where(eq(t.id, req.nextUrl.searchParams.get('id') || ''));
    refreshSite();
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
