"use client";

import { useEffect, useRef, useState } from "react";
import type { Vehicle } from "@/lib/inventory";
import { PREVIEW_PREFIX, relatedTo, stockHref } from "@/lib/routes";
import { Footer } from "./Store";
import { VehicleView } from "./VehicleView";

const slugFromHash = () =>
  window.location.hash.startsWith(PREVIEW_PREFIX) ? decodeURIComponent(window.location.hash.slice(PREVIEW_PREFIX.length)) : null;

/** Na prévia publicada não há rotas de servidor: #v-<slug> abre a página do carro por cima da home. */
export function PreviewRouter({ vehicles }: { vehicles: Vehicle[] }) {
  const [slug, setSlug] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setSlug(slugFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const vehicle = slug ? vehicles.find((item) => item.slug === slug) : undefined;

  useEffect(() => {
    document.documentElement.style.overflow = vehicle ? "hidden" : "";
    pageRef.current?.scrollTo({ top: 0 });
  }, [vehicle]);

  if (!vehicle) return null;

  return (
    <div ref={pageRef} data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-night">
      <div className="glass-strong fixed left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full py-2 pl-2 pr-5">
        <a href={stockHref} className="btn btn-ghost h-10 px-4 text-[14px]">
          ← Estoque
        </a>
        <span className="brand-wordmark font-display text-[15px] tracking-[0.18em]">A3 MOTORS</span>
      </div>
      <VehicleView key={vehicle.slug} vehicle={vehicle} related={relatedTo(vehicle, vehicles)} />
      <Footer />
    </div>
  );
}
