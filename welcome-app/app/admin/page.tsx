'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'admin')) {
      router.replace('/studio');
    }
  }, [session, isPending]);

  if (isPending || !session || session.user.role !== 'admin') return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b12',
      fontFamily: 'Rubik, Arial, sans-serif',
      color: '#e8eaf0',
    }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Red accent line */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, #AF1419, #e8373e, #AF1419, transparent)',
        }} />
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '14px 24px',
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
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #AF1419, #e8373e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
              }}>ADMIN / SETTINGS</div>
              <div style={{ fontSize: 10, color: '#7a8090', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Upload Manager
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections grid */}
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '32px 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {SECTIONS.map(section => (
          <div key={section.title} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Section header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(175,20,25,0.06)',
            }}>
              <div style={{
                width: 3, height: 16, borderRadius: 2,
                background: 'linear-gradient(180deg, #AF1419, #e8373e)',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#e8eaf0',
              }}>{section.title}</span>
            </div>

            {/* Fields */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {section.fields.map(field => (
                <div key={field.id}>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#7a8090',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>{field.label}</label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    fontSize: 12,
                    color: '#7a8090',
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(175,20,25,0.45)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(175,20,25,0.07)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <span style={{ fontSize: 15, opacity: 0.6 }}>↑</span>
                    <span>Choose file to upload</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
