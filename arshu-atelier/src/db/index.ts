import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use the POOLED Neon connection string (host contains "-pooler") – this is the PgBouncer pool.
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:pass@localhost.invalid/db');
export const db = drizzle(sql, { schema });
