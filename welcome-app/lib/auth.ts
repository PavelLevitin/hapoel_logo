import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'hbs-studio.db'));

// Ensure allowed_emails table exists with code column
sqlite.exec(`CREATE TABLE IF NOT EXISTS allowed_emails (email TEXT PRIMARY KEY NOT NULL, code TEXT)`);
try { sqlite.exec(`ALTER TABLE allowed_emails ADD COLUMN code TEXT`); } catch {}
// Always ensure the protected admin email is in the whitelist
sqlite.prepare('INSERT INTO allowed_emails (email, code) VALUES (?, NULL) ON CONFLICT(email) DO NOTHING').run('tomer@tomer.com');

export const auth = betterAuth({
  database: sqlite,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  plugins: [admin()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowed = sqlite.prepare('SELECT 1 FROM allowed_emails WHERE email = ?').get(user.email);
          if (!allowed) {
            throw new Error('כתובת האימייל אינה מורשית להרשמה');
          }
          return { data: user };
        },
        after: async (user) => {
          // Remove from whitelist once registered — they now exist in Users
          if (user.email !== 'tomer@tomer.com') {
            sqlite.prepare('DELETE FROM allowed_emails WHERE email = ?').run(user.email);
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh session if older than 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET ?? 'hbs-studio-dev-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: (request) => {
    const origin = request?.headers.get('origin');
    return origin ? [origin] : [];
  },
});

export type Session = typeof auth.$Infer.Session;
