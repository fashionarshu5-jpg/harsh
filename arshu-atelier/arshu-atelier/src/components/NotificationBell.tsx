'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationBell() {
  const [d, setD] = useState<{ items: any[]; unread: number }>({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const load = () => fetch('/api/admin/notifications', { cache: 'no-store' }).then((r) => r.json()).then((j) => { if (j && Array.isArray(j.items)) setD(j); }).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);
  async function toggle() {
    setOpen(!open);
    if (!open && d.unread) { await fetch('/api/admin/notifications', { method: 'PATCH' }); setTimeout(load, 1500); }
  }
  return (
    <div className="bell">
      <button className="ab" onClick={toggle} aria-label="Notifications">Notifications{d.unread > 0 && <span className="n">{d.unread}</span>}</button>
      {open && (
        <div className="drop">
          {d.items.length === 0 && <p className="muted">Nothing yet.</p>}
          {d.items.map((n) => (
            <div key={n.id} className="li" style={{ display: 'block' }}>
              <b style={{ fontSize: 13 }}>{n.title}</b><div style={{ fontSize: 13 }}>{n.message}</div>
              {n.type === 'approval_needed' && <Link href="/admin/approvals" style={{ fontSize: 13, textDecoration: 'underline' }}>Review →</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
