"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const DRAG_THRESHOLD = 6;
const GLIDE_MS = 650;

const Arrow = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" className={`size-5 ${flip ? "rotate-180" : ""}`} aria-hidden="true">
    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Fileira de cards que rola para o lado: setas de vidro, arrastar com o mouse
 * e o deslizar normal do dedo no celular.
 */
export function Rail({ children, label }: { children: ReactNode; label: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setEdges({ start: rail.scrollLeft < 8, end: rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const tween = useRef(0);

  // Rolagem própria com desaceleração suave: o scroll-behavior nativo briga com o snap e dá trancos.
  const glideTo = (target: number) => {
    const rail = railRef.current;
    if (!rail) return;
    cancelAnimationFrame(tween.current);
    const from = rail.scrollLeft;
    const to = Math.max(0, Math.min(target, rail.scrollWidth - rail.clientWidth));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rail.scrollLeft = to;
      return;
    }
    const start = performance.now();
    rail.style.scrollSnapType = "none";
    const step = (now: number) => {
      const t = Math.min((now - start) / GLIDE_MS, 1);
      rail.scrollLeft = from + (to - from) * (1 - Math.pow(1 - t, 4));
      if (t < 1) tween.current = requestAnimationFrame(step);
      else rail.style.scrollSnapType = "";
    };
    tween.current = requestAnimationFrame(step);
  };

  const page = (direction: 1 | -1) => {
    const rail = railRef.current;
    const card = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !card) return;
    const stride = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || "0");
    const perPage = Math.max(1, Math.floor((rail.clientWidth + 1) / stride));
    const current = Math.round(rail.scrollLeft / stride);
    glideTo((current + direction * perPage) * stride);
  };

  const buttonClass =
    "glass grid size-11 place-items-center rounded-full text-pearl transition-opacity duration-200 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" className={buttonClass} onClick={() => page(-1)} disabled={edges.start} aria-label={`${label}: anteriores`}>
          <Arrow flip />
        </button>
        <button type="button" className={buttonClass} onClick={() => page(1)} disabled={edges.end} aria-label={`${label}: próximos`}>
          <Arrow />
        </button>
      </div>
      <div
        ref={railRef}
        role="region"
        aria-label={label}
        className="rail cursor-grab active:cursor-grabbing"
        onScroll={updateEdges}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !railRef.current) return;
          drag.current = { x: event.clientX, left: railRef.current.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          const rail = railRef.current;
          if (!drag.current || !rail) return;
          cancelAnimationFrame(tween.current);
          const delta = event.clientX - drag.current.x;
          if (!drag.current.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
          if (!drag.current.moved) {
            drag.current.moved = true;
            rail.style.scrollSnapType = "none";
          }
          rail.scrollLeft = drag.current.left - delta;
        }}
        onPointerUp={() => {
          const rail = railRef.current;
          const card = rail?.firstElementChild as HTMLElement | null;
          if (rail && card && drag.current?.moved) {
            const stride = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || "0");
            glideTo(Math.round(rail.scrollLeft / stride) * stride);
          } else if (rail) rail.style.scrollSnapType = "";
          window.setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          if (railRef.current) railRef.current.style.scrollSnapType = "";
          drag.current = null;
        }}
        onClickCapture={(event) => {
          // Depois de arrastar, soltar o mouse em cima de um card não abre o carro.
          if (drag.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </div>
    </div>
  );
}
