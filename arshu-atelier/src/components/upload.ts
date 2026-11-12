/** Direct browser -> Cloudinary upload (images and MP4 video). Returns the https URL. */
export async function uploadMedia(file: File): Promise<string> {
  const sig = await fetch('/api/admin/upload-sign', { method: 'POST' }).then((r) => r.json());
  if (sig.error) throw new Error(sig.error);
  const fd = new FormData();
  fd.append('file', file); fd.append('api_key', sig.apiKey); fd.append('timestamp', String(sig.timestamp));
  fd.append('signature', sig.signature); fd.append('folder', sig.folder);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: 'POST', body: fd });
  const j = await r.json();
  if (!j.secure_url) throw new Error(j.error?.message || 'Upload failed');
  return j.secure_url;
}
export async function uploadPdf(file: File): Promise<string> {
  const fd = new FormData(); fd.append('file', file);
  const j = await fetch('/api/admin/pdf', { method: 'POST', body: fd }).then((r) => r.json());
  if (!j.url) throw new Error(j.error || 'PDF upload failed');
  return j.url;
}
