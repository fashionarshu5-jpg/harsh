'use client';
export default function PreviewButton({ id }: { id: string }) {
  return (
    <button className="ab" onClick={async () => {
      const j = await fetch('/api/admin/preview-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outfitId: id }) }).then((r) => r.json());
      await navigator.clipboard.writeText(j.url).catch(() => {});
      prompt('Private preview link (copied). Open it on your phone:', j.url);
    }}>Preview link</button>
  );
}
