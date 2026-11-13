export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiResearchEntries, adminNotifications } from '@/db/schema';
import { MODEL, explainGeminiError, getAi, withTimeout } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

function regionRule(region: string) {
  if (region === 'India')
    return 'All items must be from India (FDCI, Lakmé Fashion Week, India Couture Week, Indian designers and craft clusters).';
  if (region === 'Balanced')
    return 'Return a 50/50 split: one item from India (FDCI / Lakmé Fashion Week / India Couture Week) and one from the international circuit (Paris, Milan, London, New York).';
  return 'Items should come from the worldwide fashion scene (Paris, Milan, London, New York, Tokyo, India).';
}

function prompt(category: string, region: string, grounded: boolean) {
  return `You are the research analyst of ARSHU, a luxury Indo-Western womenswear atelier in Surat, India
(structured Western tailoring + Kutch mirror-work and heritage surface techniques).
Research category: "${category}". Region scope: ${region}. ${regionRule(region)}
${grounded ? 'Use Google Search and only report things you actually found. Do NOT invent events, designers or dates.' : 'Live search is unavailable: give deep, clearly conceptual analysis. Do not invent specific events or dates; say "conceptual" where unsure.'}
Return EXACTLY 2 items as a pure JSON array (no markdown, no commentary). Each item:
{"title":"","category":"${category}","region":"Worldwide or India","designerOrBrand":"","eventDate":"","summary":"What is happening? (detailed)","importance":"Why is it important for fashion?","arshuInspiration":"Specific Indo-Western design inspiration for ARSHU","creativeDirection":{"fabrics":[""],"colors":[""],"silhouettes":[""],"craft":[""]}}`;
}

function parse(text: string) {
  const a = text.indexOf('['), b = text.lastIndexOf(']');
  if (a < 0 || b < 0) throw new Error('The AI answer was not valid JSON');
  const arr = JSON.parse(text.slice(a, b + 1));
  if (!Array.isArray(arr) || !arr.length) throw new Error('The AI returned no items');
  return arr;
}

export async function POST(req: NextRequest) {
  const { category, region = 'Worldwide' } = await req.json().catch(() => ({}));
  if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });

  let ai;
  try { ai = getAi(); } catch (e) { return NextResponse.json(explainGeminiError(e), { status: 500 }); }

  let items: any[] = [], links: { title: string; url: string }[] = [], mode: 'live' | 'conceptual' = 'live';
  try {
    // Attempt 1: live Google Search (max 17 s so we stay inside Netlify's 30 s limit).
    const res: any = await withTimeout(ai.models.generateContent({
      model: MODEL, contents: prompt(category, region, true),
      config: { tools: [{ googleSearch: {} }], temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } },
    }), 17000);
    items = parse(res.text || '');
    const chunks: any[] = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // Only links Google Search really returned – never model-written URLs.
    links = chunks.filter((c) => c.web?.uri).map((c) => ({ title: c.web.title || c.web.uri, url: c.web.uri })).slice(0, 8);
  } catch (e1) {
    // Attempt 2: conceptual reasoning without search (fast).
    mode = 'conceptual';
    try {
      const res: any = await withTimeout(ai.models.generateContent({
        model: MODEL, contents: prompt(category, region, false),
        config: { temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
      }), 9000);
      items = parse(res.text || '');
    } catch (e2) {
      const first = explainGeminiError(e1), second = explainGeminiError(e2);
      // Prefer the more useful message (key / quota problems beat "timeout").
      const pick = /TIMEOUT/i.test(second.detail) ? first : second;
      return NextResponse.json({ error: pick.error, detail: pick.detail }, { status: 502 });
    }
  }

  try {
    const rows = await db.insert(aiResearchEntries).values(items.slice(0, 3).map((i: any) => ({
      title: String(i.title || 'Untitled'), category, region: i.region === 'India' ? 'India' : 'Worldwide',
      designerOrBrand: String(i.designerOrBrand || ''), eventDate: String(i.eventDate || ''),
      summary: String(i.summary || ''), importance: String(i.importance || ''), arshuInspiration: String(i.arshuInspiration || ''),
      creativeDirection: {
        fabrics: i.creativeDirection?.fabrics || [], colors: i.creativeDirection?.colors || [],
        silhouettes: i.creativeDirection?.silhouettes || [], craft: i.creativeDirection?.craft || [],
      },
      sourceLinks: links, isSaved: false,
    }))).returning();
    await db.insert(adminNotifications).values({
      title: 'Research done', message: `${rows.length} new "${category}" entries (${mode === 'live' ? 'live search' : 'conceptual'}).`, type: 'research_done',
    });
    return NextResponse.json({ mode, items: rows });
  } catch (e: any) {
    return NextResponse.json({ error: 'The AI answered, but saving to the database failed. Open Admin > System Check.', detail: String(e?.message || e).slice(0, 300) }, { status: 500 });
  }
}
