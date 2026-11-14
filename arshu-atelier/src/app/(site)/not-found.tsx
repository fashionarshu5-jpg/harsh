import NotFoundView from '@/components/NotFoundView';

export const metadata = { title: 'Page not found', robots: { index: false } };
// Used when a site page calls notFound() (unknown collection, look or material) - keeps the header and footer.
export default function SiteNotFound() { return <NotFoundView />; }
