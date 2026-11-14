import NotFoundView from '@/components/NotFoundView';

export const metadata = { title: 'Page not found', robots: { index: false } };
// Used for any URL that matches no page at all.
export default function NotFound() {
  return (
    <main><NotFoundView /></main>
  );
}
