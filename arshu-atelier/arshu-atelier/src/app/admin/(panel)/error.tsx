'use client';

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="panel">
      <h3>Something went wrong on this page</h3>
      <p className="err" style={{ whiteSpace: 'pre-wrap' }}>{error?.message || 'Unknown error'}</p>
      {error?.digest && <p className="muted">Error code: {error.digest}</p>}
      <p className="muted">Try: Try again, then log out and log in again. If it repeats, send this message to your developer.</p>
      <div className="row">
        <button className="ab dk" onClick={() => reset()}>Try again</button>
        <a className="ab" href="/admin">Back to Overview</a>
        <a className="ab" href="/admin/system">Open System Check</a>
      </div>
    </div>
  );
}
