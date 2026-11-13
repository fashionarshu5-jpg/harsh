import Link from 'next/link';

export default function EmptyNote({ what }: { what: string }) {
  return (
    <div style={{ padding: '24px 0' }}>
      <p className="muted" style={{ fontSize: 18, maxWidth: 560 }}>{what} are being prepared in the atelier and will be added soon.</p>
      <p><Link href="/collections" className="btn">Explore Collections &nbsp;✦</Link></p>
    </div>
  );
}
