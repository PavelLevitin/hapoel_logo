import { auth } from './lib/auth';
import { getMigrations } from 'better-auth/db/migration';

async function main() {
  // Run migrations to create tables
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log('Migrations done');

  // Create the user
  const result = await auth.api.signUpEmail({
    body: {
      email: 'tomer@tomer.com',
      password: '147852',
      name: 'Tomer',
    },
  });
  console.log('User created:', result.user.email);
}

main().catch(console.error);
