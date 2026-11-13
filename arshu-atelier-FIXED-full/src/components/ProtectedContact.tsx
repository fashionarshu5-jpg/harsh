'use client';
import { useEffect, useState } from 'react';

/** Phone/email arrive encoded and are decoded in the browser, so simple scrapers reading the HTML don't see them. */
export default function ProtectedContact({ kind, data }: { kind: 'phone' | 'email'; data: string }) {
  const [v, setV] = useState('');
  useEffect(() => { try { setV(atob(data)); } catch { setV(''); } }, [data]);
  if (!v) return <span className="muted">Please use the form to reach us.</span>;
  return <a href={kind === 'phone' ? `tel:${v.replace(/[^+\d]/g, '')}` : `mailto:${v}`} style={{ borderBottom: '1px solid' }}>{v}</a>;
}
