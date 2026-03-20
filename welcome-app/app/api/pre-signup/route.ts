import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'hbs-studio.db'));

export async function POST(req: NextRequest) {
  const { email, inviteCode } = await req.json();

  if (!email || !inviteCode) {
    return NextResponse.json({ error: 'חסרים פרטים' }, { status: 400 });
  }

  const expectedCode = process.env.INVITE_CODE;
  if (!expectedCode || inviteCode !== expectedCode) {
    return NextResponse.json({ error: 'קוד הזמנה שגוי' }, { status: 403 });
  }

  // Add email to whitelist so the signup can proceed
  sqlite.prepare('INSERT OR IGNORE INTO allowed_emails (email) VALUES (?)').run(email.toLowerCase().trim());

  return NextResponse.json({ ok: true });
}
