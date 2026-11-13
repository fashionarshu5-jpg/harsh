'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [['/', 'Home'], ['/collections', 'Collections'], ['/about', 'About'], ['/moodboards', 'Moodboards'],
  ['/sketches', 'Sketches'], ['/materials', 'Materials'], ['/research', 'Research'], ['/contact', 'Contact']];

export default function Header({ brand, tagline, button, instagram, hide = [] }: { brand: string; tagline: string; button: string; instagram: string; hide?: string[] }) {
  const path = usePathname();
  return (
    <header className="site-h">
      <Link href="/" className="logo"><b>{brand}</b><i>{tagline}</i></Link>
      <nav className="nav">
        {LINKS.filter(([h]) => !hide.includes(h)).map(([h, l]) => <Link key={h} href={h} className={(h === '/' ? path === '/' : path.startsWith(h)) ? 'on' : ''}>{l}</Link>)}
      </nav>
      <div className="h-right">
        {instagram && (
          <a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
          </a>
        )}
        <Link href="/collections" className="pill">{button} ✦</Link>
      </div>
    </header>
  );
}
