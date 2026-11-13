import { GoogleGenAI } from '@google/genai';

// Change the model without touching code: set GEMINI_MODEL in Netlify (e.g. if Google retires this one).
export const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function getAi() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in Netlify environment variables.');
  return new GoogleGenAI({ apiKey: key });
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))]);
}

/** Turns Google's raw error into a plain sentence and never leaks the key. */
export function explainGeminiError(e: any): { error: string; detail: string } {
  let raw = String(e?.message || e || 'unknown error');
  const key = process.env.GEMINI_API_KEY;
  if (key) raw = raw.split(key).join('***');
  raw = raw.slice(0, 400);
  let error = 'The AI could not answer.';
  if (/not set/i.test(raw)) error = 'GEMINI_API_KEY is missing in Netlify. Add it and redeploy.';
  else if (/API key not valid|API_KEY_INVALID|UNAUTHENTICATED|ACCESS_TOKEN_TYPE_UNSUPPORTED|401|403|PERMISSION_DENIED/i.test(raw))
    error = 'Google rejected the GEMINI_API_KEY. Create a new key (Google Cloud Console > APIs & Services > Credentials > Create API key, limited to the Generative Language API), paste it into Netlify as GEMINI_API_KEY and redeploy.';
  else if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) error = 'Free AI limit reached. Wait a minute and try again.';
  else if (/404|NOT_FOUND|not found/i.test(raw)) error = `The model "${MODEL}" is not available for this key. Set GEMINI_MODEL in Netlify to another model name.`;
  else if (/TIMEOUT/i.test(raw)) error = 'The AI took too long. Try one category at a time.';
  return { error, detail: raw };
}
