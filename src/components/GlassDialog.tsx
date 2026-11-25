"use client";

import { useEffect, useRef } from "react";

type GlassDialogProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  wide?: boolean;
  children: React.ReactNode;
};

/** Modal vitrificado sobre o <dialog> nativo: foco preso, Esc fecha e o fundo desfoca. */
export function GlassDialog({ open, onClose, label, wide = false, children }: GlassDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Pausa a rolagem suave em vez de esconder o overflow do <html>, que jogava a página para o topo.
      window.a3Lenis?.stop();
    }
    if (!open && dialog.open) {
      dialog.dataset.closing = "";
      const timer = window.setTimeout(() => {
        dialog.close();
        delete dialog.dataset.closing;
      }, 160);
      window.a3Lenis?.start();
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`glass-dialog glass-strong fixed inset-0 m-auto max-h-[min(92svh,900px)] overflow-y-auto overscroll-contain rounded-[28px] p-0 text-pearl`}
      style={{ width: `min(100% - 24px, ${wide ? 1120 : 760}px)` }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="sticky right-4 top-4 z-10 float-right mr-4 mt-4 grid size-11 place-items-center rounded-full border border-white/15 bg-black/40 text-silver backdrop-blur transition hover:text-pearl"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {children}
    </dialog>
  );
}
