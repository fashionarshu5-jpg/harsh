import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { sketches } from '@/db/schema';
import SketchViewer from '@/components/SketchViewer';
import { safe } from '@/lib/util';
import EmptyNote from '@/components/EmptyNote';

export const metadata = { title: 'Sketches & Technical Flats', description: 'Design sketches and technical flats from the ARSHU atelier.' };

export default async function Sketches() {
  const list = await safe(db.select().from(sketches).where(eq(sketches.status, 'published')).orderBy(desc(sketches.createdAt)), []);
  return (
    <div className="wrap sec">
      <p className="eyebrow">Design process</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 40px' }}>Sketches &amp; Technical Flats</h1>
      {list.map((s) => <SketchViewer key={s.id} s={s} />)}
      {list.length === 0 && <EmptyNote what="Sketches & technical flats" />}
    </div>
  );
}
