'use client';
import { useEffect, useState } from 'react';
import { Field, RESOURCES } from '@/lib/admin-config';
import { uploadMedia, uploadPdf } from './upload';

type Pin = { x: number; y: number; label: string; spec: string };

function Hotspots({ value, image, onChange }: { value: Pin[]; image: string; onChange: (v: Pin[]) => void }) {
  const pins = value || [];
  const add = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange([...pins, { x: +(((e.clientX - r.left) / r.width) * 100).toFixed(1), y: +(((e.clientY - r.top) / r.height) * 100).toFixed(1), label: '', spec: '' }]);
  };
  const set = (i: number, patch: Partial<Pin>) => onChange(pins.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  return (
    <div>
      {image ? (
        <div className="hs" onClick={add}>
          <img src={image} alt="technical flat" />
          {pins.map((p, i) => <span key={i} className="pin" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{i + 1}</span>)}
        </div>
      ) : <p className="muted">Upload the front technical flat first, then click on it to place pins.</p>}
      {pins.map((p, i) => (
        <div key={i} className="g2" style={{ marginTop: 8, alignItems: 'end' }}>
          <label>Pin {i + 1} label<input value={p.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="e.g. Princess seam" /></label>
          <label>Spec<input value={p.spec} onChange={(e) => set(i, { spec: e.target.value })} placeholder="e.g. 1 cm seam allowance, 12 stitches/inch" /></label>
          <button type="button" className="ab" onClick={() => onChange(pins.filter((_, k) => k !== i))}>Remove pin</button>
        </div>
      ))}
    </div>
  );
}

function ListUploader({ value, onChange, mode }: { value: any[]; onChange: (v: any[]) => void; mode: 'images' | 'refs' }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const list = value || [];
  async function add(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    try {
      const out = [];
      for (const f of Array.from(files)) {
        const url = await uploadMedia(f);
        out.push(mode === 'images' ? { url, angle: list.length + out.length === 0 ? 'front' : 'detail' } : { url, caption: '', tags: [] });
      }
      onChange([...list, ...out]);
    } catch (e: any) { alert(e.message); }
    setBusy(false);
  }
  const patch = (i: number, p: any) => onChange(list.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => { const a = [...list]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={(e) => add(e.target.files)} disabled={busy} />
      {busy && <p>Uploading…</p>}
      {list.map((x, i) => (
        <div key={i} className="li">
          <img className="thumb" src={x.url} alt="" />
          {mode === 'images'
            ? <select style={{ width: 150 }} value={x.angle} onChange={(e) => patch(i, { angle: e.target.value })}>{['front', 'back', 'silhouette', 'detail'].map((a) => <option key={a}>{a}</option>)}</select>
            : <><input style={{ flex: 1 }} placeholder="Caption" value={x.caption} onChange={(e) => patch(i, { caption: e.target.value })} />
              <input style={{ width: 160 }} placeholder="tags, comma" value={(x.tags || []).join(', ')} onChange={(e) => patch(i, { tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} /></>}
          <span className="row"><button type="button" className="ab" onClick={() => move(i, -1)}>↑</button><button type="button" className="ab" onClick={() => move(i, 1)}>↓</button><button type="button" className="ab" onClick={() => onChange(list.filter((_, k) => k !== i))}>Delete</button></span>
        </div>
      ))}
    </div>
  );
}

export default function ResourceManager({ resource }: { resource: string }) {
  const cfg = RESOURCES[resource];
  const [items, setItems] = useState<any[]>([]);
  const [cols, setCols] = useState<any[]>([]);
  const [mats, setMats] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const getList = async (name: string): Promise<any[]> => {
    try {
      const j = await fetch(`/api/admin/resource/${name}`, { cache: 'no-store' }).then((r) => r.json());
      if (Array.isArray(j)) return j;
      setMsg('❌ Could not load the list: ' + (j?.error || 'unexpected answer') + ' (open System Check, and log in again if your session ended)');
    } catch { setMsg('❌ Could not reach the server.'); }
    return [];
  };
  const load = async () => {
    setItems(await getList(resource));
    if (cfg.fields.some((f) => f.type === 'collection')) setCols(await getList('collections'));
    if (cfg.fields.some((f) => f.type === 'materials')) setMats(await getList('materials'));
  };
  useEffect(() => { load(); }, [resource]);

  const blank = () => Object.fromEntries(cfg.fields.map((f) => [f.key,
    ['images', 'refs', 'hotspots', 'colors', 'materials'].includes(f.type) ? [] : f.type === 'number' ? 0 : f.type === 'select' ? f.options![0] : f.type === 'color' ? '#C5A880' : '']));
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save(publish = false) {
    setBusy(true); setMsg('');
    const payload = publish ? { ...form, status: 'published' } : form;
    try {
      const r = await fetch(`/api/admin/resource/${resource}`, { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) return setMsg('❌ Not saved: ' + (j.error || `server error ${r.status}`) + ' (see Admin > System Check)');
      setMsg(!cfg.hasStatus || payload.status === 'published' ? '✅ Saved – it is live on the website now.' : '✅ Saved as DRAFT – click "Publish" in the list to show it on the website.');
      setForm(null); load();
    } catch { setBusy(false); setMsg('❌ Network error – nothing was saved.'); }
  }
  async function toggle(it: any) {
    const r = await fetch(`/api/admin/resource/${resource}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, status: it.status === 'published' ? 'draft' : 'published' }) });
    setMsg(r.ok ? (it.status === 'published' ? '✅ Hidden from the website.' : '✅ Published – live on the website now.') : '❌ Could not change status.');
    load();
  }
  async function del(it: any) {
    if (!confirm('Delete permanently?')) return;
    await fetch(`/api/admin/resource/${resource}?id=${it.id}`, { method: 'DELETE' }); load();
  }
  async function preview(it: any) {
    const j = await fetch('/api/admin/preview-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outfitId: it.id }) }).then((r) => r.json());
    await navigator.clipboard.writeText(j.url).catch(() => {});
    prompt('Private preview link (copied). Open it on your phone:', j.url);
  }

  function render(f: Field) {
    const v = form[f.key];
    switch (f.type) {
      case 'textarea': return <textarea rows={4} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />;
      case 'number': return <input type="number" value={v ?? 0} onChange={(e) => set(f.key, e.target.value)} />;
      case 'color': return <input type="color" value={v || '#C5A880'} onChange={(e) => set(f.key, e.target.value)} style={{ height: 44, width: 90, padding: 2 }} />;
      case 'select': return <select value={v} onChange={(e) => set(f.key, e.target.value)}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
      case 'colors': return <input defaultValue={(v || []).join(', ')} onBlur={(e) => set(f.key, e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} placeholder="#D97443, #C5A880" />;
      case 'collection': return <select value={v || ''} onChange={(e) => set(f.key, e.target.value)}><option value="">— none —</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>;
      case 'materials': return <div className="row">{mats.map((m) => <label key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><input type="checkbox" style={{ width: 'auto' }} checked={(v || []).includes(m.id)} onChange={(e) => set(f.key, e.target.checked ? [...(v || []), m.id] : (v || []).filter((x: string) => x !== m.id))} />{m.materialName}</label>)}{mats.length === 0 && <span className="muted">Add materials first.</span>}</div>;
      case 'images': return <ListUploader mode="images" value={v} onChange={(x) => set(f.key, x)} />;
      case 'refs': return <ListUploader mode="refs" value={v} onChange={(x) => set(f.key, x)} />;
      case 'hotspots': return <Hotspots value={v} image={form.technicalFlatFrontUrl} onChange={(x) => set(f.key, x)} />;
      case 'image': case 'video': case 'pdf':
        return (
          <div className="row">
            {v && f.type === 'image' && <img className="thumb" src={v} alt="" />}
            {v && f.type !== 'image' && <a href={v} target="_blank" rel="noreferrer">current file ↗</a>}
            <input type="file" accept={f.type === 'image' ? 'image/*' : f.type === 'video' ? 'video/mp4' : 'application/pdf'} onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              try { set(f.key, f.type === 'pdf' ? await uploadPdf(file) : await uploadMedia(file)); setMsg('📎 File uploaded. Now press Save (or Save & Publish) to apply it.'); } catch (err: any) { alert(err.message); }
            }} />
          </div>
        );
      default: return <input value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />;
    }
  }

  return (
    <div className="panel">
      <div className="li"><h3>{cfg.title}</h3><button className="ab pri" onClick={() => setForm(blank())}>+ New {cfg.singular}</button></div>
      {msg && <div className="li" style={{ background: '#faf8f4', padding: 12 }}><b>{msg}</b>{msg.startsWith('✅') && <a href="/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open website ↗</a>}</div>}
      {form && (
        <div className="panel" style={{ background: '#faf8f4' }}>
          {cfg.fields.map((f) => <label key={f.key}>{f.label}{f.hint && <small className="muted">{f.hint}</small>}{render(f)}</label>)}
          <div className="row"><button className="ab dk" onClick={() => save()} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>{cfg.hasStatus && <button className="ab pri" onClick={() => save(true)} disabled={busy}>Save &amp; Publish</button>}<button className="ab" onClick={() => setForm(null)}>Cancel</button></div>
        </div>
      )}
      {items.map((it) => (
        <div className="li" key={it.id}>
          <span>{resource === 'outfits' && <b>{it.lookNumber} · </b>}{it[cfg.titleKey]} {cfg.hasStatus && <span className={`badge ${it.status}`}>{it.status}</span>}</span>
          <span className="row">
            {cfg.hasStatus && <button className="ab" onClick={() => toggle(it)}>{it.status === 'published' ? 'Unpublish' : 'Publish'}</button>}
            {resource === 'outfits' && <button className="ab" onClick={() => preview(it)}>Preview link</button>}
            <button className="ab" onClick={() => setForm({ ...blank(), ...it })}>Edit</button>
            <button className="ab" onClick={() => del(it)}>Delete</button>
          </span>
        </div>
      ))}
      {items.length === 0 && <p className="muted">Nothing here yet.</p>}
    </div>
  );
}
