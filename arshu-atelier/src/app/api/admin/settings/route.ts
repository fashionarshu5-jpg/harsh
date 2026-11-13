export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { getSettings } from '@/lib/settings';
import { refreshSite } from '@/lib/revalidate';

const hex = /^#[0-9a-fA-F]{6}$/;
const font = (v: any, d: string) => (typeof v === 'string' && /^[A-Za-z0-9 ]{2,40}$/.test(v) ? v.trim() : d);

export async function GET() { return NextResponse.json(await getSettings()); }

export async function PUT(req: NextRequest) {
  try {
  const b = await req.json();
  const cur = await getSettings();
  const col = (v: any, d: string) => (typeof v === 'string' && hex.test(v) ? v : d);
  const str = (v: any, d: string) => (typeof v === 'string' ? v : d);
  const [row] = await db.update(siteSettings).set({
    brandName: str(b.brandName, cur.brandName),
    primaryIvory: col(b.primaryIvory, cur.primaryIvory), surfaceStone: col(b.surfaceStone, cur.surfaceStone),
    accentCharcoal: col(b.accentCharcoal, cur.accentCharcoal), accentGold: col(b.accentGold, cur.accentGold),
    accentTerracotta: col(b.accentTerracotta, cur.accentTerracotta),
    fontHeading: font(b.fontHeading, cur.fontHeading), fontBody: font(b.fontBody, cur.fontBody),
    aboutEditorial: str(b.aboutEditorial, cur.aboutEditorial), contactEmail: str(b.contactEmail, cur.contactEmail),
    contactInstagram: str(b.contactInstagram, cur.contactInstagram),
    socialLinks: typeof b.socialLinks === 'object' && b.socialLinks ? b.socialLinks : cur.socialLinks,
    homeContent: typeof b.homeContent === 'object' && b.homeContent ? b.homeContent : cur.homeContent,
    updatedAt: new Date(),
  }).where(eq(siteSettings.id, 1)).returning();
  refreshSite();
  return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e).slice(0, 300) }, { status: 500 });
  }
}
