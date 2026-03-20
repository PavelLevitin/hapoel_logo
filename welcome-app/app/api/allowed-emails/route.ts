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

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = sqlite.prepare('SELECT email FROM allowed_emails ORDER BY email').all() as { email: string }[];
  return NextResponse.json({ emails: rows.map(r => r.email) });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  sqlite.prepare('INSERT OR IGNORE INTO allowed_emails (email) VALUES (?)').run(email.toLowerCase().trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  sqlite.prepare('DELETE FROM allowed_emails WHERE email = ?').run(email);
  return NextResponse.json({ ok: true });
}
