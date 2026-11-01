import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';

export const AmbientBackdrop: React.FC = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let step = 0;

    const handleResize = () => {
      canvas.width = Math.min(window.innerWidth, 960);
      canvas.height = Math.min(window.innerHeight, 720);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      step += 0.004;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Read root CSS variables
      const computed = getComputedStyle(document.documentElement);
      const domRgb = computed.getPropertyValue('--artwork-dominant-rgb').trim() || '84, 20, 33';
      const secRgb = computed.getPropertyValue('--artwork-secondary-rgb').trim() || '217, 188, 145';

      // Wine-Crimson Mesh 1
      const x1 = w * 0.3 + Math.sin(step) * 70;
      const y1 = h * 0.3 + Math.cos(step * 0.8) * 50;
      const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, w * 0.55);
      grad1.addColorStop(0, `rgba(${domRgb}, 0.32)`);
      grad1.addColorStop(0.6, `rgba(55, 13, 22, 0.15)`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Champagne-Wine Mesh 2
      const x2 = w * 0.7 + Math.cos(step * 0.85) * 60;
      const y2 = h * 0.7 + Math.sin(step * 0.65) * 55;
      const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, w * 0.5);
      grad2.addColorStop(0, `rgba(${secRgb}, 0.12)`);
      grad2.addColorStop(0.5, `rgba(84, 20, 33, 0.18)`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentTrack]);

  return (
    <>
      <canvas ref={canvasRef} className="ambient-backdrop-canvas" />
      <div className="ambient-gradient-mesh" />
    </>
  );
};
