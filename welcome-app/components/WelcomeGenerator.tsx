'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent,
} from 'react';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Constants & types                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const STAGE_SIZE = 1080;

interface AppState {
  textureSrc: string;
  logoSrc: string;
  logoY: number;
  logoSize: number;
  weareText: string;
  weareY: number;
  weareSize: number;
  playerSrc: string;
  playerNaturalW: number;
  playerNaturalH: number;
  playerX: number;
  playerY: number;
  playerScale: number;
  playerOpacity: number;
  playerBrightness: number;
  playerContrast: number;
  playerSaturation: number;
  playerSharpness: number;
  welcomeX: number;
  welcomeY: number;
  welcomeSize: number;
  welcomeGap: number;
  welcomeStroke: number;
  welcomeOutlineOpacity: number;
  welcomeFillColor: string;
  welcomeOutlineColor: string;
  playerName: string;
  nameSize: number;
  nameY: number;
  signatureText: string;
  signatureX: number;
  signatureY: number;
  signatureSize: number;
  signatureRotate: number;
  penSrc: string;
  penNaturalW: number;
  penNaturalH: number;
  penX: number;
  penY: number;
  penSize: number;
  penRotate: number;
}

const DEFAULT: AppState = {
  textureSrc: '',
  logoSrc: '',
  logoY: 0,
  logoSize: 168,
  weareText: 'WE ARE HBS',
  weareY: 145,
  weareSize: 15,
  playerSrc: '',
  playerNaturalW: 0,
  playerNaturalH: 0,
  playerX: 0,
  playerY: 0,
  playerScale: 1,
  playerOpacity: 1,
  playerBrightness: 1,
  playerContrast: 1,
  playerSaturation: 1,
  playerSharpness: 0,
  welcomeX: 2,
  welcomeY: -78,
  welcomeSize: 186,
  welcomeGap: 157,
  welcomeStroke: 2,
  welcomeOutlineOpacity: 0.34,
  welcomeFillColor: '#ffffff',
  welcomeOutlineColor: '#ffffff',
  playerName: 'PLAYER NAME',
  nameSize: 96,
  nameY: 1065,
  signatureText: 'Signature',
  signatureX: 165,
  signatureY: 872,
  signatureSize: 100,
  signatureRotate: -10,
  penSrc: '',
  penNaturalW: 0,
  penNaturalH: 0,
  penX: 324,
  penY: 794,
  penSize: 130,
  penRotate: -18,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgb(hex: string) {
  const safe = (hex || '#ffffff').replace('#', '');
  const full = safe.length === 3 ? safe.split('').map(ch => ch + ch).join('') : safe;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function fitContain(imgW: number, imgH: number, boxW: number, boxH: number) {
  const r = Math.min(boxW / imgW, boxH / imgH);
  return { w: imgW * r, h: imgH * r, x: (boxW - imgW * r) / 2, y: (boxH - imgH * r) / 2 };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Small reusable UI pieces                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      margin: '22px 0 10px',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#AF1419',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      paddingBottom: 8,
    }}>
      {children}
    </h3>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, marginBottom: 5, color: '#7a8090', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        color: '#e8eaf0',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 8,
        padding: '9px 12px',
        fontFamily: 'inherit',
        fontSize: 14,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    />
  );
}

function RangeField({
  label, id, min, max, value, unit = '',
  onChange,
}: {
  label: string; id?: string; min: number; max: number; value: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 62px', gap: 8, alignItems: 'center' }}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{
          background: 'rgba(175,20,25,0.12)',
          border: '1px solid rgba(175,20,25,0.25)',
          borderRadius: 8,
          padding: '6px 4px',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#e8373e',
          letterSpacing: '0.02em',
        }}>
          {Math.round(value)}{unit}
        </div>
      </div>
    </Field>
  );
}

