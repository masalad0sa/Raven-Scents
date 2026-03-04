import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const outerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = () => outerRef.current?.classList.add('hovered');
    const onLeave = () => outerRef.current?.classList.remove('hovered');

    window.addEventListener('mousemove', onMove);

    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    // Re-add listeners periodically for dynamically added elements
    const interval = setInterval(addListeners, 1000);
    addListeners();

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      if (innerRef.current) {
        innerRef.current.style.left = `${pos.current.x}px`;
        innerRef.current.style.top = `${pos.current.y}px`;
      }
      if (outerRef.current) {
        outerPos.current.x = lerp(outerPos.current.x, pos.current.x, 0.1);
        outerPos.current.y = lerp(outerPos.current.y, pos.current.y, 0.1);
        outerRef.current.style.left = `${outerPos.current.x}px`;
        outerRef.current.style.top = `${outerPos.current.y}px`;
      }
      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMove);
      clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={outerRef} className="cursor-outer" />
      <div ref={innerRef} className="cursor-inner" />
    </>
  );
}
