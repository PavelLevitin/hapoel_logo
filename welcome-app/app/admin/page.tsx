'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/auth-client';

const SECTIONS = [
  {
    title: 'Welcome',
    fields: [
      { label: 'Background Texture', id: 'textureUpload' },
      { label: 'Logo',               id: 'logoUpload' },
      { label: 'Player Image',       id: 'playerUpload' },
      { label: 'Pen Image',          id: 'penUpload' },
    ],
  },
  {
    title: 'Statement',
    fields: [
      { label: 'Background Texture', id: 'bgTextureUpload' },
      { label: 'Club Logo',          id: 'clubLogoUpload' },
      { label: 'Overlay',            id: 'overlayUpload' },
    ],
  },
  {
    title: 'Score',
    fields: [
      { label: 'Academy Folder',     id: 'academyFolderInput' },
      { label: 'Texture',            id: 'textureInput' },
      { label: 'Left Background',    id: 'leftBgInput' },
      { label: 'Logo',               id: 'logoInput' },
      { label: 'IFA Logo',           id: 'ifaLogoInput' },
      { label: 'Continuous Image',   id: 'continuousInput' },
      { label: 'Third Image 2',      id: 'third2Input' },
      { label: 'Third Image 3',      id: 'third3Input' },
    ],
  },
  {
    title: 'Post',
    fields: [
      { label: 'Main Image',         id: 'mainImageUpload' },
      { label: 'Bottom Logos',       id: 'bottomLogosUpload' },
    ],
  },
  {
    title: 'Match',
    fields: [
      { label: 'Background Texture', id: 'textureUpload' },
      { label: 'Main Logo',          id: 'mainLogoUpload' },
      { label: 'Player Image',       id: 'playerUpload' },
      { label: 'Home Team Logo',     id: 'homeLogoUpload' },
      { label: 'Away Team Logo',     id: 'awayLogoUpload' },
    ],
  },
  {
    title: 'Line Up',
    fields: [
      { label: 'PDF File',           id: 'pdfFile' },
      { label: 'Player Image',       id: 'playerImage' },
      { label: 'Team Logo',          id: 'teamLogo' },
      { label: 'Opponent Logo',      id: 'oppLogo' },
      { label: 'Background Image',   id: 'bgImageInput' },
    ],
  },
  {
    title: 'Birthday',
    fields: [
      { label: 'Background Texture', id: 'textureUpload' },
      { label: 'Logo',               id: 'logoUpload' },
      { label: 'Player Image',       id: 'playerUpload' },
      { label: 'Custom Badge',       id: 'customBadgeUpload' },
    ],
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [active, setActive] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fileList, setFileList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function fetchCounts() {
    fetch('/api/uploads/counts')
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {});
  }

  useEffect(() => { fetchCounts(); }, []);

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
    if (!isPending && (!session || session.user.role !== 'admin')) {
      router.replace('/studio');
    }
  }, [session, isPending]);

  if (isPending || !session || session.user.role !== 'admin') return null;

  const section = SECTIONS[active];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#111827',
      fontFamily: 'Rubik, Arial, sans-serif',
      color: '#e8eaf0',
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
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 7,
              padding: '4px 10px',
              color: '#7a8090',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Rubik, Arial, sans-serif',
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
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 10px',
          gap: 4,
        }}>
          <div style={{ fontSize: 10, color: '#8a90a0', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600, padding: '0 8px 10px' }}>
            Tool Pages
          </div>
          {SECTIONS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              style={{
                background: active === i ? 'linear-gradient(135deg, #AF1419, #c9181f)' : 'transparent',
                border: active === i ? '1px solid rgba(175,20,25,0.5)' : '1px solid transparent',
                borderRadius: 8,
                padding: '9px 12px',
                color: active === i ? '#fff' : '#b0b8c8',
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
        </div>

        {/* Content panel */}
        <div style={{
          flex: 1,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {/* Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(180deg, #AF1419, #e8373e)', flexShrink: 0 }} />
            <h2 style={{
              margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#e8eaf0',
            }}>{section.title}</h2>
            <span style={{ fontSize: 12, color: '#8a90a0', letterSpacing: '0.04em' }}>
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
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '16px',
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#a0a8b8',
                  letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10,
                }}>{field.label}</div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px dashed rgba(255,255,255,0.20)',
                  borderRadius: 8, padding: '10px 12px',
                  cursor: 'pointer', fontSize: 12, color: '#b0b8c8',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(175,20,25,0.45)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(175,20,25,0.07)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.20)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <span style={{ fontSize: 15, opacity: 0.6 }}>↑</span>
                  <span>{uploading === `${section.title}__${field.id}` ? 'Uploading...' : 'Choose PNG file'}</span>
                  <input
                    type="file"
                    accept=".png,image/png"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, section.title, field.id);
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
                  <span style={{ display: 'block', marginTop: 6, fontSize: 11, color: '#9aa0b0', letterSpacing: '0.03em' }}>
                    Total 0 files
                  </span>
                )}

                {/* File list */}
                {expanded === `${section.title}__${field.id}` && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {fileList.map(filename => (
                      <div key={filename} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6, padding: '5px 8px',
                      }}>
                        <span style={{ fontSize: 11, color: '#c0c8d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
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
        </div>
      </div>
    </div>
  );
}
