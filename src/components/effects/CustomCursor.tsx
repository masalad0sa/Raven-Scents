import { useEffect, useRef } from "react";
import s from "./CustomCursor.module.css";

const SIZE = 20;
const SIZE_GROW = 44;

function isTouchDevice() {
  return (
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });
  const isGrown = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMove);

    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      current.current.x = lerp(current.current.x, pos.current.x, 0.14);
      current.current.y = lerp(current.current.y, pos.current.y, 0.14);

      if (cursorRef.current) {
        // Center the circle on the actual mouse position
        const size = isGrown.current ? SIZE_GROW : SIZE;
        const half = size / 2;
        cursorRef.current.style.transform = `translate(${current.current.x - half}px, ${current.current.y - half}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    const grow = () => {
      isGrown.current = true;
      if (cursorRef.current) {
        cursorRef.current.style.width = `${SIZE_GROW}px`;
        cursorRef.current.style.height = `${SIZE_GROW}px`;
      }
    };

    const shrink = () => {
      isGrown.current = false;
      if (cursorRef.current) {
        cursorRef.current.style.width = `${SIZE}px`;
        cursorRef.current.style.height = `${SIZE}px`;
      }
    };

    const trackedElements = new WeakSet<Element>();

    const attachListeners = () => {
      document
        .querySelectorAll(
          "a, button, input, select, label, textarea, [data-cursor]",
        )
        .forEach((el) => {
          if (trackedElements.has(el)) return;
          trackedElements.add(el);
          el.addEventListener("mouseenter", grow);
          el.addEventListener("mouseleave", shrink);
        });
    };

    let debounceTimer: ReturnType<typeof setTimeout>;
    const debouncedAttach = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(attachListeners, 100);
    };

    const observer = new MutationObserver(debouncedAttach);
    observer.observe(document.body, { childList: true, subtree: true });
    attachListeners();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, []);

  if (isTouchDevice()) return null;

  return (
    <div
      ref={cursorRef}
      className={s.cursor}
      style={{ width: SIZE, height: SIZE }}
    />
  );
}
