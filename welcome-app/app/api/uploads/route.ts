import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const section = formData.get('section') as string | null;
  const fieldId = formData.get('fieldId') as string | null;

  if (!file || !section || !fieldId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith('.png') || file.type !== 'image/png') {
    return NextResponse.json({ error: 'Only PNG files are allowed' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', section, fieldId);
  fs.mkdirSync(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  fs.writeFileSync(path.join(dir, filename), buffer);

  return NextResponse.json({ ok: true, filename });
}
