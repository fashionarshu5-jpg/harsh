'use client';
import { useState } from 'react';
import { opt } from '@/lib/util';

export default function MoodboardView({ boards }: { boards: any[] }) {
  const [mode, setMode] = useState<'masonry' | 'editorial_overlap' | null>(null);
  return (
    <div>
      <div className="row" style={{ marginBottom: 24 }}>
        <button className={`ab ${mode === 'masonry' ? 'dk' : ''}`} onClick={() => setMode('masonry')}>Masonry</button>
        <button className={`ab ${mode === 'editorial_overlap' ? 'dk' : ''}`} onClick={() => setMode('editorial_overlap')}>Layered editorial</button>
        <button className="ab" onClick={() => setMode(null)}>Each board's own layout</button>
      </div>
      {boards.map((b) => {
        const layout = mode || b.layoutType;
        return (
          <section key={b.id} style={{ marginBottom: 72 }}>
            <p className="eyebrow">Cultural roots</p>
            <h2 style={{ fontSize: 44, margin: '6px 0' }}>{b.title}</h2>
            <p className="muted" style={{ maxWidth: 680 }}>{b.culturalRoots}</p>
            <div className="row" style={{ margin: '12px 0 24px' }}>{(b.colorStory || []).map((c: string, i: number) => <span key={i} className="dot" style={{ background: c }} title={c} />)}</div>
            <div className={layout === 'masonry' ? 'masonry' : 'overlap'}>
              {(b.references || []).map((r: any, i: number) => (
                <figure key={i}><img src={opt(r.url, 'f_auto,q_auto,w_800')} alt={r.caption || b.title} /><figcaption>{r.caption}</figcaption></figure>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
