export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { MODEL, explainGeminiError, getAi, withTimeout } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json().catch(() => ({}));
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'prompt required' }, { status: 400 });
  try {
    const ai = getAi();
    const res: any = await withTimeout(ai.models.generateContent({
      model: MODEL,
      contents: prompt.slice(0, 4000),
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction:
          'You are the AI fashion assistant of ARSHU, a luxury Indo-Western womenswear atelier in Surat. Be specific, elegant and practical. You only suggest: nothing you write is published automatically.',
      },
    }), 25000);
    return NextResponse.json({ text: res.text || '' });
  } catch (e) {
    return NextResponse.json(explainGeminiError(e), { status: 502 });
  }
}
