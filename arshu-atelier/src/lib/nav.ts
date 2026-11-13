import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { moodboards, sketches, materialArchive, aiResearchEntries } from '@/db/schema';
import { safe } from '@/lib/util';

const count = async (q: PromiseLike<{ n: number }[]>) => Number((await safe(q, [{ n: 0 }]))[0]?.n || 0);

/** Returns the nav paths that have nothing published yet, so visitors are never sent to an empty page. */
export async function getEmptySections(): Promise<string[]> {
  const [mb, sk, ma, re] = await Promise.all([
    count(db.select({ n: sql<number>`count(*)` }).from(moodboards).where(eq(moodboards.status, 'published'))),
    count(db.select({ n: sql<number>`count(*)` }).from(sketches).where(eq(sketches.status, 'published'))),
    count(db.select({ n: sql<number>`count(*)` }).from(materialArchive)),
    count(db.select({ n: sql<number>`count(*)` }).from(aiResearchEntries).where(eq(aiResearchEntries.isSaved, true))),
  ]);
  const out: string[] = [];
  if (!mb) out.push('/moodboards');
  if (!sk) out.push('/sketches');
  if (!ma) out.push('/materials');
  if (!re) out.push('/research');
  return out;
}
