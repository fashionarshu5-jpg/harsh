'use client';
import { useState } from 'react';
import { opt } from '@/lib/util';

type Pin = { x: number; y: number; label: string; spec: string };

/** Split-screen: artistic croquis (left) + vector technical flat with clickable stitch hotspots (right). */
export default function SketchViewer({ s }: { s: any }) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [active, setActive] = useState<number | null>(null);
  const pins: Pin[] = side === 'front' ? s.hotspotPins || [] : [];
  const flat = side === 'front' ? s.technicalFlatFrontUrl : s.technicalFlatBackUrl;
  return (
    <section style={{ marginBottom: 64 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 38 }}>{s.title}</h2>
        {s.specSheetPdfUrl && <a className="btn dark" href={s.specSheetPdfUrl} download>Download tailor spec sheet (PDF)</a>}
      </div>
      <div className="split">
        <div>
          <p className="eyebrow">12-head croquis</p>
          {s.illustrationUrl ? <img src={opt(s.illustrationUrl)} alt={`${s.title} illustration`} /> : <p className="muted">No illustration yet.</p>}
        </div>
        <div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p className="eyebrow">Technical flat</p>
            <div className="row">
              {(['front', 'back'] as const).map((k) => <button key={k} className={`ab ${side === k ? 'dk' : ''}`} onClick={() => { setSide(k); setActive(null); }}>{k}</button>)}
            </div>
          </div>
          {flat ? (
            <div className="flat">
              <img src={opt(flat)} alt={`${s.title} technical flat ${side}`} />
              {pins.map((p, i) => (
                <button key={i} className={`pin ${active === i ? 'on' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={() => setActive(i)} aria-label={p.label}>{i + 1}</button>
              ))}
            </div>
          ) : <p className="muted">No flat uploaded.</p>}
          {active !== null && pins[active] && <div className="callout"><b>{pins[active].label}</b><div>{pins[active].spec}</div></div>}
          {side === 'front' && pins.length > 0 && active === null && <p className="muted" style={{ fontSize: 13 }}>Tap a numbered pin for stitch, dart and seam-allowance details.</p>}
        </div>
      </div>
    </section>
  );
}
