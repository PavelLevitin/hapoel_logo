import { auth } from './lib/auth';
import { getMigrations } from 'better-auth/db/migration';

async function main() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log('Migrations done');

  // Set tomer@tomer.com as admin
  const result = await auth.api.setRole({
    body: { userId: '', role: 'admin' },
  }).catch(() => null);

  // Use the internal DB directly to set admin role by email
  const Database = (await import('better-sqlite3')).default;
  const db = new Database('./hbs-studio.db');
  const user = db.prepare('SELECT id FROM user WHERE email = ?').get('tomer@tomer.com') as { id: string } | undefined;
  if (!user) { console.log('User not found'); return; }
  db.prepare('UPDATE user SET role = ? WHERE id = ?').run('admin', user.id);
  console.log('tomer@tomer.com set as admin');
}

main().catch(console.error);
