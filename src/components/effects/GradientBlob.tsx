import { useEffect, useRef } from 'react';

interface GradientBlobProps {
  className?: string;
  size?: number;
  reactToMouse?: boolean;
}

export function GradientBlob({ className = '', size = 700, reactToMouse = true }: GradientBlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!reactToMouse) return;

    const onMove = (e: MouseEvent) => {
      const el = blobRef.current?.parentElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left - size / 2,
        y: e.clientY - rect.top - size / 2,
      };
    };

    window.addEventListener('mousemove', onMove);

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x * 0.15, 0.04);
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y * 0.15, 0.04);
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reactToMouse, size]);

  return (
    <div
      ref={blobRef}
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(ellipse at 30% 40%, 
          #f9c0c0 0%, 
          #f5d08a 25%, 
          #c9a0f5 50%, 
          #a0c9f5 75%, 
          transparent 100%)`,
        filter: 'blur(60px)',
        opacity: 0.65,
        transition: 'transform 0.05s linear',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
}
