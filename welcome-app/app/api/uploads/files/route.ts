import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');
  const fieldId = searchParams.get('fieldId');

  if (!section || !fieldId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', section, fieldId);
  if (!fs.existsSync(dir)) return NextResponse.json({ files: [] });

  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  return NextResponse.json({ files });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');
  const fieldId = searchParams.get('fieldId');
  const filename = searchParams.get('filename');

  if (!section || !fieldId || !filename) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', section, fieldId, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  return NextResponse.json({ ok: true });
}
