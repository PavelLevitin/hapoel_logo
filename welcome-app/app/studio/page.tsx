'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from '../../lib/auth-client';

const TOOLS = [
  { label: 'Welcome',   src: '/tools/welcome.html' },
  { label: 'Statement', src: '/tools/statement.html' },
  { label: 'Score',     src: '/tools/score.html' },
  { label: 'Post',      src: '/tools/post.html' },
  { label: 'Match',     src: '/tools/match.html' },
  { label: 'Line Up',   src: '/tools/lineup.html' },
  { label: 'Birthday',  src: '/tools/birthday.html' },
];

interface GalleryState {
  open: boolean;
  fieldId: string;
  section: string;
  source: MessageEventSource | null;
  files: string[];
}

export default function Studio() {
  const [selected, setSelected] = useState(TOOLS[0]);
  const [dark, setDark] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [gallery, setGallery] = useState<GalleryState>({ open: false, fieldId: '', section: '', source: null, files: [] });
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  // Persist theme preference
  useEffect(() => {
    const saved = localStorage.getItem('hbs-theme');
    if (saved === 'light') setDark(false);
  }, []);

  // Gallery postMessage listener
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type !== 'openGallery') return;
      const { fieldId, section } = event.data;
      const res = await fetch(`/api/uploads/files?section=${encodeURIComponent(section)}&fieldId=${encodeURIComponent(fieldId)}`);
      const data = await res.json();
      setGallery({ open: true, fieldId, section, source: event.source, files: data.files ?? [] });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('hbs-theme', next ? 'dark' : 'light');
  }

  const bg = dark ? '#080b12' : '#f0f2f5';
  const navBg = dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)';
  const navBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.10)';
  const inactiveColor = dark ? '#7a8090' : '#888ea0';
  const inactiveBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bg, overflow: 'hidden' }}>

      {/* ── Top nav ── */}
      <nav style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 6,
        flexShrink: 0,
        background: navBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${navBorder}`,
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Brand + current tool */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: 16, paddingRight: 16, borderRight: `1px solid ${navBorder}`, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'Rubik, sans-serif',
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: '0.06em',
            background: 'linear-gradient(135deg, #AF1419, #e8373e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}>HBS STUDIO</span>
          <span style={{
            fontFamily: 'Rubik, sans-serif',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: inactiveColor,
            lineHeight: 1.2,
          }}>{selected.label}</span>
        </div>

        {/* Tool tabs */}
        {TOOLS.map(tool => {
          const active = tool.src === selected.src;
          return (
            <button
              key={tool.src}
              className={`nav-btn${active ? ' active' : ''}`}
              onClick={() => setSelected(tool)}
              onMouseEnter={() => !active && setHovered(tool.src)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: active
                  ? 'linear-gradient(135deg, #AF1419, #c9181f)'
                  : hovered === tool.src
                    ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')
                    : 'transparent',
                color: active ? '#fff' : hovered === tool.src ? (dark ? '#e8eaf0' : '#1a1a1a') : inactiveColor,
                border: active ? '1px solid rgba(175,20,25,0.5)' : `1px solid ${inactiveBorder}`,
                borderRadius: 8,
                padding: '5px 14px',
                fontFamily: 'Rubik, sans-serif',
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s',
                boxShadow: active ? '0 0 18px rgba(175,20,25,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
              }}
            >
              {tool.label}
            </button>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Admin/Settings button — admin only */}
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            style={{
              background: dark ? 'rgba(175,20,25,0.15)' : 'rgba(175,20,25,0.10)',
              border: '1px solid rgba(175,20,25,0.35)',
              borderRadius: 8,
              padding: '5px 12px',
              color: '#e8373e',
              fontFamily: 'Rubik, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}
          >
            Admin / Settings
          </button>
        )}

        {/* Logout button */}
        <button
          onClick={async () => { try { await signOut(); } finally { window.location.href = '/'; } }}
          title="Logout"
          style={{
            background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            border: `1px solid ${inactiveBorder}`,
            borderRadius: 8,
            padding: '5px 12px',
            color: inactiveColor,
            fontFamily: 'Rubik, sans-serif',
            fontSize: 13,
            cursor: 'pointer',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          יציאה
        </button>

        {/* About button */}
        <button
          onClick={() => setShowAbout(true)}
          title="About HBS Studio"
          style={{
            background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            border: `1px solid ${inactiveBorder}`,
            borderRadius: 8,
            padding: '5px 12px',
            color: inactiveColor,
            fontFamily: 'Rubik, sans-serif',
            fontSize: 13,
            cursor: 'pointer',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          ℹ
        </button>

        {/* Dark / Light toggle */}
        <button
          onClick={toggleTheme}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            border: `1px solid ${inactiveBorder}`,
            borderRadius: 8,
            padding: '5px 12px',
            color: inactiveColor,
            fontFamily: 'Rubik, sans-serif',
            fontSize: 13,
            cursor: 'pointer',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {dark ? '☀ Light' : '☾ Dark'}
        </button>

        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(175,20,25,0.4), transparent)',
          pointerEvents: 'none',
        }} />
      </nav>

      {/* ── About dialog ── */}
      {showAbout && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowAbout(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 100,
            }}
          />

          {/* Dialog */}
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 101,
            width: 380,
            background: dark ? 'rgba(12,15,24,0.92)' : 'rgba(245,247,250,0.92)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
            borderRadius: 18,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(175,20,25,0.12)',
            overflow: 'hidden',
            fontFamily: 'Rubik, sans-serif',
          }}>
            {/* Top accent — animated shimmer */}
            <div className="dialog-accent" />

            <div style={{ padding: '28px 30px 30px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #AF1419, #c9181f)',
                    boxShadow: '0 4px 14px rgba(175,20,25,0.40)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.03em',
                  }}>HBS</div>
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    background: 'linear-gradient(135deg, #AF1419, #e8373e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.04em',
                  }}>HBS STUDIO</span>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowAbout(false)}
                  onMouseEnter={() => setCloseHovered(true)}
                  onMouseLeave={() => setCloseHovered(false)}
                  title="Close"
                  style={{
                    background: closeHovered
                      ? 'linear-gradient(135deg, #AF1419, #c9181f)'
                      : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    border: closeHovered
                      ? '1px solid rgba(175,20,25,0.5)'
                      : `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: 8,
                    width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: closeHovered ? '#fff' : dark ? '#7a8090' : '#888',
                    fontSize: 18,
                    lineHeight: 1,
                    flexShrink: 0,
                    boxShadow: closeHovered ? '0 0 14px rgba(175,20,25,0.40)' : 'none',
                    transition: 'background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s',
                    transform: closeHovered ? 'scale(1.08)' : 'scale(1)',
                  }}
                >×</button>
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
                marginBottom: 22,
              }} />

              {/* Copyright content */}
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  margin: '0 0 6px',
                  fontSize: 19,
                  fontWeight: 700,
                  color: dark ? '#e8eaf0' : '#1a1a1a',
                  letterSpacing: '0.01em',
                }}>© 2026 HBS Studio</p>
                <p style={{
                  margin: '0 0 14px',
                  fontSize: 13,
                  color: dark ? '#9aa0b0' : '#555',
                  lineHeight: 1.6,
                }}>
                  Created by<br />
                  <span style={{ fontWeight: 600, color: dark ? '#c8cad4' : '#333' }}>
                    Tomer Bez-Ezri &amp; Pavel Levitin
                  </span>
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 11,
                  color: dark ? '#4a5060' : '#aaa',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}>All rights reserved</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Gallery modal ── */}
      {gallery.open && (
        <>
          <div
            onClick={() => setGallery(g => ({ ...g, open: false }))}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 201,
            width: 'min(740px, 92vw)',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            background: dark ? 'rgba(12,15,24,0.96)' : 'rgba(245,247,250,0.96)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
            borderRadius: 18,
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(175,20,25,0.12)',
            fontFamily: 'Rubik, sans-serif',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: dark ? '#e8eaf0' : '#1a1a1a',
                letterSpacing: '0.02em',
              }}>
                בחר תמונה — {gallery.section} / {gallery.fieldId}
              </span>
              <button
                onClick={() => setGallery(g => ({ ...g, open: false }))}
                style={{
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
                  borderRadius: 8,
                  width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: dark ? '#7a8090' : '#888',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* Thumbnails */}
            <div style={{
              overflowY: 'auto',
              padding: 20,
              flex: 1,
            }}>
              {gallery.files.length === 0 ? (
                <p style={{ color: dark ? '#5a6070' : '#aaa', textAlign: 'center', margin: '40px 0', fontSize: 14 }}>
                  אין תמונות בקטגוריה זו
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 12,
                }}>
                  {gallery.files.map(file => {
                    const url = `/uploads/${gallery.section}/${gallery.fieldId}/${file}`;
                    return (
                      <div
                        key={file}
                        onClick={() => {
                          gallery.source?.postMessage({ type: 'imageSelected', fieldId: gallery.fieldId, url }, '*');
                          setGallery(g => ({ ...g, open: false }));
                        }}
                        title={file}
                        style={{
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'}`,
                          cursor: 'pointer',
                          aspectRatio: '1',
                          background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
                          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(175,20,25,0.35)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={file}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Content iframe ── */}
      <iframe
        key={selected.src}
        src={selected.src}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        title={selected.label}
      />
    </div>
  );
}
