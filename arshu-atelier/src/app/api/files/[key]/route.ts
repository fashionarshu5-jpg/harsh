export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getStore } from '@netlify/blobs';

export const runtime = 'nodejs';

export async function GET(_: NextRequest, { params }: { params: { key: string } }) {
  if (!/^[0-9a-f-]{36}\.pdf$/.test(params.key)) return new Response('Not found', { status: 404 });
  try {
    const data = await getStore('specs').get(params.key, { type: 'arrayBuffer' });
    if (!data) return new Response('Not found', { status: 404 });
    return new Response(data, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="arshu-spec-sheet.pdf"' } });
  } catch { return new Response('Not found', { status: 404 }); }
}
