import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'hbs-studio.db'));

export const auth = betterAuth({
  database: sqlite,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  plugins: [admin()],
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
