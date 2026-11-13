export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { signPreview } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { outfitId } = await req.json();
  if (!outfitId) return NextResponse.json({ error: 'outfitId required' }, { status: 400 });
  const token = await signPreview(outfitId);
  return NextResponse.json({ url: `${req.nextUrl.origin}/preview/outfit?token=${token}` });
}
