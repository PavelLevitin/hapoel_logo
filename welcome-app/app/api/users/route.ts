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
  const users = sqlite.prepare('SELECT id, name, email, role, createdAt FROM user ORDER BY createdAt DESC').all();
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const adminSession = await requireAdmin(req);
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  if (!userId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Prevent deleting yourself
  if (userId === adminSession.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  // Delete sessions first, then user
  sqlite.prepare('DELETE FROM session WHERE userId = ?').run(userId);
  sqlite.prepare('DELETE FROM user WHERE id = ?').run(userId);

  return NextResponse.json({ ok: true });
}
