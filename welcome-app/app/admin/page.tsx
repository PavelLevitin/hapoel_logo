'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '../../lib/auth-client';

const SECTIONS = [
  {
    title: 'Welcome',
    fields: [
      { label: 'רקע',                      id: 'textureUpload' },
      { label: 'טען לוגו',                  id: 'logoUpload' },
      { label: 'טען תמונת שחקן',            id: 'playerUpload' },
      { label: 'עט נובע / אייקון עט',       id: 'penUpload' },
    ],
  },
  {
    title: 'Statement',
    fields: [
      { label: 'רקע',                                    id: 'bgTextureUpload' },
      { label: 'לוגו מועדון',                             id: 'clubLogoUpload' },
      { label: 'תמונה שקופה מתחת לטקסטים',               id: 'overlayUpload' },
    ],
  },
  {
    title: 'Score',
    fields: [
      { label: 'תיקיית ACADEMY PLAYERS',                 id: 'academyFolderInput' },
      { label: 'רקע תוצאה',                              id: 'textureInput' },
      { label: 'רקע שחקן',                               id: 'leftBgInput' },
      { label: 'לוגו מועדון',                             id: 'logoInput' },
      { label: 'לוגו התאחדות',                            id: 'ifaLogoInput' },
      { label: 'העלאת תמונת שחקן ראשי או תמונה אחרת',   id: 'continuousInput' },
      { label: 'תמונה שלישית 2',                         id: 'third2Input' },
      { label: 'תמונה שלישית 3',                         id: 'third3Input' },
    ],
  },
  {
    title: 'Post',
    fields: [
      { label: 'תמונה מרכזית',   id: 'mainImageUpload' },
      { label: 'לוגואים בתחתית', id: 'bottomLogosUpload' },
    ],
  },
  {
    title: 'Match',
    fields: [
      { label: 'רקע',              id: 'textureUpload' },
      { label: 'לוגו עליון',       id: 'mainLogoUpload' },
      { label: 'שחקן',             id: 'playerUpload' },
      { label: 'לוגו קבוצה ביתית', id: 'homeLogoUpload' },
      { label: 'לוגו קבוצה אורחת', id: 'awayLogoUpload' },
    ],
  },
  {
    title: 'Line Up',
    fields: [
      { label: 'קובץ PDF',   id: 'pdfFile' },
      { label: 'תמונת שחקן', id: 'playerImage' },
      { label: 'לוגו קבוצה', id: 'teamLogo' },
      { label: 'לוגו יריב',  id: 'oppLogo' },
      { label: 'תמונת רקע',  id: 'bgImageInput' },
    ],
  },
  {
    title: 'Birthday',
    fields: [
      { label: 'רקע',                    id: 'textureUpload' },
      { label: 'לוגו',                   id: 'logoUpload' },
      { label: 'שחקן',                   id: 'playerUpload' },
      { label: 'אייקון / שכבה מקובץ',   id: 'customBadgeUpload' },
    ],
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [active, setActive] = useState(0);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hbs-theme');
    if (saved === 'light') setDark(false);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('hbs-theme', next ? 'dark' : 'light');
  }
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allowedEmails, setAllowedEmails] = useState<{ email: string; code: string | null }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<{ email: string; code: string } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string | null; createdAt: string }[]>([]);

  function fetchCounts() {
    fetch('/api/uploads/counts')
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {});
  }

  useEffect(() => { fetchCounts(); }, []);

  async function fetchAllowedEmails() {
    const res = await fetch('/api/allowed-emails');
    const data = await res.json();
    setAllowedEmails(data.emails ?? []);
  }

  useEffect(() => { if (active === SECTIONS.length) fetchAllowedEmails(); }, [active]);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users ?? []);
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;
    await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await fetchUsers();
  }

  useEffect(() => { if (active === SECTIONS.length + 1) fetchUsers(); }, [active]);

  async function handleAddEmail() {
    if (!newEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('כתובת אימייל לא תקינה');
      return;
    }
    setEmailError(null);
    setEmailLoading(true);
    const res = await fetch('/api/allowed-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim() }),
    });
    const data = await res.json();
    if (data.code) {
      setLastGeneratedCode({ email: newEmail.trim().toLowerCase(), code: data.code });
    }
    setNewEmail('');
    await fetchAllowedEmails();
    setEmailLoading(false);
  }

  async function handleRemoveEmail(email: string) {
    await fetch(`/api/allowed-emails?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    await fetchAllowedEmails();
  }

  async function toggleExpand(key: string, sectionTitle: string, fieldId: string) {
    if (expanded === key) { setExpanded(null); setFileList([]); return; }
    const res = await fetch(`/api/uploads/files?section=${encodeURIComponent(sectionTitle)}&fieldId=${encodeURIComponent(fieldId)}`);
    const data = await res.json();
    setFileList(data.files ?? []);
    setExpanded(key);
  }

  async function handleUpload(file: File, sectionTitle: string, fieldId: string) {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.png')) {
      setError('Only PNG files are allowed');
      return;
    }
    const key = `${sectionTitle}__${fieldId}`;
    setUploading(key);
    const form = new FormData();
    form.append('file', file);
    form.append('section', sectionTitle);
    form.append('fieldId', fieldId);
    const res = await fetch('/api/uploads', { method: 'POST', body: form });
    const data = await res.json();
    if (data.error) { setError(data.error); setUploading(null); return; }
    await fetchCounts();
    if (expanded === key) {
      const r = await fetch(`/api/uploads/files?section=${encodeURIComponent(sectionTitle)}&fieldId=${encodeURIComponent(fieldId)}`);
      const d = await r.json();
      setFileList(d.files ?? []);
    }
    setUploading(null);
  }

  async function handleDelete(sectionTitle: string, fieldId: string, filename: string) {
    const key = `${sectionTitle}__${fieldId}`;
    await fetch(`/api/uploads/files?section=${encodeURIComponent(sectionTitle)}&fieldId=${encodeURIComponent(fieldId)}&filename=${encodeURIComponent(filename)}`, { method: 'DELETE' });
    await fetchCounts();
    const r = await fetch(`/api/uploads/files?section=${encodeURIComponent(sectionTitle)}&fieldId=${encodeURIComponent(fieldId)}`);
    const d = await r.json();
    setFileList(d.files ?? []);
    if ((d.files ?? []).length === 0) setExpanded(null);
  }

  useEffect(() => {
    if (!isPending && (!session || (session.user as { role?: string }).role !== 'admin')) {
      router.replace('/studio');
    }
  }, [session, isPending]);

  if (isPending || !session || (session.user as { role?: string }).role !== 'admin') return null;

  const section = SECTIONS[active] ?? SECTIONS[0];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: dark ? '#111827' : '#f0f2f5',
      fontFamily: 'Rubik, Arial, sans-serif',
      color: dark ? '#e8eaf0' : '#1a1a1a',
      overflow: 'hidden',
    }}>

      {/* ── Top header ── */}
      <div style={{
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #AF1419, #e8373e, #AF1419, transparent)' }} />
        <div style={{
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <button
            onClick={() => router.push('/studio')}
            style={{
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}`,
              borderRadius: 7,
              padding: '6px 14px',
              color: dark ? '#e8eaf0' : '#1a1a1a',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Rubik, Arial, sans-serif',
              letterSpacing: '0.02em',
            }}
          >← Back</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #AF1419, #c9181f)',
              boxShadow: '0 4px 14px rgba(175,20,25,0.40)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.03em',
            }}>HBS</div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #AF1419, #e8373e)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1.1,
              }}>ADMIN / SETTINGS</div>
              <div style={{ fontSize: 10, color: '#7a8090', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Upload Manager
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
              borderRadius: 8, padding: '5px 12px',
              color: dark ? '#b0b8c8' : '#555',
              fontFamily: 'Rubik, sans-serif', fontSize: 13,
              cursor: 'pointer', flexShrink: 0,
            }}
          >{dark ? '☀ Light' : '☾ Dark'}</button>

          {/* Logout */}
          <button
            onClick={async () => { try { await signOut(); } finally { window.location.href = '/'; } }}
            style={{
              background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
              borderRadius: 8, padding: '5px 12px',
              color: dark ? '#b0b8c8' : '#555',
              fontFamily: 'Rubik, sans-serif', fontSize: 13,
              cursor: 'pointer', flexShrink: 0, direction: 'rtl',
            }}
          >יציאה</button>

        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          gap: 4,
        }}>
          <div style={{ fontSize: 10, color: dark ? '#8a90a0' : '#666', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600, padding: '0 8px 10px' }}>
            Tool Pages
          </div>
          {SECTIONS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              style={{
                background: active === i ? 'linear-gradient(135deg, #AF1419, #c9181f)' : 'transparent',
                border: active === i ? '1px solid rgba(175,20,25,0.5)' : `1px solid ${dark ? 'transparent' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: 8,
                padding: '9px 12px',
                color: active === i ? '#fff' : dark ? '#b0b8c8' : '#333',
                fontFamily: 'Rubik, Arial, sans-serif',
                fontSize: 13,
                fontWeight: active === i ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                letterSpacing: '0.02em',
                boxShadow: active === i ? '0 2px 12px rgba(175,20,25,0.35)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {s.title}
            </button>
          ))}

          {/* Divider */}
          <div style={{ margin: '8px 4px', height: 1, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)' }} />

          {/* Allowed Emails */}
          <button
            onClick={() => setActive(SECTIONS.length)}
            style={{
              background: active === SECTIONS.length ? 'linear-gradient(135deg, #1a5fa8, #1e75d0)' : 'transparent',
              border: active === SECTIONS.length ? '1px solid rgba(30,117,208,0.5)' : `1px solid ${dark ? 'transparent' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 8, padding: '9px 12px',
              color: active === SECTIONS.length ? '#fff' : dark ? '#b0b8c8' : '#333',
              fontFamily: 'Rubik, Arial, sans-serif', fontSize: 13,
              fontWeight: active === SECTIONS.length ? 700 : 400,
              cursor: 'pointer', textAlign: 'left', letterSpacing: '0.02em',
              boxShadow: active === SECTIONS.length ? '0 2px 12px rgba(30,117,208,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            🔒 Allowed Emails
          </button>

          {/* Users */}
          <button
            onClick={() => setActive(SECTIONS.length + 1)}
            style={{
              background: active === SECTIONS.length + 1 ? 'linear-gradient(135deg, #1a5fa8, #1e75d0)' : 'transparent',
              border: active === SECTIONS.length + 1 ? '1px solid rgba(30,117,208,0.5)' : `1px solid ${dark ? 'transparent' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 8, padding: '9px 12px',
              color: active === SECTIONS.length + 1 ? '#fff' : dark ? '#b0b8c8' : '#333',
              fontFamily: 'Rubik, Arial, sans-serif', fontSize: 13,
              fontWeight: active === SECTIONS.length + 1 ? 700 : 400,
              cursor: 'pointer', textAlign: 'left', letterSpacing: '0.02em',
              boxShadow: active === SECTIONS.length + 1 ? '0 2px 12px rgba(30,117,208,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            👥 Users
          </button>
        </div>

        {/* Content panel */}
        <div style={{
          flex: 1,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
        }}>
          {/* Allowed Emails panel */}
          {active === SECTIONS.length + 1 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #1a5fa8, #1e75d0)', flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: dark ? '#e8eaf0' : '#1a1a1a' }}>
                  Users
                </h2>
                <span style={{ fontSize: 12, color: dark ? '#8a90a0' : '#888', letterSpacing: '0.04em' }}>
                  — {users.length} רשומים
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
                {users.length === 0 && (
                  <p style={{ color: dark ? '#5a6070' : '#aaa', fontSize: 13 }}>אין משתמשים</p>
                )}
                {users.map(user => (
                  <div key={user.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 8, padding: '12px 14px', gap: 12,
                    boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: dark ? '#e8eaf0' : '#1a1a1a', marginBottom: 2 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: dark ? '#7a8090' : '#888', direction: 'ltr' }}>{user.email}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
                      background: user.role === 'admin' ? 'rgba(175,20,25,0.15)' : 'rgba(255,255,255,0.07)',
                      color: user.role === 'admin' ? '#e8373e' : dark ? '#7a8090' : '#888',
                    }}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.email === 'tomer@tomer.com' || user.role === 'admin'}
                      title={user.email === 'tomer@tomer.com' ? 'משתמש מוגן' : user.role === 'admin' ? 'לא ניתן למחוק אדמין' : 'מחק משתמש'}
                      style={{
                        background: (user.email === 'tomer@tomer.com' || user.role === 'admin') ? 'transparent' : 'rgba(175,20,25,0.10)',
                        border: `1px solid ${(user.email === 'tomer@tomer.com' || user.role === 'admin') ? 'transparent' : 'rgba(175,20,25,0.30)'}`,
                        borderRadius: 6, padding: '5px 12px',
                        color: (user.email === 'tomer@tomer.com' || user.role === 'admin') ? (dark ? '#3a4050' : '#ccc') : '#e8373e',
                        cursor: (user.email === 'tomer@tomer.com' || user.role === 'admin') ? 'not-allowed' : 'pointer',
                        fontSize: 12, fontWeight: 600, fontFamily: 'Rubik, sans-serif', flexShrink: 0,
                      }}
                    >
                      מחק
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : active === SECTIONS.length ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #1a5fa8, #1e75d0)', flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: dark ? '#e8eaf0' : '#1a1a1a' }}>
                  Allowed Emails
                </h2>
                <span style={{ fontSize: 12, color: dark ? '#8a90a0' : '#888', letterSpacing: '0.04em' }}>
                  — רק אימיילים ברשימה יכולים להירשם
                </span>
              </div>

              {/* Add email row */}
              <div style={{ display: 'flex', gap: 10, maxWidth: 500 }}>
                <input
                  type="email"
                  placeholder="הכנס אימייל חדש..."
                  value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailError(null); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                  style={{
                    flex: 1,
                    background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.20)'}`,
                    borderRadius: 8, padding: '9px 14px',
                    color: dark ? '#e8eaf0' : '#1a1a1a',
                    fontSize: 13, fontFamily: 'Rubik, Arial, sans-serif',
                    outline: 'none', direction: 'ltr',
                  }}
                />
                <button
                  onClick={handleAddEmail}
                  disabled={emailLoading || !newEmail.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #1a5fa8, #1e75d0)',
                    border: 'none', borderRadius: 8, padding: '9px 20px',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    fontFamily: 'Rubik, Arial, sans-serif', cursor: 'pointer',
                    opacity: emailLoading || !newEmail.trim() ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  + צור קוד
                </button>
              </div>

              {emailError && (
                <p style={{ margin: 0, fontSize: 12, color: '#e8373e', direction: 'rtl' }}>{emailError}</p>
              )}

              {/* Generated code banner */}
              {lastGeneratedCode && (
                <div style={{
                  maxWidth: 500,
                  background: dark ? 'rgba(30,117,208,0.12)' : 'rgba(30,117,208,0.08)',
                  border: '1px solid rgba(30,117,208,0.40)',
                  borderRadius: 10, padding: '14px 18px',
                }}>
                  <div style={{ fontSize: 11, color: '#1e75d0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                    קוד חדש נוצר עבור {lastGeneratedCode.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 32, fontWeight: 900, letterSpacing: '0.18em',
                      color: dark ? '#e8eaf0' : '#1a1a1a',
                      fontFamily: 'monospace',
                    }}>{lastGeneratedCode.code}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(lastGeneratedCode.code)}
                      style={{
                        background: 'rgba(30,117,208,0.20)', border: '1px solid rgba(30,117,208,0.35)',
                        borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
                        color: '#1e75d0', fontSize: 12, fontWeight: 600, fontFamily: 'Rubik, sans-serif',
                      }}
                    >העתק</button>
                    <button
                      onClick={() => setLastGeneratedCode(null)}
                      style={{ background: 'transparent', border: 'none', color: dark ? '#5a6070' : '#aaa', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                    >×</button>
                  </div>
                  <div style={{ fontSize: 11, color: dark ? '#7a8090' : '#888', marginTop: 6 }}>
                    שתף קוד זה עם המשתמש — הוא תקף לשימוש חד פעמי בלבד
                  </div>
                </div>
              )}

              {/* Email list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
                {allowedEmails.length === 0 && (
                  <p style={{ color: dark ? '#5a6070' : '#aaa', fontSize: 13 }}>אין אימיילים ברשימה</p>
                )}
                {allowedEmails.map(({ email, code }) => (
                  <div key={email} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 8, padding: '10px 14px', gap: 10,
                    boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <span style={{ fontSize: 13, color: dark ? '#c8cad4' : '#333', direction: 'ltr', flex: 1 }}>{email}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: code ? 'rgba(255,170,0,0.15)' : 'rgba(40,180,80,0.15)',
                      color: code ? '#ffaa00' : '#28b450',
                      whiteSpace: 'nowrap',
                    }}>
                      {code ? `ממתין · ${code}` : '✓ נרשם'}
                    </span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      disabled={email === 'tomer@tomer.com'}
                      title={email === 'tomer@tomer.com' ? 'אימייל מוגן' : 'הסר'}
                      style={{
                        background: 'transparent', border: 'none',
                        color: email === 'tomer@tomer.com' ? (dark ? '#3a4050' : '#ccc') : '#e8373e',
                        cursor: email === 'tomer@tomer.com' ? 'not-allowed' : 'pointer',
                        fontSize: 16, lineHeight: 1, padding: '0 4px', flexShrink: 0,
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
          <>
          {/* Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #AF1419, #e8373e)', flexShrink: 0 }} />
            <h2 style={{
              margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: dark ? '#e8eaf0' : '#1a1a1a',
            }}>{section.title}</h2>
            <span style={{ fontSize: 12, color: dark ? '#8a90a0' : '#888', letterSpacing: '0.04em' }}>
              — {section.fields.length} upload{section.fields.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Upload fields grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 14,
          }}>
            {section.fields.map(field => (
              <div key={field.id} style={{
                background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: 12,
                padding: '16px',
                boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: dark ? '#a0a8b8' : '#555',
                  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10,
                }}>{field.label}</div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                  border: `1px dashed ${dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.25)'}`,
                  borderRadius: 8, padding: '10px 12px',
                  cursor: 'pointer', fontSize: 12, color: dark ? '#b0b8c8' : '#555',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(175,20,25,0.45)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(175,20,25,0.07)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.25)';
                    (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
                  }}
                >
                  <span style={{ fontSize: 15, opacity: 0.6 }}>↑</span>
                  <span>{uploading === `${section.title}__${field.id}` ? 'Uploading...' : 'Choose PNG file'}</span>
                  <input
                    type="file"
                    accept=".png,image/png"
                    multiple
                    style={{ display: 'none' }}
                    onChange={async e => {
                      const files = Array.from(e.target.files ?? []);
                      for (const file of files) {
                        await handleUpload(file, section.title, field.id);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>

                {/* Error */}
                {error && uploading === null && (
                  <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: '#e8373e' }}>{error}</span>
                )}

                {/* Total + expand toggle */}
                {(counts[`${section.title}__${field.id}`] ?? 0) > 0 ? (
                  <span
                    onClick={() => toggleExpand(`${section.title}__${field.id}`, section.title, field.id)}
                    style={{
                      display: 'block', marginTop: 6, fontSize: 11,
                      color: '#AF1419', letterSpacing: '0.03em',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    Total {counts[`${section.title}__${field.id}`]} files {expanded === `${section.title}__${field.id}` ? '▴' : '▾'}
                  </span>
                ) : (
                  <span style={{ display: 'block', marginTop: 6, fontSize: 11, color: dark ? '#9aa0b0' : '#888', letterSpacing: '0.03em' }}>
                    Total 0 files
                  </span>
                )}

                {/* File list */}
                {expanded === `${section.title}__${field.id}` && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {fileList.map(filename => (
                      <div key={filename} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
                        borderRadius: 6, padding: '5px 8px',
                      }}>
                        <span style={{ fontSize: 11, color: dark ? '#c0c8d8' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {filename.replace(/^\d+_/, '')}
                        </span>
                        <button
                          onClick={() => handleDelete(section.title, field.id, filename)}
                          style={{
                            background: 'transparent', border: 'none',
                            color: '#e8373e', cursor: 'pointer',
                            fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0,
                          }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
