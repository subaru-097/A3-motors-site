/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VISIBLE_SIDE = 2;
const SWIPE_THRESHOLD = 40;

type CardGalleryProps = { images: string[]; title: string };

/**
 * Fotos como cartas em leque: a carta da frente em destaque e as vizinhas
 * escalonadas atrás, girando de leve. Arraste, use as setas ou toque numa vizinha.
 */
export function CardGallery({ images, title }: CardGalleryProps) {
  const [active, setActive] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const count = images.length;

  const go = useCallback((index: number) => setActive(((index % count) + count) % count), [count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(active + 1);
      if (event.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-[28px] bg-graphite text-mist">
        Veículo em preparação. Fotos em breve.
      </div>
    );
  }

  const offsetOf = (index: number) => {
    let offset = index - active;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    return offset;
  };

  return (
    <div className="select-none">
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label={`Fotos de ${title}`}
        className="relative mx-auto aspect-[16/10] w-full max-w-[min(1000px,86svh)] touch-pan-y [perspective:1600px]"
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, id: event.pointerId };
        }}
        onPointerUp={(event) => {
          if (!drag.current) return;
          const delta = event.clientX - drag.current.x;
          drag.current = null;
          if (Math.abs(delta) > SWIPE_THRESHOLD) go(active + (delta < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {images.map((src, index) => {
          const offset = offsetOf(index);
          const distance = Math.abs(offset);
          if (distance > VISIBLE_SIDE) return null;
          const isActive = offset === 0;
          return (
            <button
              key={src}
              type="button"
              tabIndex={isActive ? -1 : 0}
              aria-hidden={!isActive && distance > 1}
              aria-label={isActive ? undefined : `Ver foto ${index + 1}`}
              onClick={() => !isActive && go(index)}
              className="absolute inset-y-0 left-1/2 w-[78%] overflow-hidden rounded-[26px] border border-white/10 bg-graphite shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)] transition-[transform,opacity,filter] duration-500 ease-[var(--ease-out-quint)] max-sm:w-[86%]"
              style={{
                transform: `translateX(calc(-50% + ${offset * 34}%)) translateZ(${-distance * 140}px) rotateY(${-offset * 7}deg)`,
                zIndex: 10 - distance,
                opacity: distance === 0 ? 1 : distance === 1 ? 0.55 : 0.18,
                filter: isActive ? "none" : "saturate(0.7) brightness(0.7)",
                cursor: isActive ? "grab" : "pointer",
              }}
            >
              <img
                src={src}
                alt={isActive ? `${title}, foto ${index + 1} de ${count}` : ""}
                draggable={false}
                loading={distance === 0 ? "eager" : "lazy"}
                className="size-full object-cover"
              />
              {isActive && (
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              )}
            </button>
          );
        })}

        {count > 1 &&
          ([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => go(active + direction)}
              aria-label={direction === 1 ? "Próxima foto" : "Foto anterior"}
              className={`glass absolute top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full transition hover:bg-white/10 ${
                direction === 1 ? "right-2 sm:right-4" : "left-2 sm:left-4"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path d={direction === 1 ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="num text-[14px] text-silver" aria-live="polite">
          {active + 1} / {count}
        </span>
        <div className="flex max-w-[70vw] gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => go(index)}
              aria-label={`Foto ${index + 1}`}
              aria-current={index === active}
              className={`h-12 w-16 flex-none overflow-hidden rounded-[10px] border transition ${
                index === active ? "border-pearl opacity-100" : "border-white/10 opacity-50 hover:opacity-90"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
