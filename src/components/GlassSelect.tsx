"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

type GlassSelectProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`size-4 text-mist transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Lista suspensa de vidro, no lugar do select nativo (que abre a caixa quadrada do sistema). */
export function GlassSelect<T extends string>({ label, value, options, onChange }: GlassSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] text-silver transition-colors hover:bg-white/[0.06] hover:text-pearl"
      >
        <span className="hidden text-mist sm:inline">{label}</span>
        <span className="text-pearl">{current?.label}</span>
        <Chevron open={open} />
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        data-open={open}
        className="glass-strong absolute right-0 top-[calc(100%+10px)] !bg-[rgb(14_14_14/0.94)] z-30 min-w-[200px] origin-top-right rounded-[18px] p-1.5 opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out-quint)] [transform:scale(0.96)_translateY(-4px)] pointer-events-none data-[open=true]:pointer-events-auto data-[open=true]:opacity-100 data-[open=true]:[transform:none]"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <li key={option.value} role="option" aria-selected={selected}>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between gap-4 rounded-[12px] px-3.5 text-left text-[14px] transition-colors ${
                  selected ? "bg-white/[0.09] text-pearl" : "text-silver hover:bg-white/[0.05] hover:text-pearl"
                }`}
              >
                {option.label}
                {selected && (
                  <svg viewBox="0 0 24 24" className="size-4 text-pearl" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
