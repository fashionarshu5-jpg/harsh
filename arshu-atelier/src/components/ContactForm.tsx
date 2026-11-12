'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setState(r.ok ? 'done' : 'error');
  }
  if (state === 'done') return <p className="display" style={{ fontSize: 28 }}>Thank you — the atelier will contact you shortly.</p>;
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
      <label>Name<input name="name" required /></label>
      <label>Phone<input name="phone" type="tel" /></label>
      <label>Email<input name="email" type="email" /></label>
      <label>Preferred date<input name="date" type="date" /></label>
      <label>Message<textarea name="message" rows={4} /></label>
      <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Request couture appointment'}</button>
      {state === 'error' && <p className="err">Please add your name and a phone or email.</p>}
    </form>
  );
}
