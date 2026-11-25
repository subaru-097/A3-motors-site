"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";

const FADE_MS = 500;
const FAILSAFE_MS = 9000;

/** Tela de entrada: logo da A3 e uma barra branca enquanto a capa e o começo do vídeo carregam. */
export function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const finish = () => setPhase((current) => (current === "loading" ? "leaving" : current));
    const onProgress = (event: Event) => {
      const value = (event as CustomEvent<number>).detail;
      setProgress(value);
      if (value >= 1) window.setTimeout(finish, 250);
    };
    if (window.a3LoadProgress) setProgress(window.a3LoadProgress);
    window.addEventListener("a3:loading", onProgress);
    const failsafe = window.setTimeout(finish, FAILSAFE_MS);
    return () => {
      window.removeEventListener("a3:loading", onProgress);
      window.clearTimeout(failsafe);
      root.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    document.documentElement.style.overflow = "";
    const timer = window.setTimeout(() => setPhase("gone"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando o site da A3 Motors"
      className={`loader fixed inset-0 z-[100] grid place-items-center bg-night transition-opacity duration-500 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex w-[min(240px,60vw)] flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <img src={STORE.logo} alt="" width={44} height={44} className="size-11 brightness-0 invert" />
          <span className="font-display text-[22px] tracking-[0.2em] text-white">A3 MOTORS</span>
        </div>
        <div className="h-px w-full overflow-hidden bg-white/15">
          <div
            className="h-full bg-white transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
