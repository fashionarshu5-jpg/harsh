import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use the POOLED Neon connection string (host contains "-pooler") – this is the PgBouncer pool.
// IMPORTANT: the Neon driver talks over fetch(); Next.js would cache those responses and the public
// site would keep showing OLD data. cache:'no-store' guarantees every page reads fresh data.
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:pass@localhost.invalid/db', {
  fetchOptions: { cache: 'no-store' },
});
export const db = drizzle(sql, { schema });
