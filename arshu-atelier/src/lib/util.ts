export const slugify = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

/** Cloudinary delivery optimisation (auto format + quality). */
export const opt = (u?: string | null, t = 'f_auto,q_auto,w_1400') =>
  u && u.includes('/upload/') ? u.replace('/upload/', `/upload/${t}/`) : u || '';
export const lookNum = (l: string) => l.replace(/\D/g, '') || '00';
export const lookHref = (c: string, o: { lookNumber: string; slug: string }) =>
  `/collections/${c}/look-${lookNum(o.lookNumber)}-${o.slug}`;

/** A collection is only worth showing publicly when it has a real title (not blank / "untitled"). */
export const hasRealTitle = (t?: string | null) => !!t && t.trim().length > 0 && t.trim().toLowerCase() !== 'untitled';
