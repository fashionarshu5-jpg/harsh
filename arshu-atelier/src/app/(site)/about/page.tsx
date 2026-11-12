import { getSettings } from '@/lib/settings';

export default async function About() {
  const s = await getSettings();
  return (
    <div className="wrap sec" style={{ maxWidth: 860 }}>
      <p className="eyebrow">The atelier</p><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', margin: '8px 0 28px' }}>About {s.brandName}</h1>
      <p style={{ fontSize: 19, whiteSpace: 'pre-line' }}>{s.aboutEditorial || 'The atelier story will appear here. Edit it in Admin → Website Customization.'}</p>
      <p className="muted">{s.socialLinks.atelier_location || 'Surat, Gujarat'}</p>
    </div>
  );
}
