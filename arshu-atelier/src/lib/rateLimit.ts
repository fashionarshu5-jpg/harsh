import { sql } from 'drizzle-orm';
import { db } from '@/db';

const MAX_PER_IP = 5;       // failed logins per IP ...
const MAX_GLOBAL = 40;      // ... and across all IPs (stops distributed guessing)
const WINDOW_MIN = 15;

let ready: Promise<void> | null = null;
const mem = new Map<string, number[]>(); // fallback if the database is unreachable

const ensure = () => (ready ||= db.execute(sql`create table if not exists admin_login_attempts (
  id bigserial primary key, ip text not null, created_at timestamptz not null default now())`).then(() => {}));

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get('x-nf-client-connection-ip') || h.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim().slice(0, 64);
}

/** Returns minutes to wait if locked out, otherwise 0. */
export async function lockedMinutes(ip: string): Promise<number> {
  try {
    await ensure();
    const r: any = await db.execute(sql`select
      count(*) filter (where ip = ${ip}) as mine, count(*) as total,
      extract(epoch from (now() - min(created_at) filter (where ip = ${ip}))) as age
      from admin_login_attempts where created_at > now() - make_interval(mins => ${WINDOW_MIN})`);
    const row = (r.rows ?? r)[0] || {};
    if (Number(row.mine) >= MAX_PER_IP || Number(row.total) >= MAX_GLOBAL) return Math.max(1, WINDOW_MIN - Math.floor(Number(row.age || 0) / 60));
    return 0;
  } catch {
    const now = Date.now(); const list = (mem.get(ip) || []).filter((t) => now - t < WINDOW_MIN * 60000); mem.set(ip, list);
    return list.length >= MAX_PER_IP ? WINDOW_MIN : 0;
  }
}
export async function recordFailure(ip: string) {
  try { await ensure(); await db.execute(sql`insert into admin_login_attempts (ip) values (${ip})`); await db.execute(sql`delete from admin_login_attempts where created_at < now() - interval '1 day'`); }
  catch { mem.set(ip, [...(mem.get(ip) || []), Date.now()]); }
}
export async function clearFailures(ip: string) {
  try { await ensure(); await db.execute(sql`delete from admin_login_attempts where ip = ${ip}`); } catch { mem.delete(ip); }
}
