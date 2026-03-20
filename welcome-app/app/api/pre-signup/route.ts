import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'hbs-studio.db'));

export async function POST(req: NextRequest) {
  const { email, inviteCode } = await req.json();

  if (!email || !inviteCode) {
    return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 });
  }

  const row = sqlite.prepare('SELECT code FROM allowed_emails WHERE email = ?').get(email.toLowerCase().trim()) as { code: string | null } | undefined;

  if (!row) {
    return NextResponse.json({ error: 'האימייל אינו ברשימת המורשים' }, { status: 403 });
  }

  if (!row.code || row.code !== inviteCode.trim()) {
    return NextResponse.json({ error: 'קוד הרישום שגוי' }, { status: 403 });
  }

  // Invalidate the code after successful validation (one-time use)
  sqlite.prepare('UPDATE allowed_emails SET code = NULL WHERE email = ?').run(email.toLowerCase().trim());

  return NextResponse.json({ ok: true });
}
