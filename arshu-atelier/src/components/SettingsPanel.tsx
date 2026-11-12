'use client';
import { useState } from 'react';
import { BODY_FONTS, HEADING_FONTS } from '@/lib/admin-config';
import { uploadMedia } from './upload';

const COLORS: [string, string, string][] = [
  ['primaryIvory', 'Primary Ivory (canvas)', '--ivory'], ['surfaceStone', 'Surface Stone', '--stone'],
  ['accentCharcoal', 'Editorial Charcoal', '--charcoal'], ['accentGold', 'Muted Gold', '--gold'], ['accentTerracotta', 'Terracotta', '--terracotta'],
];
const HOME: [string, string, boolean?][] = [
  ['eyebrow', 'Hero small title'], ['headline1', 'Headline line 1'], ['headline2', 'Headline line 2 (italic)'],
  ['subtext', 'Hero subtext', true], ['buttonLabel', 'Hero button label'], ['buttonLink', 'Hero button link'],
  ['location', 'Location line (use — to split)'], ['headerButton', 'Header button text'], ['brandTagline', 'Tagline under logo'],
  ['collectionsLabel', 'Strip small label'], ['collectionsHeading1', 'Strip heading line 1'], ['collectionsHeading2', 'Strip heading line 2 (italic)'],
  ['collectionsTagline', 'Strip tagline'], ['collectionsLink', 'Strip link text'],
];

export default function SettingsPanel({ initial }: { initial: any }) {
  const [s, setS] = useState<any>(initial);
  const [msg, setMsg] = useState('');
  const root = () => document.documentElement.style;

  function color(key: string, cssVar: string, v: string) { setS((p: any) => ({ ...p, [key]: v })); root().setProperty(cssVar, v); }
  function font(key: 'fontHeading' | 'fontBody', v: string) {
    setS((p: any) => ({ ...p, [key]: v }));
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${v.replace(/ /g, '+')}:ital,wght@0,400;0,500;1,400&display=swap`;
    document.head.appendChild(l);
    root().setProperty(key === 'fontHeading' ? '--font-heading' : '--font-body', `'${v}',serif`);
  }
  const home = (k: string, v: string) => setS((p: any) => ({ ...p, homeContent: { ...p.homeContent, [k]: v } }));
  const social = (k: string, v: string) => setS((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  async function publish() {
    setMsg('Publishing…');
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    setMsg(r.ok ? 'Published — the public site is updated.' : 'Could not publish.');
  }

  return (
    <>
      <div className="panel">
        <h3>Brand colours (live preview)</h3>
        <div className="g2">{COLORS.map(([k, label, v]) => (
          <label key={k}>{label}<span className="row"><input type="color" value={s[k]} onChange={(e) => color(k, v, e.target.value)} style={{ width: 70, height: 44, padding: 2 }} /><code>{s[k]}</code></span></label>
        ))}</div>
        <div className="g2">
          <label>Headline font<select value={s.fontHeading} onChange={(e) => font('fontHeading', e.target.value)}>{HEADING_FONTS.map((f) => <option key={f}>{f}</option>)}</select></label>
          <label>Body font<select value={s.fontBody} onChange={(e) => font('fontBody', e.target.value)}>{BODY_FONTS.map((f) => <option key={f}>{f}</option>)}</select></label>
        </div>
        <div style={{ background: 'var(--ivory)', border: '1px solid #ddd', padding: 24 }}>
          <div className="eyebrow">Preview</div><h2 style={{ fontSize: 44 }}>Where Heritage <i>Meets Modernity</i></h2>
          <p>Body text sample in your chosen font.</p>
          <span className="btn">Discover Our Collection</span> <span className="chip" style={{ background: 'var(--gold)' }}>Gold</span>
        </div>
      </div>
      <div className="panel">
        <h3>Homepage text &amp; hero image</h3>
        <div className="g2">{HOME.map(([k, label, big]) => (
          <label key={k}>{label}{big ? <textarea rows={2} value={s.homeContent[k] || ''} onChange={(e) => home(k, e.target.value)} /> : <input value={s.homeContent[k] || ''} onChange={(e) => home(k, e.target.value)} />}</label>
        ))}</div>
        <div className="row">{s.homeContent.heroImage && <img className="thumb" src={s.homeContent.heroImage} alt="" />}
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) try { home('heroImage', await uploadMedia(f)); } catch (x: any) { alert(x.message); } }} /></div>
      </div>
      <div className="panel">
        <h3>Brand story, atelier &amp; contact</h3>
        <label>Brand name<input value={s.brandName} onChange={(e) => setS({ ...s, brandName: e.target.value })} /></label>
        <label>About / brand story / manifesto<textarea rows={8} value={s.aboutEditorial} onChange={(e) => setS({ ...s, aboutEditorial: e.target.value })} /></label>
        <div className="g2">
          <label>Atelier location<input value={s.socialLinks.atelier_location || ''} onChange={(e) => social('atelier_location', e.target.value)} placeholder="Surat, Gujarat" /></label>
          <label>Phone<input value={s.socialLinks.phone || ''} onChange={(e) => social('phone', e.target.value)} /></label>
          <label>Contact email<input value={s.contactEmail} onChange={(e) => setS({ ...s, contactEmail: e.target.value })} /></label>
          <label>Instagram handle<input value={s.contactInstagram} onChange={(e) => setS({ ...s, contactInstagram: e.target.value })} placeholder="@yourhandle" /></label>
          <label>Instagram link<input value={s.socialLinks.instagram_url || ''} onChange={(e) => social('instagram_url', e.target.value)} placeholder="https://instagram.com/..." /></label>
        </div>
      </div>
      <div className="row"><button className="ab pri" onClick={publish}>Publish to live site</button><span>{msg}</span></div>
    </>
  );
}
