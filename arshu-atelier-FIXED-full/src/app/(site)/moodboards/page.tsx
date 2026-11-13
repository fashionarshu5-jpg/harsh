import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { moodboards } from '@/db/schema';
import MoodboardView from '@/components/MoodboardView';
import { safe } from '@/lib/util';
import EmptyNote from '@/components/EmptyNote';

export const metadata = { title: 'Moodboards', description: 'Inspiration moodboards behind the ARSHU collections.' };

export default async function Moodboards() {
  const boards = await safe(db.select().from(moodboards).where(eq(moodboards.status, 'published')).orderBy(desc(moodboards.createdAt)), []);
  return (
    <div className="wrap sec">
      <p className="eyebrow">Inspiration</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 32px' }}>Moodboards</h1>
      {boards.length ? <MoodboardView boards={boards} /> : <EmptyNote what="Moodboards" />}
    </div>
  );
}
