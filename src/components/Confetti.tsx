import { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: number;
}

const COLORS = ['#22c55e', '#a855f7', '#3b82f6', '#f97316', '#ec4899', '#fbbf24', '#06b6d4'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

export default function Confetti({ trigger }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 6,
      vy: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      frame++;

      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        if (frame > 80) p.opacity -= 0.015;

        if (p.y < canvas!.height + 50 && p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          ctx.restore();
        }
      });

      if (alive) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    cancelAnimationFrame(animRef.current);
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [trigger]);

  if (trigger === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
