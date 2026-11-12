import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { aiResearchEntries } from '@/db/schema';
import { safe } from '@/lib/util';

// Shows only research entries the admin chose to "Save to Research Library".
export default async function Research() {
  const rows = await safe(db.select().from(aiResearchEntries).where(eq(aiResearchEntries.isSaved, true)).orderBy(desc(aiResearchEntries.createdAt)), []);
  return (
    <div className="wrap sec">
      <p className="eyebrow">Atelier notes</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 32px' }}>Research</h1>
      <div className="grid">
        {rows.map((r) => (
          <article key={r.id} className="tile" style={{ padding: 20 }}>
            <span className="eyebrow">{r.category} · {r.region}</span><h3 style={{ fontSize: 26 }}>{r.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{r.summary}</p>
            <p style={{ margin: 0 }}><b>For ARSHU:</b> {r.arshuInspiration}</p>
            <div className="row">{(r.sourceLinks || []).slice(0, 3).map((l, i) => <a key={i} className="chip" href={l.url} target="_blank" rel="noreferrer">{l.title.slice(0, 30)} ↗</a>)}</div>
          </article>
        ))}
        {rows.length === 0 && <p className="muted">Nothing here yet.</p>}
      </div>
    </div>
  );
}
