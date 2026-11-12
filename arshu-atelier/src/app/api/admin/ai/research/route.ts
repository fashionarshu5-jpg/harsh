export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/db';
import { aiResearchEntries, adminNotifications } from '@/db/schema';

export const runtime = 'nodejs';
export const maxDuration = 26;

const MODEL = 'gemini-2.5-flash';

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
  if (a < 0 || b < 0) throw new Error('No JSON');
  return JSON.parse(text.slice(a, b + 1));
}

export async function POST(req: NextRequest) {
  const { category, region = 'Worldwide' } = await req.json();
  if (!category) return NextResponse.json({ error: 'category required' }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let items: any[] = [], links: { title: string; url: string }[] = [], mode: 'live' | 'conceptual' = 'live';
  try {
    const res = await ai.models.generateContent({
      model: MODEL, contents: prompt(category, region, true), config: { tools: [{ googleSearch: {} }], temperature: 0.5 },
    });
    items = parse(res.text || '');
    const chunks: any[] = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // Only links that Google Search actually returned – never model-written URLs.
    links = chunks.filter((c) => c.web?.uri).map((c) => ({ title: c.web.title || c.web.uri, url: c.web.uri })).slice(0, 8);
  } catch {
    // Rate-limited or search failed: fall back to conceptual reasoning, no error shown.
    mode = 'conceptual';
    try {
      const res = await ai.models.generateContent({ model: MODEL, contents: prompt(category, region, false), config: { temperature: 0.7 } });
      items = parse(res.text || '');
    } catch (e: any) {
      return NextResponse.json({ error: 'The AI could not answer right now. Please try again in a minute.' }, { status: 502 });
    }
  }

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
}
