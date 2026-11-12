'use client';
import { useEffect, useState } from 'react';

export default function ApprovalsList() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => fetch('/api/admin/approvals').then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);
  async function act(id: string, action: 'approve' | 'reject') {
    await fetch('/api/admin/approvals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    load();
  }
  const pending = rows.filter((r) => r.status === 'pending');
  return (
    <>
      <div className="panel"><h3>Waiting for your decision ({pending.length})</h3>
        <p className="muted">Approved suggestions are created as <b>drafts</b>. You still publish them manually.</p>
        {pending.map((r) => (
          <div key={r.id} className="li" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 260 }}><span className="badge">{r.moduleTarget}</span><b> {r.suggestedPayload.title || r.suggestedPayload.materialName}</b>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: '6px 0' }}>{JSON.stringify(r.suggestedPayload, null, 1).slice(0, 700)}</pre></div>
            <span className="row"><button className="ab dk" onClick={() => act(r.id, 'approve')}>Approve</button><button className="ab" onClick={() => act(r.id, 'reject')}>Reject</button></span>
          </div>
        ))}
        {pending.length === 0 && <p className="muted">All clear.</p>}
      </div>
      <div className="panel"><h3>History</h3>
        {rows.filter((r) => r.status !== 'pending').map((r) => <div key={r.id} className="li"><span>{r.moduleTarget} — {r.suggestedPayload.title || r.suggestedPayload.materialName}</span><span className="badge">{r.status}</span></div>)}
      </div>
    </>
  );
}