function Btn({
  onClick, secondary, children,
}: { onClick: () => void; secondary?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        marginTop: 8,
        borderRadius: 9,
        padding: '10px 12px',
        background: secondary
          ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(135deg, #AF1419, #c9181f)',
        border: secondary
          ? '1px solid rgba(255,255,255,0.10)'
          : 'none',
        color: secondary ? '#8a8f9a' : '#fff',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: secondary ? 400 : 700,
        cursor: 'pointer',
        letterSpacing: '0.03em',
        boxShadow: secondary ? 'none' : '0 4px 18px rgba(175,20,25,0.38)',
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function FileField({ label, accept, onChange }: {
  label: string; accept: string; onChange: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label}>
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ width: '100%' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }}
      />
    </Field>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main component                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function WelcomeGenerator() {
  const [st, setSt] = useState<AppState>(DEFAULT);
  const [scale, setScale] = useState(1);

  const stageRef = useRef<HTMLDivElement>(null);

  // Track stage scale via ResizeObserver
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(w / STAGE_SIZE);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const set = useCallback(<K extends keyof AppState>(key: K, val: AppState[K]) => {
    setSt(prev => ({ ...prev, [key]: val }));
  }, []);

  /* ── file uploads ── */
  async function onTexture(file: File) {
    set('textureSrc', await readFileAsDataURL(file));
  }
  async function onLogo(file: File) {
    set('logoSrc', await readFileAsDataURL(file));
  }
  async function onPlayer(file: File) {
    const src = await readFileAsDataURL(file);
    try {
      const img = await loadImage(src);
      setSt(prev => ({ ...prev, playerSrc: src, playerNaturalW: img.width, playerNaturalH: img.height }));
    } catch {
      setSt(prev => ({ ...prev, playerSrc: src, playerNaturalW: 0, playerNaturalH: 0 }));
    }
  }
  async function onPen(file: File) {
    const src = await readFileAsDataURL(file);
    try {
      const img = await loadImage(src);
      setSt(prev => ({ ...prev, penSrc: src, penNaturalW: img.width, penNaturalH: img.height }));
    } catch {
      setSt(prev => ({ ...prev, penSrc: src, penNaturalW: 0, penNaturalH: 0 }));
    }
  }

  /* ── drag player on stage ── */
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef({ x: 0, y: 0 });

  function onStagePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!st.playerSrc) return;
    dragging.current = true;
    stageRef.current!.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOrigin.current = { x: st.playerX, y: st.playerY };
  }
  function onStagePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const rect = stageRef.current!.getBoundingClientRect();
    const ratio = STAGE_SIZE / rect.width;
    const dx = (e.clientX - dragStart.current.x) * ratio;
    const dy = (e.clientY - dragStart.current.y) * ratio;
    setSt(prev => ({
      ...prev,
      playerX: Math.round(dragOrigin.current.x + dx),
      playerY: Math.round(dragOrigin.current.y + dy),
    }));
  }
  function onStagePointerUp() { dragging.current = false; }

  /* ── resets ── */
  function resetTexture() { setSt(prev => ({ ...prev, textureSrc: '' })); }
  function resetLogo() {
    setSt(prev => ({ ...prev, logoSrc: '', logoY: 0, logoSize: 168 }));
  }
  function resetPen() {
    setSt(prev => ({
      ...prev, penSrc: '', penNaturalW: 0, penNaturalH: 0,
      penX: 324, penY: 794, penSize: 130, penRotate: -18,
    }));
  }
  function resetPlayer() {
    setSt(prev => ({
      ...prev,
      playerSrc: '', playerNaturalW: 0, playerNaturalH: 0,
      playerX: 0, playerY: 0, playerScale: 1, playerOpacity: 1,
      playerBrightness: 1, playerContrast: 1, playerSaturation: 1, playerSharpness: 0,
    }));
  }

  /* ── export PNG ── */
  async function exportPNG() {
    await document.fonts.ready;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#AF1419';
    ctx.fillRect(0, 0, 1080, 1080);

    // Texture
    if (st.textureSrc) {
      try { ctx.drawImage(await loadImage(st.textureSrc), 0, 0, 1080, 1080); } catch { /* ignore */ }
    }

    // WELCOME fill
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${st.welcomeSize}px Rubik, Arial, sans-serif`;
    ctx.fillStyle = st.welcomeFillColor;
    ctx.fillText('WELCOME', 540 + st.welcomeX, 290 + st.welcomeY);
    // WELCOME outline
    ctx.lineWidth = st.welcomeStroke;
    ctx.strokeStyle = rgbaFromHex(st.welcomeOutlineColor, st.welcomeOutlineOpacity);
    ctx.strokeText('WELCOME', 540 + st.welcomeX, 290 + st.welcomeY + st.welcomeGap);
    ctx.restore();

    // Player
    if (st.playerSrc) {
      try {
        const player = await loadImage(st.playerSrc);
        const BASE = 900;
        const ratio = Math.min(BASE / player.width, BASE / player.height);
        const pw = Math.round(player.width * ratio * st.playerScale);
        const ph = Math.round(player.height * ratio * st.playerScale);

        const off = document.createElement('canvas');
        off.width = Math.max(1, pw);
        off.height = Math.max(1, ph);
        const octx = off.getContext('2d')!;

        octx.filter = `brightness(${st.playerBrightness}) contrast(${st.playerContrast}) saturate(${st.playerSaturation})`;
        octx.drawImage(player, 0, 0, pw, ph);
        octx.filter = 'none';

        if (st.playerSharpness > 0.001) {
          const src = octx.getImageData(0, 0, off.width, off.height);
          const out = octx.createImageData(off.width, off.height);
          const amt = st.playerSharpness * 1.2;
          const center = 1 + 4 * amt;
          const side = -amt;
          for (let y = 0; y < off.height; y++) {
            for (let x = 0; x < off.width; x++) {
              const i = (y * off.width + x) * 4;
              for (let c = 0; c < 3; c++) {
                const idx = i + c;
                const l = x > 0 ? src.data[idx - 4] : src.data[idx];
                const r = x < off.width - 1 ? src.data[idx + 4] : src.data[idx];
                const u = y > 0 ? src.data[idx - off.width * 4] : src.data[idx];
                const d = y < off.height - 1 ? src.data[idx + off.width * 4] : src.data[idx];
                out.data[idx] = Math.max(0, Math.min(255, src.data[idx] * center + (l + r + u + d) * side));
              }
              out.data[i + 3] = src.data[i + 3];
            }
          }
          octx.putImageData(out, 0, 0);
        }

        ctx.save();
        ctx.globalAlpha = st.playerOpacity;
        ctx.drawImage(off, 540 + st.playerX - pw / 2, 540 + st.playerY - ph / 2, pw, ph);
        ctx.restore();
      } catch { /* ignore */ }
    }

    // Logo
    if (st.logoSrc) {
      try {
        const logo = await loadImage(st.logoSrc);
        const f = fitContain(logo.width, logo.height, st.logoSize, st.logoSize);
        ctx.drawImage(logo, 540 - st.logoSize / 2 + f.x, st.logoY + f.y, f.w, f.h);
      } catch { /* ignore */ }
    }

    // WE ARE text
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${st.weareSize}px "Courier New", monospace`;
    ctx.fillText(st.weareText, 540, st.weareY);

    // Player name
    ctx.textBaseline = 'alphabetic';
    ctx.font = `900 ${st.nameSize}px Rubik, Arial, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillText(st.playerName, 540, st.nameY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Signature
    ctx.save();
    ctx.translate(st.signatureX, st.signatureY);
    ctx.rotate(st.signatureRotate * Math.PI / 180);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${st.signatureSize}px "Birthstone", cursive`;
    ctx.fillText(st.signatureText, 0, 0);
    ctx.restore();

    // Pen
    if (st.penSrc) {
      try {
        const pen = await loadImage(st.penSrc);
        const f = fitContain(pen.width, pen.height, st.penSize, st.penSize);
        ctx.save();
        ctx.translate(st.penX, st.penY);
        ctx.rotate(st.penRotate * Math.PI / 180);
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 10;
        ctx.drawImage(pen, -st.penSize / 2 + f.x, -st.penSize / 2 + f.y, f.w, f.h);
        ctx.restore();
      } catch { /* ignore */ }
    }

    const link = document.createElement('a');
    link.download = 'welcome-hbs-1080x1080.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /* ── computed stage values ── */
  const BASE_PLAYER_SIZE = 900;
  const naturalW = st.playerNaturalW || BASE_PLAYER_SIZE;
  const naturalH = st.playerNaturalH || BASE_PLAYER_SIZE;
  const baseRatio = Math.min(BASE_PLAYER_SIZE / naturalW, BASE_PLAYER_SIZE / naturalH);
  const baseW = naturalW * baseRatio * scale;
  const baseH = naturalH * baseRatio * scale;

  const sharpenEnabled = st.playerSharpness > 0.001;
  const sharpKW = +(st.playerSharpness * 1.2).toFixed(2);
  const sharpCenter = +(1 + 4 * sharpKW).toFixed(2);
  const sharpSide = +(-sharpKW).toFixed(2);
  const sharpMatrix = `0 ${sharpSide} 0 ${sharpSide} ${sharpCenter} ${sharpSide} 0 ${sharpSide} 0`;

  const outlineColor = rgbaFromHex(st.welcomeOutlineColor, st.welcomeOutlineOpacity);

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  Render                                                                    */
  /* ────────────────────────────────────────────────────────────────────────── */

  return (
    <div style={{
      display: 'flex', gap: 20, padding: 20, alignItems: 'flex-start', direction: 'ltr',
      minHeight: '100vh', background: '#080b12',
    }}>
      {/* SVG sharpness filter */}
      <svg width="0" height="0" style={{ position: 'absolute', left: -9999, top: -9999 }} aria-hidden>
        <filter id="sharpFilter">
          <feConvolveMatrix id="sharpConvolve" order={3} kernelMatrix={sharpMatrix} divisor={1} bias={0} />
        </filter>
      </svg>

      {/* ── Controls ── */}
      <div style={{
        width: 360,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 18,
        borderRadius: 16,
        direction: 'rtl',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, #AF1419, #e8373e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>מחולל WELCOME</h2>

        {/* Background */}
        <SectionTitle>רקע</SectionTitle>
        <FileField label="טעינת טקסטורה" accept="image/*" onChange={onTexture} />
        <Btn secondary onClick={resetTexture}>איפוס טקסטורה</Btn>

        {/* Logo */}
        <SectionTitle>טען לוגו</SectionTitle>
        <FileField label="טעינת לוגו" accept="image/*" onChange={onLogo} />
        <RangeField label="מיקום לוגו למעלה/למטה" min={0} max={300} value={st.logoY}
          onChange={v => set('logoY', v)} />
        <RangeField label="גודל לוגו" min={40} max={300} value={st.logoSize} unit="px"
          onChange={v => set('logoSize', v)} />
        <Btn secondary onClick={resetLogo}>איפוס לוגו</Btn>

        {/* We Are text */}
        <SectionTitle>טקסט עליון</SectionTitle>
        <Field label="טקסט עליון">
          <TextInput value={st.weareText} onChange={v => set('weareText', v)} />
        </Field>
        <RangeField label="מיקום למעלה/למטה" min={0} max={400} value={st.weareY}
          onChange={v => set('weareY', v)} />
        <RangeField label="גודל טקסט עליון" min={8} max={80} value={st.weareSize} unit="px"
          onChange={v => set('weareSize', v)} />

        {/* Player image */}
        <SectionTitle>טען תמונת שחקן</SectionTitle>
        <FileField label="טעינת תמונת שחקן" accept="image/*" onChange={onPlayer} />
        <RangeField label="מיקום אופקי שחקן" min={-500} max={500} value={st.playerX}
          onChange={v => set('playerX', v)} />
        <RangeField label="מיקום אנכי שחקן" min={-500} max={500} value={st.playerY}
          onChange={v => set('playerY', v)} />
        <RangeField label="גודל שחקן" min={10} max={250} value={Math.round(st.playerScale * 100)} unit="%"
          onChange={v => set('playerScale', v / 100)} />
        <RangeField label="שקיפות שחקן" min={0} max={100} value={Math.round(st.playerOpacity * 100)} unit="%"
          onChange={v => set('playerOpacity', v / 100)} />

        {/* Image adjustments */}
        <SectionTitle>שיפור תמונת שחקן</SectionTitle>
        <RangeField label="בהירות" min={50} max={150} value={Math.round(st.playerBrightness * 100)} unit="%"
          onChange={v => set('playerBrightness', v / 100)} />
        <RangeField label="ניגודיות" min={50} max={180} value={Math.round(st.playerContrast * 100)} unit="%"
          onChange={v => set('playerContrast', v / 100)} />
        <RangeField label="רוויה" min={0} max={200} value={Math.round(st.playerSaturation * 100)} unit="%"
          onChange={v => set('playerSaturation', v / 100)} />
        <RangeField label="חידוד" min={0} max={100} value={Math.round(st.playerSharpness * 100)} unit="%"
          onChange={v => set('playerSharpness', v / 100)} />

        {/* WELCOME text */}
        <SectionTitle>WELCOME</SectionTitle>
        <RangeField label="מיקום אופקי WELCOME" min={-500} max={500} value={st.welcomeX}
          onChange={v => set('welcomeX', v)} />
        <RangeField label="מיקום אנכי WELCOME" min={-500} max={500} value={st.welcomeY}
          onChange={v => set('welcomeY', v)} />
        <RangeField label="גודל WELCOME" min={40} max={300} value={st.welcomeSize} unit="px"
          onChange={v => set('welcomeSize', v)} />
        <RangeField label="רווח בין WELCOME עליון לתחתון" min={40} max={260} value={st.welcomeGap} unit="px"
          onChange={v => set('welcomeGap', v)} />
        <RangeField label="עובי קו WELCOME תחתון" min={1} max={8} value={st.welcomeStroke} unit="px"
          onChange={v => set('welcomeStroke', v)} />
        <RangeField label="שקיפות WELCOME תחתון" min={0} max={100} value={Math.round(st.welcomeOutlineOpacity * 100)} unit="%"
          onChange={v => set('welcomeOutlineOpacity', v / 100)} />
        <Field label="צבע WELCOME עליון">
          <input type="color" value={st.welcomeFillColor}
            onChange={e => set('welcomeFillColor', e.target.value)}
            style={{ width: '100%', height: 40, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} />
        </Field>
        <Field label="צבע WELCOME תחתון">
          <input type="color" value={st.welcomeOutlineColor}
            onChange={e => set('welcomeOutlineColor', e.target.value)}
            style={{ width: '100%', height: 40, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} />
        </Field>

        {/* Player name */}
        <SectionTitle>שם שחקן</SectionTitle>
        <Field label="טקסט">
          <TextInput value={st.playerName} onChange={v => set('playerName', v)} />
        </Field>
        <RangeField label="גודל שם שחקן" min={40} max={220} value={st.nameSize} unit="px"
          onChange={v => set('nameSize', v)} />
        <RangeField label="מיקום שם שחקן למעלה/למטה" min={700} max={1070} value={st.nameY}
          onChange={v => set('nameY', v)} />

        {/* Signature */}
        <SectionTitle>חתימת שחקן</SectionTitle>
        <Field label="טקסט חתימה">
          <TextInput value={st.signatureText} onChange={v => set('signatureText', v)} />
        </Field>
        <RangeField label="מיקום אופקי חתימה" min={0} max={1080} value={st.signatureX}
          onChange={v => set('signatureX', v)} />
        <RangeField label="מיקום אנכי חתימה" min={0} max={1080} value={st.signatureY}
          onChange={v => set('signatureY', v)} />
        <RangeField label="גודל חתימה" min={20} max={220} value={st.signatureSize} unit="px"
          onChange={v => set('signatureSize', v)} />
        <RangeField label="זווית חתימה" min={-45} max={45} value={st.signatureRotate} unit="°"
          onChange={v => set('signatureRotate', v)} />

        {/* Pen icon */}
        <SectionTitle>עט נובע / אייקון עט</SectionTitle>
        <FileField label="טעינת אייקון עט" accept="image/*" onChange={onPen} />
        <RangeField label="מיקום אופקי עט" min={0} max={1080} value={st.penX}
          onChange={v => set('penX', v)} />
        <RangeField label="מיקום אנכי עט" min={0} max={1080} value={st.penY}
          onChange={v => set('penY', v)} />
        <RangeField label="גודל עט" min={30} max={400} value={st.penSize} unit="px"
          onChange={v => set('penSize', v)} />
        <RangeField label="זווית עט" min={-180} max={180} value={st.penRotate} unit="°"
          onChange={v => set('penRotate', v)} />

        <Btn secondary onClick={resetPen}>איפוס עט</Btn>
        <Btn secondary onClick={resetPlayer}>איפוס שחקן</Btn>
        <Btn onClick={exportPNG}>ייצוא PNG 1080×1080</Btn>
      </div>

      {/* ── Preview ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 16,
          borderRadius: 16,
        }}>
          <div style={{
            textAlign: 'center',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7a8090',
            marginBottom: 12,
            direction: 'rtl',
          }}>
            תצוגה מקדימה
          </div>

          {/* Stage */}
          <div
            ref={stageRef}
            onPointerDown={onStagePointerDown}
            onPointerMove={onStagePointerMove}
            onPointerUp={onStagePointerUp}
            onPointerCancel={onStagePointerUp}
            onPointerLeave={onStagePointerUp}
            style={{
              width: 700,
              maxWidth: 'calc(100vw - 470px)',
              aspectRatio: '1 / 1',
              position: 'relative',
              background: '#AF1419',
              overflow: 'hidden',
              cursor: st.playerSrc ? 'grab' : 'default',
            }}
          >
            {/* Texture */}
            {st.textureSrc && (
              <img
                src={st.textureSrc}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              />
            )}

            {/* WELCOME fill */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: `${290 * scale}px`,
              transform: `translate(calc(-50% + ${st.welcomeX * scale}px), calc(-50% + ${st.welcomeY * scale}px))`,
              width: 'max-content',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
            }}>
              <div style={{
                fontFamily: 'Rubik, Arial, sans-serif',
                fontSize: `${st.welcomeSize * scale}px`,
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: st.welcomeFillColor,
              }}>
                WELCOME
              </div>
              <div style={{
                fontFamily: 'Rubik, Arial, sans-serif',
                fontSize: `${st.welcomeSize * scale}px`,
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                color: 'transparent',
                WebkitTextStroke: `${Math.max(1, st.welcomeStroke * scale)}px ${outlineColor}`,
                marginTop: `${(st.welcomeGap - st.welcomeSize * 0.9) * scale}px`,
              }}>
                WELCOME
              </div>
            </div>

            {/* Player image */}
            {st.playerSrc && (
              <img
                src={st.playerSrc}
                alt=""
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  transform: `translate(calc(-50% + ${st.playerX * scale}px), calc(-50% + ${st.playerY * scale}px)) scale(${st.playerScale})`,
                  transformOrigin: 'center center',
                  objectFit: 'contain',
                  maxWidth: 'none',
                  opacity: st.playerOpacity,
                  filter: `${sharpenEnabled ? 'url(#sharpFilter) ' : ''}brightness(${st.playerBrightness}) contrast(${st.playerContrast}) saturate(${st.playerSaturation})`,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            )}

            {/* Logo */}
            {st.logoSrc && (
              <img
                src={st.logoSrc}
                alt=""
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: `${st.logoY * scale}px`,
                  width: `${st.logoSize * scale}px`,
                  height: `${st.logoSize * scale}px`,
                  transform: 'translateX(-50%)',
                  objectFit: 'contain',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* WE ARE text */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: `${st.weareY * scale}px`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              fontFamily: '"Courier New", monospace',
              fontSize: `${st.weareSize * scale}px`,
              lineHeight: 1,
              zIndex: 5,
              width: 'max-content',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              color: '#fff',
            }}>
              {st.weareText}
            </div>

            {/* Player name */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: `${st.nameY * scale}px`,
              transform: 'translateX(-50%) translateY(-100%)',
              width: '92%',
              textAlign: 'center',
              fontSize: `${st.nameSize * scale}px`,
              fontWeight: 900,
              lineHeight: 0.9,
              zIndex: 6,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textShadow: '0 4px 16px rgba(0,0,0,.28)',
              color: '#fff',
            }}>
              {st.playerName}
            </div>

            {/* Signature */}
            <div style={{
              position: 'absolute',
              left: `${st.signatureX * scale}px`,
              top: `${st.signatureY * scale}px`,
              transform: `translate(-50%,-50%) rotate(${st.signatureRotate}deg)`,
              fontFamily: '"Birthstone", cursive',
              fontSize: `${st.signatureSize * scale}px`,
              color: '#fff',
              lineHeight: 1,
              zIndex: 7,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textShadow: '0 2px 12px rgba(0,0,0,.22)',
              userSelect: 'none',
            }}>
              {st.signatureText}
            </div>

            {/* Pen */}
            {st.penSrc && (
              <img
                src={st.penSrc}
                alt=""
                style={{
                  position: 'absolute',
                  left: `${st.penX * scale}px`,
                  top: `${st.penY * scale}px`,
                  width: `${st.penSize * scale}px`,
                  height: `${st.penSize * scale}px`,
                  transform: `translate(-50%,-50%) rotate(${st.penRotate}deg)`,
                  transformOrigin: 'center center',
                  objectFit: 'contain',
                  maxWidth: 'none',
                  filter: 'drop-shadow(0 2px 10px rgba(0,0,0,.18))',
                  zIndex: 8,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 10, color: '#4a5060', direction: 'rtl', textAlign: 'center', letterSpacing: '0.02em' }}>
            אפשר לגרור את השחקן עם העכבר בתוך התצוגה. את העט ממקמים בעזרת הפקדים.
          </div>
        </div>
      </div>
    </div>
  );
}
