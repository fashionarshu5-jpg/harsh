'use client';
export default function LogoutButton() {
  return <button className="ab" onClick={async () => { await fetch('/api/admin/auth', { method: 'DELETE' }); location.href = '/admin/login'; }}>Log out</button>;
}
