export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { getStore } from '@netlify/blobs';
import { db } from '@/db';
import * as s from '@/db/schema';
import { MODEL, explainGeminiError, fastThinking, getAi, withTimeout } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

type R = { name: string; ok: boolean; detail: string; fix?: string };
const msg = (e: any) => String(e?.message || e).slice(0, 220);

export async function GET() {
  const out: R[] = [];
  const env = process.env;

  // 1. Environment variables
  const need = ['DATABASE_URL', 'SESSION_SECRET', 'GEMINI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = need.filter((k) => !env[k]);
  out.push({ name: 'Environment variables', ok: !missing.length, detail: missing.length ? `Missing: ${missing.join(', ')}` : 'All 6 are set',
    fix: missing.length ? 'Netlify > Project configuration > Environment variables, add them, then Deploys > Trigger deploy.' : undefined });
  if (env.DATABASE_URL) {
    const u = env.DATABASE_URL;
    out.push({ name: 'Database URL format', ok: u.startsWith('postgres') && u.includes('-pooler') && !u.includes('channel_binding'),
      detail: `${u.includes('-pooler') ? 'pooled' : 'NOT pooled'}${u.includes('channel_binding') ? ', contains channel_binding' : ''}`,
      fix: 'Use the pooled Neon string and remove "&channel_binding=require" at the end.' });
  }
  if (env.SESSION_SECRET) out.push({ name: 'Session secret length', ok: env.SESSION_SECRET.length >= 32, detail: `${env.SESSION_SECRET.length} characters`, fix: 'Use at least 40 random characters.' });

  // 2. Database: connect, tables, write + read back
  try { await db.execute(sql`select 1`); out.push({ name: 'Database connection (Neon)', ok: true, detail: 'Connected' }); }
  catch (e) { out.push({ name: 'Database connection (Neon)', ok: false, detail: msg(e), fix: 'Check DATABASE_URL in Netlify (pooled string, no spaces, no channel_binding).' }); }

  const tables: [string, any][] = [['site_settings', s.siteSettings], ['collections', s.collections], ['outfits', s.outfits], ['material_archive', s.materialArchive],
    ['moodboards', s.moodboards], ['sketches', s.sketches], ['ai_research_entries', s.aiResearchEntries], ['pending_approvals', s.pendingApprovals], ['admin_notifications', s.adminNotifications]];
  const bad: string[] = [];
  for (const [n, t] of tables) { try { await db.select().from(t).limit(1); } catch { bad.push(n); } }
  out.push({ name: 'Database tables (9)', ok: !bad.length, detail: bad.length ? `Missing/unreadable: ${bad.join(', ')}` : 'All 9 tables found',
    fix: bad.length ? 'Open Neon > SQL Editor, paste db/schema.sql and press Run.' : undefined });

  try {
    const tag = `diag-${Date.now()}`;
    const [row] = await db.insert(s.adminNotifications).values({ title: tag, message: 'write test', type: 'system', isRead: true }).returning();
    const [back] = await db.select().from(s.adminNotifications).where(eq(s.adminNotifications.id, row.id));
    await db.delete(s.adminNotifications).where(eq(s.adminNotifications.id, row.id));
    out.push({ name: 'Save & read back (admin to public sync)', ok: back?.title === tag, detail: back?.title === tag ? 'Wrote a test row, read it back instantly, deleted it' : 'Wrote but could not read back' });
  } catch (e) { out.push({ name: 'Save & read back (admin to public sync)', ok: false, detail: msg(e), fix: 'Database write failed – fix the database checks above first.' }); }

  // 3. Gemini (tiny real call)
  try {
    const t0 = Date.now();
    const res: any = await withTimeout(getAi().models.generateContent({ model: MODEL, contents: 'Reply with the single word OK', config: { thinkingConfig: fastThinking() } }), 15000);
    out.push({ name: `AI agent (Gemini, ${MODEL})`, ok: /ok/i.test(res.text || ''), detail: `Answered "${String(res.text || '').trim().slice(0, 30)}" in ${Date.now() - t0} ms` });
  } catch (e) { const x = explainGeminiError(e); out.push({ name: `AI agent (Gemini, ${MODEL})`, ok: false, detail: x.detail, fix: x.error }); }
  if (env.GEMINI_API_KEY) out.push({ name: 'Gemini key type', ok: true, detail: env.GEMINI_API_KEY.startsWith('AQ.') ? 'New "AQ." key (works with the official SDK)' : env.GEMINI_API_KEY.startsWith('AIza') ? 'Classic "AIza" key' : 'Unknown format' });

  // 4. Cloudinary (server-side ping with your credentials)
  try {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) throw new Error('Cloudinary variables missing');
    const auth = Buffer.from(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`).toString('base64');
    const r = await withTimeout(fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/ping`, { headers: { Authorization: `Basic ${auth}` }, cache: 'no-store' }), 10000);
    out.push({ name: 'Image storage (Cloudinary)', ok: r.ok, detail: r.ok ? 'Credentials accepted' : `Cloudinary answered ${r.status}`, fix: r.ok ? undefined : 'Re-check CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET (no spaces).' });
  } catch (e) { out.push({ name: 'Image storage (Cloudinary)', ok: false, detail: msg(e), fix: 'Re-check the three Cloudinary variables.' }); }

  // 5. PDF storage
  try { await getStore('specs').list(); out.push({ name: 'PDF storage (Netlify Blobs)', ok: true, detail: 'Available' }); }
  catch (e) { out.push({ name: 'PDF storage (Netlify Blobs)', ok: false, detail: msg(e), fix: 'Only needed for spec-sheet PDFs. Works on the live Netlify site.' }); }

  return NextResponse.json(out);
}
