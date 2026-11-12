'use client';
import { useState } from 'react';

export default function Login() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) location.href = '/admin'; else { setErr('Invalid username or password'); setBusy(false); }
  }
  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1 style={{ fontSize: 40, letterSpacing: '.2em' }}>ARSHU</h1><p className="muted" style={{ margin: 0 }}>Atelier admin</p>
        <label>Username<input name="username" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {err && <div className="err">{err}</div>}
        <button className="ab dk" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
