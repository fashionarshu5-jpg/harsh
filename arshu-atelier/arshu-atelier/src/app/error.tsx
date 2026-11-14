'use client';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <h1 style={{ fontSize: 40 }}>Something went wrong</h1>
        <p style={{ opacity: 0.7 }}>Please try again. {error?.digest ? `(code ${error.digest})` : ''}</p>
        <button className="btn" onClick={() => reset()}>Try again</button>
      </div>
    </div>
  );
}
