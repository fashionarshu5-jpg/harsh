import Header from '@/components/Header';
import { getSettings } from '@/lib/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const h = s.homeContent;
  return (
    <>
      <Header brand={s.brandName} tagline={h.brandTagline} button={h.headerButton} instagram={s.socialLinks.instagram_url || ''} />
      {children}
      <footer className="footer">
        <div><div className="display" style={{ fontFamily: 'var(--font-heading)', fontSize: 30, letterSpacing: '.3em' }}>{s.brandName}</div>
          <p style={{ margin: '6px 0 0', opacity: .8 }}>{s.socialLinks.atelier_location || 'Atelier, Surat, Gujarat'}</p></div>
        <div style={{ opacity: .85 }}>{s.contactEmail && <div>{s.contactEmail}</div>}{s.contactInstagram && <div>{s.contactInstagram}</div>}</div>
      </footer>
    </>
  );
}
