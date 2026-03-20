import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  const counts: Record<string, number> = {};

  if (!fs.existsSync(UPLOADS_DIR)) {
    return NextResponse.json(counts);
  }

  const sections = fs.readdirSync(UPLOADS_DIR);
  for (const section of sections) {
    const sectionPath = path.join(UPLOADS_DIR, section);
    if (!fs.statSync(sectionPath).isDirectory()) continue;

    const fields = fs.readdirSync(sectionPath);
    for (const field of fields) {
      const fieldPath = path.join(sectionPath, field);
      if (!fs.statSync(fieldPath).isDirectory()) continue;

      const files = fs.readdirSync(fieldPath).filter(f => !f.startsWith('.'));
      counts[`${section}__${field}`] = files.length;
    }
  }

  return NextResponse.json(counts);
}
