import { and, eq, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { collections, materialArchive, outfits } from '@/db/schema';
import OutfitView from '@/components/OutfitView';
import { safe } from '@/lib/safe';

// URL: /collections/<collection-slug>/look-<number>-<slug>
export async function generateMetadata({ params }: { params: { slug: string; lookSlug: string } }) {
  const m = /^look-(\d+)-(.+)$/.exec(params.lookSlug);
  if (!m) return { title: 'Look' };
  const [c] = await safe(db.select().from(collections).where(and(eq(collections.slug, params.slug), eq(collections.status, 'published'))), []);
  if (!c) return { title: 'Look' };
  const [o] = await safe(db.select().from(outfits).where(and(eq(outfits.collectionId, c.id), eq(outfits.slug, m[2]), eq(outfits.status, 'published'))), []);
  return { title: o ? `${o.title} — ${c.title}` : 'Look' };
}

export default async function LookPage({ params }: { params: { slug: string; lookSlug: string } }) {
  const m = /^look-(\d+)-(.+)$/.exec(params.lookSlug);
  if (!m) notFound();
  const [c] = await safe(db.select().from(collections).where(and(eq(collections.slug, params.slug), eq(collections.status, 'published'))), []);
  if (!c) notFound();
  const [o] = await safe(db.select().from(outfits).where(and(eq(outfits.collectionId, c.id), eq(outfits.slug, m[2]), eq(outfits.status, 'published'))), []);
  if (!o) notFound();
  const ids = o.materialArchiveIds || [];
  const mats = ids.length ? await safe(db.select().from(materialArchive).where(inArray(materialArchive.id, ids)), []) : [];
  return <OutfitView o={o} materials={mats} collection={c} />;
}
