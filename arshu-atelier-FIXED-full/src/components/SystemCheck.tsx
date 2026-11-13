'use client';
import { useState } from 'react';

export default function SystemCheck() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function run() {
    setBusy(true); setErr(''); setRows(null);
    try {
      const r = await fetch('/api/admin/diagnostics', { cache: 'no-store' });
      const t = await r.text();
      try { setRows(JSON.parse(t)); } catch { setErr(`Server answered with status ${r.status} (not JSON).`); }
    } catch { setErr('Could not reach the server.'); }
    setBusy(false);
  }
  const failed = rows?.filter((r) => !r.ok).length ?? 0;
  return (
    <div className="panel">
      <div className="li"><h3>Live system check</h3><button className="ab pri" onClick={run} disabled={busy}>{busy ? 'Testing… (up to 30 s)' : 'Run system check'}</button></div>
      <p className="muted">Tests your database, saving, AI agent, image storage and PDF storage on the real live site.</p>
      {err && <p className="err">{err}</p>}
      {rows && <p><b>{failed === 0 ? '✅ Everything works.' : `❌ ${failed} problem${failed > 1 ? 's' : ''} found. Fix the first red item first.`}</b></p>}
      {rows?.map((r, i) => (
        <div key={i} className="li" style={{ display: 'block' }}>
          <b>{r.ok ? '✅' : '❌'} {r.name}</b>
          <div style={{ fontSize: 13 }}>{r.detail}</div>
          {!r.ok && r.fix && <div style={{ fontSize: 13, color: '#B3341B' }}>How to fix: {r.fix}</div>}
        </div>
      ))}
    </div>
  );
}
