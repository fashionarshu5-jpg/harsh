import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { collections, outfits } from '@/db/schema';
import { opt, safe } from '@/lib/util';

export default async function Collections() {
  const cols = await safe(db.select().from(collections).where(eq(collections.status, 'published')).orderBy(asc(collections.sortOrder)), []);
  const looks = await safe(db.select({ c: outfits.collectionId }).from(outfits).where(eq(outfits.status, 'published')), []);
  const count = (id: string) => looks.filter((l) => l.c === id).length;
  return (
    <div className="wrap sec">
      <p className="eyebrow">The atelier</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 40px' }}>Collections</h1>
      <div className="grid">
        {cols.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="tile">
            {c.heroImageUrl ? <img className="ph" src={opt(c.heroImageUrl, 'f_auto,q_auto,w_700')} alt={c.title} /> : <div className="ph" />}
            <span className="eyebrow">{count(c.id)} looks</span>
            <h3 style={{ fontSize: 30 }}>{c.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{c.conceptDescription}</p>
            <div className="row">{(c.colorPalette || []).map((x, i) => <span key={i} className="dot" style={{ background: x }} />)}</div>
          </Link>
        ))}
        {cols.length === 0 && <p className="muted">Collections will appear here once published from the admin dashboard.</p>}
      </div>
    </div>
  );
}
