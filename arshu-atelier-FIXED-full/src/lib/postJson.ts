/** fetch helper that never throws and always explains what went wrong (instead of silently failing). */
export async function postJson(url: string, body: any): Promise<any> {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await r.text();
    try { return JSON.parse(text); }
    catch { return { error: `Server answered with status ${r.status} (not JSON). This usually means a timeout or a crash – check Netlify > Logs > Functions.` }; }
  } catch { return { error: 'Could not reach the server. Check your internet connection.' }; }
}
