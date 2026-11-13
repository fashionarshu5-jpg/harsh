import Link from 'next/link';
import Header from '@/components/Header';
import { getSettings } from '@/lib/settings';
import { getEmptySections } from '@/lib/nav';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, empty] = await Promise.all([getSettings(), getEmptySections()]);
  const h = s.homeContent;
  return (
    <>
      <Header brand={s.brandName} tagline={h.brandTagline} button={h.headerButton} instagram={s.socialLinks.instagram_url || ''} hide={empty} />
      {children}
      <footer className="footer">
        <div><div className="display" style={{ fontFamily: 'var(--font-heading)', fontSize: 30, letterSpacing: '.3em' }}>{s.brandName}</div>
          <p style={{ margin: '6px 0 0', opacity: .8 }}>{s.socialLinks.atelier_location || 'Atelier, Surat, Gujarat'}</p></div>
        <div style={{ opacity: .85 }}>
          <div><Link href="/contact" style={{ borderBottom: '1px solid' }}>Book a couture appointment</Link></div>
          {s.contactInstagram && <div>{s.contactInstagram}</div>}
        </div>
      </footer>
    </>
  );
}
