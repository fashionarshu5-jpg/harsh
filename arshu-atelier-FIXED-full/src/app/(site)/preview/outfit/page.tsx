import { eq, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { materialArchive, outfits } from '@/db/schema';
import OutfitView from '@/components/OutfitView';
import { verifyPreview } from '@/lib/auth';
import { safe } from '@/lib/util';

// Private mobile preview of a DRAFT look: /preview/outfit?token=...
export const metadata = { robots: { index: false, follow: false } };

export default async function Preview({ searchParams }: { searchParams: { token?: string } }) {
  const id = await verifyPreview(searchParams.token);
  if (!id) notFound();
  const [o] = await safe(db.select().from(outfits).where(eq(outfits.id, id)), []);
  if (!o) notFound();
  const ids = o.materialArchiveIds || [];
  const mats = ids.length ? await safe(db.select().from(materialArchive).where(inArray(materialArchive.id, ids)), []) : [];
  return (<><div style={{ background: '#B3341B', color: '#fff', textAlign: 'center', padding: 8, fontSize: 13 }}>PRIVATE PREVIEW — status: {o.status}</div><OutfitView o={o} materials={mats} /></>);
}
