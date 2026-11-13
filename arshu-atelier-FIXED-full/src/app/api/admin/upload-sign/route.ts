export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Browser uploads straight to Cloudinary; the secret never leaves the server.
export async function POST() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'arshu';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest('hex');
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
