import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { collections, outfits } from '@/db/schema';
import { getSettings } from '@/lib/settings';
import { hasRealTitle, opt } from '@/lib/util';
import { safe } from '@/lib/safe';

export default async function Home() {
  const s = await getSettings();
  const h = s.homeContent;
  const all = await safe(db.select().from(collections).where(eq(collections.status, 'published')).orderBy(asc(collections.sortOrder)), []);
  const looks = await safe(db.select({ c: outfits.collectionId }).from(outfits).where(eq(outfits.status, 'published')), []);
  // Only show collections that have a real title AND at least one published look.
  const cols = all.filter((c) => hasRealTitle(c.title) && looks.some((l) => l.c === c.id)).slice(0, 3);
  return (
    <>
      <section className="hero">
        {h.heroImage && <img src={opt(h.heroImage, 'f_auto,q_auto,w_1800')} alt="ARSHU editorial" />}
        <div className="hero-in">
          <span className="eyebrow" style={{ letterSpacing: '.38em' }}>{h.eyebrow}</span>
          <h1>{h.headline1}<i>{h.headline2}</i></h1>
          <p>{h.subtext}</p>
          <Link href={h.buttonLink || '/collections'} className="btn" style={{ alignSelf: 'flex-start' }}>{h.buttonLabel} &nbsp;✦</Link>
          <div className="loc">{h.location.split('—')[0]}<span />{h.location.split('—')[1] || ''}</div>
        </div>
      </section>
      <section className="strip">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="eyebrow" style={{ fontSize: 11 }}>{h.collectionsLabel}</div>
          <h2>{h.collectionsHeading1}<br /><i>{h.collectionsHeading2}</i></h2>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, margin: 0 }}>{h.collectionsTagline}</p>
          <Link href="/collections" style={{ borderBottom: '1px solid', alignSelf: 'flex-start', fontSize: 14 }}>{h.collectionsLink}</Link>
        </div>
        {cols.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="card">
            {c.heroImageUrl && <img src={opt(c.heroImageUrl, 'f_auto,q_auto,w_700')} alt={c.title} />}
            <span>{c.title} &nbsp;✦</span>
          </Link>
        ))}
        {cols.length === 0 && <div className="card"><span>New collection coming soon &nbsp;✦</span></div>}
        <div className="mark"><span style={{ color: 'var(--terracotta)', fontSize: 30 }}>✦</span><b>{s.brandName}</b><span className="eyebrow" style={{ fontSize: 9 }}>{h.brandTagline}</span></div>
      </section>
    </>
  );
}
