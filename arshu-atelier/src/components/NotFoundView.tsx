import Link from 'next/link';

/** Friendly branded "page not found" (replaces the blank/default 404). */
export default function NotFoundView({ brand = 'ARSHU' }: { brand?: string }) {
  return (
    <div className="wrap sec" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 style={{ fontSize: 'clamp(44px,7vw,84px)', margin: '8px 0 12px' }}>This page has moved</h1>
        <p className="muted" style={{ maxWidth: 520, margin: '0 auto 28px', fontSize: 18 }}>
          We couldn’t find the page you were looking for. It may have been renamed, or it is still being prepared in the {brand} atelier.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn">Back to Home &nbsp;✦</Link>
          <Link href="/collections" className="btn ghost">View Collections</Link>
        </div>
      </div>
    </div>
  );
}
