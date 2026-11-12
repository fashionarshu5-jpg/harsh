import './globals.css';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return { title: `${s.brandName} — ${s.homeContent.brandTagline}`, description: 'Luxury Indo-Western womenswear atelier, Surat.' };
}

const fam = (n: string, spec: string) => `family=${n.trim().replace(/ /g, '+')}:${spec}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const href = `https://fonts.googleapis.com/css2?${fam(s.fontHeading, 'ital,wght@0,400;0,500;1,400;1,500')}&${fam(s.fontBody, 'wght@400;500;600')}&display=swap`;
  const css = `:root{--ivory:${s.primaryIvory};--stone:${s.surfaceStone};--charcoal:${s.accentCharcoal};--gold:${s.accentGold};--terracotta:${s.accentTerracotta};--font-heading:'${s.fontHeading}',Georgia,serif;--font-body:'${s.fontBody}',system-ui,sans-serif}`;
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={href} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
