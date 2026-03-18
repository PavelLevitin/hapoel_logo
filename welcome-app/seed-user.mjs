import { auth } from './lib/auth.ts';

const result = await auth.api.signUpEmail({
  body: {
    email: 'tomer@tomer.com',
    password: '147852',
    name: 'Tomer',
  },
});

console.log('User created:', result.user.email);
