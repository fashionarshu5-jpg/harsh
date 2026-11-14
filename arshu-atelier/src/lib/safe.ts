import { unstable_noStore as noStore } from 'next/cache';

/** Server-only: runs a DB query, never cached, and returns a fallback instead of crashing the page. */
export async function safe<T>(p: PromiseLike<T>, fallback: T): Promise<T> {
  try { noStore(); } catch {}
  try { return await p; } catch (e) { console.error('DB error:', e); return fallback; }
}
