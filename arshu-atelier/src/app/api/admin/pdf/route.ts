export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const file = (await req.formData()).get('file') as File | null;
    if (!file || file.type !== 'application/pdf' || file.size > 8_000_000)
      return NextResponse.json({ error: 'Upload a PDF under 8 MB' }, { status: 400 });
    const key = `${crypto.randomUUID()}.pdf`;
    await getStore('specs').set(key, await file.arrayBuffer());
    return NextResponse.json({ url: `/api/files/${key}` });
  } catch (e: any) {
    return NextResponse.json({ error: 'PDF storage works only on the live Netlify site. ' + (e?.message || '') }, { status: 500 });
  }
}
