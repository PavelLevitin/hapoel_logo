import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hbs-studio.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);
