'use client';

import { useEffect, useRef } from 'react';

export type WeatherCondition =
  | 'Clear' | 'Clouds' | 'Rain' | 'Drizzle'
  | 'Thunderstorm' | 'Snow' | 'Mist' | 'Fog' | 'Haze'
  | string;

interface WeatherBackgroundProps {
  condition?: WeatherCondition;
  icon?: string; // OWM icon code — "n" suffix = night
}

// ─── 배경 그라데이션 ────────────────────────────────────────────────────────
const GRADIENTS: Record<string, [string, string, string]> = {
  Clear_day:   ['#f59e0b', '#fb923c', '#38bdf8'],
  Clear_night: ['#0f172a', '#1e3a5f', '#0c4a6e'],
  Clouds:      ['#475569', '#64748b', '#94a3b8'],
  Rain:        ['#1e3a5f', '#1e40af', '#334155'],
  Drizzle:     ['#2d4a6e', '#3b5998', '#475569'],
  Thunderstorm:['#1a0533', '#2d1b4e', '#1e293b'],
  Snow:        ['#bfdbfe', '#e0f2fe', '#f0f9ff'],
  Mist:        ['#94a3b8', '#cbd5e1', '#e2e8f0'],
  Fog:         ['#94a3b8', '#cbd5e1', '#e2e8f0'],
  Haze:        ['#b45309', '#d97706', '#fbbf24'],
};

function getGradient(condition: string, isNight: boolean): [string, string, string] {
  if (condition === 'Clear') return isNight ? GRADIENTS.Clear_night : GRADIENTS.Clear_day;
  return GRADIENTS[condition] ?? ['#38bdf8', '#0284c7', '#075985'];
}

