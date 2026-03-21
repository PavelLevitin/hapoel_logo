import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { auth } from '../../../lib/auth';

const sqlite = new Database(path.join(process.cwd(), 'hbs-studio.db'));

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') return null;
  return session;
}

function generateCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = sqlite.prepare('SELECT email, code FROM allowed_emails ORDER BY email').all() as { email: string; code: string | null }[];
  return NextResponse.json({ emails: rows });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'כתובת אימייל לא תקינה' }, { status: 400 });
  }

  const code = generateCode();
  const normalizedEmail = email.toLowerCase().trim();

  // Insert or replace with a fresh code
  sqlite.prepare('INSERT INTO allowed_emails (email, code) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET code = excluded.code').run(normalizedEmail, code);

  return NextResponse.json({ ok: true, code });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  if (email === 'tomer@tomer.com') {
    return NextResponse.json({ error: 'This email is protected and cannot be removed' }, { status: 403 });
  }
  sqlite.prepare('DELETE FROM allowed_emails WHERE email = ?').run(email);
  return NextResponse.json({ ok: true });
}
