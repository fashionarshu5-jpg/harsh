import { revalidatePath } from 'next/cache';

/** Call after every admin save so the public site never serves stale pages. */
export function refreshSite() {
  try { revalidatePath('/', 'layout'); } catch (e) { console.error('revalidate failed', e); }
}
