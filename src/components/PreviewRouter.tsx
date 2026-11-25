"use client";

import { useEffect, useRef, useState } from "react";
import type { Vehicle } from "@/lib/inventory";
import { PREVIEW_PREFIX, relatedTo } from "@/lib/routes";
import { Footer } from "./Store";
import { VehicleTopBar } from "./VehicleTopBar";
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
      <VehicleTopBar />
      <VehicleView key={vehicle.slug} vehicle={vehicle} related={relatedTo(vehicle, vehicles)} />
      <Footer />
    </div>
  );
}
