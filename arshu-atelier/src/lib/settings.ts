import { db } from '@/db';
import { siteSettings, HomeContent } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const defaultHome: Required<HomeContent> = {
  eyebrow: 'Indo-Western Couture', headline1: 'Where Heritage', headline2: 'Meets Modernity',
  subtext: 'A celebration of Indian craftsmanship and contemporary design — by ARSHU.',
  buttonLabel: 'Discover Our Collection', buttonLink: '/collections', location: 'Surat, Gujarat — India', heroImage: '',
  collectionsLabel: 'Our Collections', collectionsHeading1: 'Timeless', collectionsHeading2: 'Collections',
  collectionsTagline: 'Rooted in tradition. Designed for today.', collectionsLink: 'View All Collections',
  headerButton: 'Explore Collections', brandTagline: 'Designer Atelier',
};

const fallback = {
  id: 1, brandName: 'ARSHU', primaryIvory: '#F9F8F6', surfaceStone: '#F2EFE9', accentCharcoal: '#1A1A1A',
  accentGold: '#C5A880', accentTerracotta: '#D97443', fontHeading: 'Cormorant Garamond', fontBody: 'Plus Jakarta Sans',
  aboutEditorial: '', contactEmail: '', contactInstagram: '', socialLinks: {} as Record<string, string>,
  homeContent: {} as HomeContent, updatedAt: new Date(),
};

export async function getSettings() {
  try {
    let [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!row) [row] = await db.insert(siteSettings).values({ id: 1 }).returning();
    return { ...row, homeContent: { ...defaultHome, ...(row.homeContent || {}) } as Required<HomeContent> };
  } catch (e) {
    console.error('Settings fallback (is the database set up?):', e);
    return { ...fallback, homeContent: defaultHome };
  }
}