// ─── 파티클 정의 ────────────────────────────────────────────────────────────
interface Drop  { x: number; y: number; speed: number; length: number; opacity: number }
interface Flake { x: number; y: number; r: number; speed: number; drift: number; phase: number }
interface Spark { x: number; y: number; size: number; vx: number; vy: number; life: number; maxLife: number }
interface Star  { x: number; y: number; r: number; phase: number; speed: number }
interface Blob  { x: number; y: number; r: number; vx: number; vy: number; opacity: number }
interface Cloud { x: number; y: number; r: number; speed: number; opacity: number }

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────────────
export function WeatherBackground({ condition = 'Clear', icon = '01d' }: WeatherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isNight = icon.endsWith('n');
  const [c0, c1, c2] = getGradient(condition, isNight);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let lightning = 0; // 번개 카운터

    // 캔버스 크기 동기화
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── 파티클 초기화 ────────────────────────────────────────────────────────
    const W = () => canvas.width;
    const H = () => canvas.height;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    // 비 / 소나기 / 뇌우
    const drops: Drop[] = Array.from({ length: condition === 'Thunderstorm' ? 200 : 120 }, () => ({
      x:       rnd(0, 1) * (W() || 400),
      y:       rnd(0, 1) * (H() || 800),
      speed:   rnd(12, 22),
      length:  rnd(14, 28),
      opacity: rnd(0.35, 0.65),
    }));

    // 눈
    const flakes: Flake[] = Array.from({ length: 80 }, () => ({
      x:     rnd(0, W() || 400),
      y:     rnd(0, H() || 800),
      r:     rnd(2, 5),
      speed: rnd(1, 3),
      drift: rnd(-0.6, 0.6),
      phase: rnd(0, Math.PI * 2),
    }));

    // 맑음 — 낮 (반짝이는 파티클)
    const sparks: Spark[] = Array.from({ length: 60 }, () => ({
      x:       rnd(0, W() || 400),
      y:       rnd(0, H() || 800),
      size:    rnd(1.5, 3.5),
      vx:      rnd(-0.3, 0.3),
      vy:      rnd(-0.5, -0.15),
      life:    rnd(0, 120),
      maxLife: rnd(80, 160),
    }));

    // 맑음 — 밤 (별)
    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x:     rnd(0, W() || 400),
      y:     rnd(0, H() || 800),
      r:     rnd(0.8, 2.2),
      phase: rnd(0, Math.PI * 2),
      speed: rnd(0.01, 0.04),
    }));

    // 안개 / 연무
    const blobs: Blob[] = Array.from({ length: 12 }, () => ({
      x:       rnd(0, W() || 400),
      y:       rnd(0, H() || 800),
      r:       rnd(120, 250),
      vx:      rnd(-0.25, 0.25),
      vy:      rnd(-0.1, 0.1),
      opacity: rnd(0.04, 0.1),
    }));

    // 구름
    const clouds: Cloud[] = Array.from({ length: 8 }, () => ({
      x:       rnd(0, W() || 400),
      y:       rnd(H() * 0.1, H() * 0.6),
      r:       rnd(60, 130),
      speed:   rnd(0.15, 0.4),
      opacity: rnd(0.06, 0.14),
    }));

    // ── 그라데이션 배경 그리기 ────────────────────────────────────────────────
    const drawBg = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, H());
      grad.addColorStop(0,   c0);
      grad.addColorStop(0.5, c1);
      grad.addColorStop(1,   c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());
    };

    // ── 번개 ─────────────────────────────────────────────────────────────────
    const drawLightning = () => {
      if (lightning > 0) {
        ctx.fillStyle = `rgba(255,255,220,${Math.min(lightning / 8, 0.35)})`;
        ctx.fillRect(0, 0, W(), H());
        lightning--;
      } else if (Math.random() < 0.004) {
        lightning = Math.floor(rnd(4, 10));
      }
    };

    // ── 애니메이션 루프 ───────────────────────────────────────────────────────
    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W(), H());
      drawBg();

      // --- Rain / Drizzle / Thunderstorm ---
      if (['Rain', 'Drizzle', 'Thunderstorm'].includes(condition)) {
        if (condition === 'Thunderstorm') drawLightning();
        ctx.save();
        ctx.strokeStyle = 'rgba(180,210,255,0.55)';
        ctx.lineWidth = condition === 'Drizzle' ? 1 : 1.5;
        for (const d of drops) {
          d.y += d.speed;
          d.x -= d.speed * 0.2;
          if (d.y > H()) { d.y = -d.length; d.x = rnd(0, W()); }
          if (d.x < 0)   { d.x = W(); }
          ctx.globalAlpha = d.opacity;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.length * 0.2, d.y + d.length);
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- Snow ---
      if (condition === 'Snow') {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (const f of flakes) {
          f.y += f.speed;
          f.x += f.drift + Math.sin(t * 0.015 + f.phase) * 0.4;
          if (f.y > H() + 10) { f.y = -10; f.x = rnd(0, W()); }
          if (f.x > W() + 10) f.x = -10;
          if (f.x < -10)      f.x = W() + 10;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Clear day (sparks) ---
      if (condition === 'Clear' && !isNight) {
        ctx.save();
        for (const s of sparks) {
          s.x += s.vx;
          s.y += s.vy;
          s.life++;
          if (s.life > s.maxLife) {
            Object.assign(s, {
              x: rnd(0, W()), y: rnd(H() * 0.3, H()),
              life: 0, maxLife: rnd(80, 160),
              vx: rnd(-0.3, 0.3), vy: rnd(-0.5, -0.15),
            });
          }
          const alpha = Math.sin((s.life / s.maxLife) * Math.PI) * 0.7;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = 'rgba(255,255,200,1)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 태양 글로우 (우상단)
        ctx.save();
        const gx = W() * 0.82, gy = H() * 0.12;
        const sunGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 220);
        sunGrad.addColorStop(0,   'rgba(255,230,100,0.35)');
        sunGrad.addColorStop(0.5, 'rgba(255,180,50,0.12)');
        sunGrad.addColorStop(1,   'rgba(255,150,0,0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(gx, gy, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- Clear night (stars) ---
      if (condition === 'Clear' && isNight) {
        ctx.save();
        for (const s of stars) {
          s.phase += s.speed;
          const alpha = 0.4 + Math.sin(s.phase) * 0.4;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        // 달 (좌상단)
        ctx.globalAlpha = 0.9;
        const mx = W() * 0.78, my = H() * 0.1, mr = 36;
        const moonGrad = ctx.createRadialGradient(mx - 4, my - 4, 2, mx, my, mr);
        moonGrad.addColorStop(0, 'rgba(255,250,220,0.95)');
        moonGrad.addColorStop(1, 'rgba(200,220,255,0)');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();
        // 달 안쪽 크레센트 마스크
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(mx + 14, my - 6, mr * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }

      // --- Clouds ---
      if (condition === 'Clouds') {
        ctx.save();
        for (const c of clouds) {
          c.x += c.speed;
          if (c.x - c.r > W()) c.x = -c.r;
          ctx.globalAlpha = c.opacity;
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(c.x,            c.y,            c.r,          0, Math.PI * 2);
          ctx.arc(c.x + c.r * 0.6, c.y - c.r * 0.3, c.r * 0.65,  0, Math.PI * 2);
          ctx.arc(c.x + c.r * 1.2, c.y,            c.r * 0.8,   0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Mist / Fog / Haze ---
      if (['Mist', 'Fog', 'Haze'].includes(condition)) {
        ctx.save();
        for (const b of blobs) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x - b.r > W()) b.x = -b.r;
          if (b.x + b.r < 0)   b.x = W() + b.r;
          if (b.y - b.r > H()) b.y = -b.r;
          if (b.y + b.r < 0)   b.y = H() + b.r;
          const fogGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          fogGrad.addColorStop(0, `rgba(255,255,255,${b.opacity})`);
          fogGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [condition, isNight, c0, c1, c2]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
