import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { aiResearchEntries, outfits, pendingApprovals } from '@/db/schema';
import PreviewButton from '@/components/PreviewButton';
import { safe } from '@/lib/safe';

export const dynamic = 'force-dynamic';

export default async function Overview() {
  const n = async (q: PromiseLike<{ n: number }[]>) => (await safe(q, [{ n: 0 }]))[0]?.n ?? 0;
  const dbOk = await safe(db.execute(sql`select 1`).then(() => true), false);
  const published = await n(db.select({ n: sql<number>`count(*)::int` }).from(outfits).where(eq(outfits.status, 'published')));
  const drafts = await safe(db.select().from(outfits).where(eq(outfits.status, 'draft')).orderBy(desc(outfits.createdAt)).limit(6), []);
  const pending = await n(db.select({ n: sql<number>`count(*)::int` }).from(pendingApprovals).where(eq(pendingApprovals.status, 'pending')));
  const saved = await n(db.select({ n: sql<number>`count(*)::int` }).from(aiResearchEntries).where(eq(aiResearchEntries.isSaved, true)));
  return (
    <>
      <h1 style={{ fontSize: 38 }}>Overview</h1>
      {!dbOk && <div className="panel" style={{ borderColor: '#B3341B' }}><b className="err">❌ The database is not connected, so nothing you save can show on the website.</b><Link href="/admin/system" style={{ textDecoration: 'underline' }}>Open System Check to find out why →</Link></div>}
      <div className="stats">
        <div className="panel stat"><h3>Published looks</h3><b>{published}</b></div>
        <div className="panel stat"><h3>Draft looks</h3><b>{drafts.length}</b></div>
        <div className="panel stat"><h3>Pending approvals</h3><b>{pending}</b></div>
        <div className="panel stat"><h3>Saved research</h3><b>{saved}</b></div>
      </div>
      <div className="panel"><h3>Recent draft outfits</h3>
        {drafts.map((o) => <div className="li" key={o.id}><span>{o.lookNumber} · {o.title}</span><PreviewButton id={o.id} /></div>)}
        {drafts.length === 0 && <p className="muted">No drafts. <Link href="/admin/outfits" style={{ textDecoration: 'underline' }}>Add a look →</Link></p>}
      </div>
      <div className="panel"><h3>Quick start</h3>
        <p>1) Website Customization → add your hero image and text. 2) Collections → create and publish. 3) Outfits → add looks with photos. 4) Materials → add swatches and link them to looks.</p></div>
    </>
  );
}
