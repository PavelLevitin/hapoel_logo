'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, useSession } from '../lib/auth-client';

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  padding: '11px 14px',
  color: '#e8eaf0',
  fontSize: 14,
  fontFamily: 'Rubik, Arial, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  boxSizing: 'border-box',
};

function Field({ label, type, value, onChange, placeholder, hint }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: '#7a8090', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = 'rgba(175,20,25,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(175,20,25,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
      />
      {hint && <span style={{ fontSize: 11, color: '#5a6070', direction: 'rtl' }}>{hint}</span>}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isPending && session) router.replace('/studio');
  }, [session, isPending]);

  if (isPending || session) return null;

  function reset() {
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setInviteCode('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError('אימייל או סיסמה שגויים');
        setLoading(false);
      } else {
        router.push('/studio');
      }
    } else {
      // Validate invite code / whitelist before calling signUp
      const pre = await fetch('/api/pre-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode }),
      });
      if (!pre.ok) {
        const data = await pre.json();
        setError(data.error ?? 'קוד הזמנה שגוי');
        setLoading(false);
        return;
      }

      const result = await signUp.email({ email, password, name });
      if (result.error) {
        setError(result.error.message ?? 'שגיאה ביצירת החשבון');
        setLoading(false);
      } else {
        setSuccess('החשבון נוצר בהצלחה! כעת ניתן להתחבר.');
        setMode('login');
        setPassword('');
        setLoading(false);
      }
    }
  }

  const isLogin = mode === 'login';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Rubik, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,20,25,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,20,25,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(175,20,25,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        margin: '0 20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20,
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
      }}>

        {/* Red top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #AF1419, #e8373e, #AF1419, transparent)' }} />

        <div style={{ padding: '40px 36px 44px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #AF1419, #c9181f)',
              boxShadow: '0 8px 28px rgba(175,20,25,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', color: '#fff',
            }}>HBS</div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 400, color: '#7a8090', letterSpacing: '0.04em' }}>Welcome to</p>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '0.06em',
              background: 'linear-gradient(135deg, #AF1419, #e8373e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1,
            }}>HBS STUDIO</h1>
            <p style={{ margin: '10px 0 0', fontSize: 13, color: '#7a8090', letterSpacing: '0.03em', direction: 'rtl' }}>
              {isLogin ? 'כניסה למערכת' : 'יצירת חשבון חדש'}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: 4,
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); reset(); }}
                style={{
                  flex: 1,
                  background: mode === m ? 'linear-gradient(135deg, #AF1419, #c9181f)' : 'transparent',
                  border: 'none',
                  borderRadius: 7,
                  padding: '8px 0',
                  color: mode === m ? '#fff' : '#7a8090',
                  fontFamily: 'Rubik, Arial, sans-serif',
                  fontSize: 13,
                  fontWeight: mode === m ? 700 : 400,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  boxShadow: mode === m ? '0 2px 12px rgba(175,20,25,0.35)' : 'none',
                  transition: 'all 0.15s',
                  direction: 'rtl',
                }}
              >
                {m === 'login' ? 'כניסה' : 'הרשמה'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && <Field label="שם" type="text" value={name} onChange={setName} />}
            <Field label="אימייל" type="email" value={email} onChange={setEmail} />
            <Field label="סיסמה" type="password" value={password} onChange={setPassword} />
            {!isLogin && <Field label="קוד רישום" type="text" value={inviteCode} onChange={setInviteCode} placeholder="12345" hint="קוד בן 5 ספרות שקיבלת מהמנהל" />}

            {error && (
              <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(175,20,25,0.12)', border: '1px solid rgba(175,20,25,0.3)', borderRadius: 8, color: '#e8373e', fontSize: 13, textAlign: 'center', direction: 'rtl' }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ margin: 0, padding: '10px 14px', background: 'rgba(20,175,60,0.12)', border: '1px solid rgba(20,175,60,0.3)', borderRadius: 8, color: '#2ecc71', fontSize: 13, textAlign: 'center', direction: 'rtl' }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: loading ? 'rgba(175,20,25,0.5)' : 'linear-gradient(135deg, #AF1419, #c9181f)',
                border: 'none', borderRadius: 10, padding: '13px 0',
                color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'Rubik, Arial, sans-serif', letterSpacing: '0.06em',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(175,20,25,0.45)',
                transition: 'opacity 0.15s', direction: 'rtl',
              }}
            >
              {loading ? '...' : isLogin ? 'כניסה' : 'הרשמה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
