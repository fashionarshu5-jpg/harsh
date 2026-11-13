import { notFound } from 'next/navigation';
import ResourceManager from '@/components/ResourceManager';
import { RESOURCES } from '@/lib/admin-config';

export default function ResourcePage({ params }: { params: { resource: string } }) {
  if (!RESOURCES[params.resource]) notFound();
  return <><h1 style={{ fontSize: 38 }}>{RESOURCES[params.resource].title}</h1><ResourceManager key={params.resource} resource={params.resource} /></>;
}
