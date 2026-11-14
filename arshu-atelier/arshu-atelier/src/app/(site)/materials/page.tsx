import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { materialArchive } from '@/db/schema';
import MaterialsBrowser from '@/components/MaterialsBrowser';
import { safe } from '@/lib/safe';
import EmptyNote from '@/components/EmptyNote';

export const metadata = { title: 'Material Archive', description: 'A swatch library of fabrics, weaves and embroidery used by ARSHU.' };

export default async function Materials() {
  const items = await safe(db.select().from(materialArchive).orderBy(desc(materialArchive.createdAt)), []);
  return (
    <div className="wrap sec">
      <p className="eyebrow">Swatch library</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 32px' }}>Material Archive</h1>
      {items.length ? <MaterialsBrowser items={items} /> : <EmptyNote what="Materials" />}
    </div>
  );
}
