export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import * as s from '@/db/schema';
import { slugify } from '@/lib/util';
import { refreshSite } from '@/lib/revalidate';

export async function GET() {
  return NextResponse.json(await db.select().from(s.pendingApprovals).orderBy(desc(s.pendingApprovals.createdAt)));
}

// AI (or the admin) proposes a change. It is ONLY saved as "pending" – nothing goes live.
export async function POST(req: NextRequest) {
  const b = await req.json();
  if (!['collection', 'moodboard', 'material', 'settings'].includes(b.moduleTarget))
    return NextResponse.json({ error: 'Bad module' }, { status: 400 });
  const [row] = await db.insert(s.pendingApprovals).values({
    moduleTarget: b.moduleTarget, targetId: b.targetId || null, suggestedPayload: b.suggestedPayload || {},
  }).returning();
  await db.insert(s.adminNotifications).values({
    title: 'Approval needed', message: `New ${b.moduleTarget} suggestion is waiting for your review.`, type: 'approval_needed',
  });
  return NextResponse.json(row);
}

// Admin approves/rejects. Approved items are created as DRAFTS – publishing is a separate manual step.
export async function PATCH(req: NextRequest) {
  const { id, action } = await req.json();
  const [row] = await db.select().from(s.pendingApprovals).where(eq(s.pendingApprovals.id, id));
  if (!row || row.status !== 'pending') return NextResponse.json({ error: 'Not pending' }, { status: 400 });
  if (action === 'approve') {
    const p: any = row.suggestedPayload;
    const title = p.title || p.materialName || 'Untitled';
    const tail = Math.random().toString(36).slice(2, 6);
    if (row.moduleTarget === 'moodboard')
      await db.insert(s.moodboards).values({
        title, slug: `${slugify(title)}-${tail}`, culturalRoots: p.culturalRoots || '',
        colorStory: p.colorStory || [], references: p.references || [], status: 'draft',
      });
    else if (row.moduleTarget === 'material')
      await db.insert(s.materialArchive).values({
        materialName: p.materialName || title, materialType: p.materialType || '', textureDescription: p.textureDescription || '',
        embroideryCraftTechnique: p.embroideryCraftTechnique || '', colorHex: /^#[0-9a-fA-F]{6}$/.test(p.colorHex) ? p.colorHex : '#C5A880',
        usageNotes: p.usageNotes || '',
      });
    else if (row.moduleTarget === 'collection')
      await db.insert(s.collections).values({
        title, slug: `${slugify(title)}-${tail}`, conceptDescription: p.conceptDescription || '',
        inspirationStory: p.inspirationStory || '', colorPalette: p.colorPalette || [], status: 'draft',
      });
    else if (row.moduleTarget === 'settings') {
      const allowed: any = {};
      for (const k of ['aboutEditorial', 'contactEmail', 'contactInstagram']) if (typeof p[k] === 'string') allowed[k] = p[k];
      if (Object.keys(allowed).length) await db.update(s.siteSettings).set(allowed).where(eq(s.siteSettings.id, 1));
    }
  }
  await db.update(s.pendingApprovals)
    .set({ status: action === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date() })
    .where(eq(s.pendingApprovals.id, id));
  refreshSite();
  return NextResponse.json({ ok: true });
}
