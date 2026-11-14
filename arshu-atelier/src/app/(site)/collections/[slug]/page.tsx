import Link from 'next/link';
import { and, asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { collections, moodboards, outfits } from '@/db/schema';
import { hasRealTitle, lookHref, opt } from '@/lib/util';
import { safe } from '@/lib/safe';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const [c] = await safe(db.select().from(collections).where(and(eq(collections.slug, params.slug), eq(collections.status, 'published'))), []);
  if (!c || !hasRealTitle(c.title)) return { title: 'Collection', robots: { index: false } };
  return { title: c.title, description: (c.conceptDescription || `The ${c.title} collection by ARSHU.`).slice(0, 160) };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const [c] = await safe(db.select().from(collections).where(and(eq(collections.slug, params.slug), eq(collections.status, 'published'))), []);
  if (!c || !hasRealTitle(c.title)) notFound();
  const looks = await safe(db.select().from(outfits).where(and(eq(outfits.collectionId, c.id), eq(outfits.status, 'published'))).orderBy(asc(outfits.lookNumber)), []);
  const boards = await safe(db.select().from(moodboards).where(and(eq(moodboards.collectionId, c.id), eq(moodboards.status, 'published'))), []);
  return (
    <div className="wrap sec">
      <p className="eyebrow">Collection</p><h1 style={{ fontSize: 'clamp(44px,6vw,76px)', margin: '8px 0 16px' }}>{c.title}</h1>
      <div className="row" style={{ marginBottom: 24 }}>{(c.colorPalette || []).map((x, i) => <span key={i} className="dot" style={{ background: x }} title={x} />)}</div>
      <div className="cols" style={{ marginBottom: 56 }}>
        <p style={{ fontSize: 19, whiteSpace: 'pre-line' }}>{c.conceptDescription}</p>
        <div>{c.fabricNotes && <div className="spec"><h4>Fabrics</h4>{c.fabricNotes}</div>}{c.silhouetteNotes && <div className="spec"><h4>Silhouettes</h4>{c.silhouetteNotes}</div>}</div>
      </div>
      {(c.inspirationStory || boards.length > 0) && (
        <section style={{ background: 'var(--stone)', padding: 32, marginBottom: 56 }}>
          <p className="eyebrow">Behind the scenes — prologue</p>
          <p style={{ whiteSpace: 'pre-line', maxWidth: 760 }}>{c.inspirationStory}</p>
          <div className="row">{boards.map((b) => <Link className="chip" key={b.id} href="/moodboards">{b.title} →</Link>)}</div>
        </section>
      )}
      <div className="grid">
        {looks.map((o) => (
          <Link key={o.id} href={lookHref(c.slug, o)} className="tile">
            {o.images?.[0] ? <img className="ph" src={opt(o.images[0].url, 'f_auto,q_auto,w_700')} alt={o.title} /> : <div className="ph" />}
            <span className="eyebrow">{o.lookNumber}</span><h3 style={{ fontSize: 26 }}>{o.title}</h3>
          </Link>
        ))}
        {looks.length === 0 && <p className="muted">Looks are coming soon.</p>}
      </div>
    </div>
  );
}
