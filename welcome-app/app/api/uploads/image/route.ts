import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');
  const fieldId = searchParams.get('fieldId');
  const filename = searchParams.get('filename');

  if (!section || !fieldId || !filename) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', section, fieldId, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
