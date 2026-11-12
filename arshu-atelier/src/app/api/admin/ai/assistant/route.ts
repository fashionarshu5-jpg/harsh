export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 26;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'prompt required' }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt.slice(0, 4000),
      config: {
        systemInstruction:
          'You are the AI fashion assistant of ARSHU, a luxury Indo-Western womenswear atelier in Surat. Be specific, elegant and practical. You only suggest: nothing you write is published automatically.',
      },
    });
    return NextResponse.json({ text: res.text || '' });
  } catch {
    return NextResponse.json({ error: 'The assistant is busy. Try again shortly.' }, { status: 502 });
  }
}
