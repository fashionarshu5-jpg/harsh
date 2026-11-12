import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import LogoutButton from '@/components/LogoutButton';

export const metadata = { title: 'ARSHU Admin', robots: { index: false, follow: false } };

const NAV: [string, string][] = [
  ['/admin', 'Overview'], ['/admin/collections', 'Collections'], ['/admin/outfits', 'Outfits (Looks)'], ['/admin/moodboards', 'Moodboards'],
  ['/admin/sketches', 'Sketches Studio'], ['/admin/materials', 'Material Archive'], ['/admin/ai', 'AI Fashion Agent'],
  ['/admin/approvals', 'Approvals'], ['/admin/settings', 'Website Customization'], ['/', 'View live site ↗'],
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <aside><div className="logo"><b>ARSHU</b></div>{NAV.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</aside>
      <div>
        <header><strong>Dashboard</strong><span className="row"><NotificationBell /><LogoutButton /></span></header>
        <main>{children}</main>
      </div>
    </div>
  );
}
