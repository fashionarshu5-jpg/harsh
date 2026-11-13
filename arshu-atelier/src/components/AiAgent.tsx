'use client';
import { useState } from 'react';
import { RESEARCH_CATEGORIES } from '@/lib/admin-config';
import { postJson } from '@/lib/postJson';

const QUICK = [
  ['Draft Technical Spec', 'Draft a tailor technical specification for an Indo-Western structured jacket with mirror-work yoke: seam allowances, darts, interfacing, closures, stitch density.'],
  ['Suggest Surface Ornamentation', 'Suggest surface ornamentation ideas combining Kutch mirror-work with modern tailoring for a monochrome look.'],
  ['Write Collection Story', 'Write a 150-word luxury editorial collection story for an Indo-Western collection rooted in Kutch craft.'],
];

export default function AiAgent() {
  const [region, setRegion] = useState('Worldwide');
  const [cats, setCats] = useState<string[]>([RESEARCH_CATEGORIES[1]]);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);
  const [chat, setChat] = useState('');
  const [reply, setReply] = useState('');
  const [thinking, setThinking] = useState(false);

  async function run() {
    if (!cats.length) return setStatus('Select at least one category.');
    setRunning(true); setItems([]);
    const errs: string[] = [];
    for (let i = 0; i < cats.length; i++) {
      setStatus(`Researching ${i + 1}/${cats.length}: ${cats[i]}…`);
      const j = await postJson('/api/admin/ai/research', { category: cats[i], region });
      if (j.items) setItems((p) => [...p, ...j.items.map((x: any) => ({ ...x, mode: j.mode }))]);
      else errs.push(`${cats[i]}: ${j.error || 'failed'}${j.detail ? ' (' + j.detail + ')' : ''}`);
    }
    setRunning(false); setStatus(errs.length ? '❌ ' + errs.join(' | ') : '✅ Research finished. Review the cards below.');
  }

  const act = async (e: any, what: 'save' | 'moodboard' | 'material') => {
    if (what === 'save') {
      await fetch('/api/admin/resource/research', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: e.id, isSaved: true }) });
      setItems((p) => p.map((x) => (x.id === e.id ? { ...x, isSaved: true } : x)));
      return;
    }
    const cd = e.creativeDirection || {};
    const payload = what === 'moodboard'
      ? { title: e.title, culturalRoots: `${e.summary}\n\n${e.arshuInspiration}`, colorStory: [], references: [] }
      : { materialName: (cd.fabrics || [])[0] || e.title, materialType: 'Textile', textureDescription: (cd.fabrics || []).join(', '), embroideryCraftTechnique: (cd.craft || []).join(', '), usageNotes: e.arshuInspiration };
    await fetch('/api/admin/approvals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleTarget: what, suggestedPayload: payload }) });
    alert('Sent to Approvals. Nothing goes live until you approve it.');
  };

  async function ask(p: string) {
    setThinking(true); setReply('');
    const j = await postJson('/api/admin/ai/assistant', { prompt: p });
    setReply(j.text || `❌ ${j.error || 'No answer'}${j.detail ? '\n\n' + j.detail : ''}`); setThinking(false);
  }

  return (
    <>
      <div className="panel">
        <h3>AI research agent (manual only)</h3>
        <label>Region<select value={region} onChange={(e) => setRegion(e.target.value)}><option>Worldwide</option><option>India</option><option value="Balanced">Balanced 50/50 (India + Paris/Milan)</option></select></label>
        <div className="row">{RESEARCH_CATEGORIES.map((c) => (
          <label key={c} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={cats.includes(c)} onChange={(e) => setCats(e.target.checked ? [...cats, c] : cats.filter((x) => x !== c))} />{c}</label>
        ))}</div>
        <div className="row"><button className="ab pri" onClick={run} disabled={running}>START AI RESEARCH</button><span>{status}</span></div>
      </div>
      {items.map((e) => (
        <div className="panel" key={e.id}>
          <span className="badge">{e.category} · {e.region} · {e.mode === 'live' ? 'live search' : 'conceptual'}</span>
          <h2 style={{ fontSize: 30 }}>{e.title}</h2>
          <div className="muted">{e.designerOrBrand} {e.eventDate && `· ${e.eventDate}`}</div>
          <p><b>What is happening?</b> {e.summary}</p>
          <p><b>Why is it important?</b> {e.importance}</p>
          <p><b>Design inspiration for ARSHU:</b> {e.arshuInspiration}</p>
          <p><b>Creative direction</b> — Fabrics: {(e.creativeDirection?.fabrics || []).join(', ')}; Colours: {(e.creativeDirection?.colors || []).join(', ')}; Silhouettes: {(e.creativeDirection?.silhouettes || []).join(', ')}; Craft: {(e.creativeDirection?.craft || []).join(', ')}</p>
          <div className="row"><b>Sources:</b>{(e.sourceLinks || []).length ? e.sourceLinks.map((l: any, i: number) => <a key={i} className="chip" href={l.url} target="_blank" rel="noreferrer">{l.title.slice(0, 32)} ↗</a>) : <span className="muted">none verified (conceptual answer)</span>}</div>
          <div className="row">
            <button className="ab" disabled={e.isSaved} onClick={() => act(e, 'save')}>{e.isSaved ? 'Saved ✓' : 'Save to Research Library'}</button>
            <button className="ab" onClick={() => act(e, 'moodboard')}>Send to Moodboard</button>
            <button className="ab" onClick={() => act(e, 'material')}>Send to Material Archive</button>
          </div>
        </div>
      ))}
      <div className="panel">
        <h3>AI fashion assistant</h3>
        <div className="row">{QUICK.map(([l, p]) => <button key={l} className="ab" onClick={() => { setChat(p); ask(p); }}>{l}</button>)}</div>
        <textarea rows={3} value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Ask anything about design, fabrics, copywriting…" />
        <div><button className="ab dk" onClick={() => ask(chat)} disabled={thinking || !chat}>{thinking ? 'Thinking…' : 'Ask'}</button></div>
        {reply && <div style={{ whiteSpace: 'pre-wrap', background: '#faf8f4', padding: 16 }}>{reply}</div>}
      </div>
    </>
  );
}
