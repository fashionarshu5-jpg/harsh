'use client';
import Link from 'next/link';
import { useState } from 'react';
import { opt } from '@/lib/util';

export default function MaterialsBrowser({ items }: { items: any[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');
  const types = ['All', ...Array.from(new Set(items.map((i) => i.materialType).filter(Boolean)))];
  const list = items.filter((m) => (type === 'All' || m.materialType === type) &&
    `${m.materialName} ${m.textureDescription} ${m.embroideryCraftTechnique}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="row" style={{ marginBottom: 28 }}>
        <input style={{ maxWidth: 320 }} placeholder="Search weave, texture, craft…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search materials" />
        {types.map((t) => <button key={t} className={`ab ${type === t ? 'dk' : ''}`} onClick={() => setType(t)}>{t}</button>)}
      </div>
      <div className="grid">
        {list.map((m) => (
          <Link key={m.id} href={`/materials/${m.id}`} className="tile">
            {m.swatchImageUrl ? <img className="ph" src={opt(m.swatchImageUrl, 'f_auto,q_auto,w_600')} alt={m.materialName} style={{ aspectRatio: '1' }} /> : <div className="ph" style={{ aspectRatio: '1', background: m.colorHex }} />}
            <span className="eyebrow">{m.materialType}</span><h3 style={{ fontSize: 26 }}>{m.materialName}</h3>
          </Link>
        ))}
        {list.length === 0 && <p className="muted">No materials found.</p>}
      </div>
    </div>
  );
}
