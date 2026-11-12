export const slugify = (s: string) =>
  (s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

export async function safe<T>(p: PromiseLike<T>, fallback: T): Promise<T> {
  try { return await p; } catch (e) { console.error('DB error:', e); return fallback; }
}
/** Cloudinary delivery optimisation (auto format + quality). */
export const opt = (u?: string | null, t = 'f_auto,q_auto,w_1400') =>
  u && u.includes('/upload/') ? u.replace('/upload/', `/upload/${t}/`) : u || '';
export const lookNum = (l: string) => l.replace(/\D/g, '') || '00';
export const lookHref = (c: string, o: { lookNumber: string; slug: string }) =>
  `/collections/${c}/look-${lookNum(o.lookNumber)}-${o.slug}`;
