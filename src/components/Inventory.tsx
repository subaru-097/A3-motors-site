"use client";

import { useMemo, useState } from "react";
import type { Brand, Vehicle, VehicleType } from "@/lib/inventory";
import { GlassDialog } from "./GlassDialog";
import { GlassSelect } from "./GlassSelect";
import { Rail } from "./Rail";
import { VehicleCard } from "./VehicleCard";
import { vehicleHref } from "@/lib/routes";

const TYPES: { value: VehicleType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "carros", label: "Carros" },
  { value: "motos", label: "Motos" },
];
type SortKey = "recentes" | "maior" | "menor";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor", label: "Menor preço" },
  { value: "maior", label: "Maior preço" },
];

export function Inventory({ vehicles, brands }: { vehicles: Vehicle[]; brands: Brand[] }) {
  const [type, setType] = useState<VehicleType | "todos">("todos");
  const [brand, setBrand] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recentes");
  const [brandsOpen, setBrandsOpen] = useState(false);

  const featured = useMemo(
    () => [...vehicles].filter((vehicle) => vehicle.cover && vehicle.price).sort((a, b) => (b.price ?? 0) - (a.price ?? 0)).slice(0, 8),
    [vehicles],
  );

  const visible = useMemo(() => {
    const filtered = vehicles.filter(
      (vehicle) => (type === "todos" || vehicle.type === type) && (!brand || vehicle.brandSlug === brand),
    );
    const byPrice = (a: Vehicle, b: Vehicle) => (a.price ?? 0) - (b.price ?? 0);
    if (sort === "maior") return filtered.sort((a, b) => byPrice(b, a));
    if (sort === "menor") return filtered.sort(byPrice);
    return filtered.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [vehicles, type, brand, sort]);

  const activeBrand = brands.find((item) => item.slug === brand);
  const clearFilters = () => {
    setBrand(null);
    setType("todos");
  };

  return (
    <>
      <section aria-labelledby="destaques" className="px-[max(5vw,20px)] pt-[clamp(64px,10vw,140px)]">
        <div className="mx-auto max-w-[1240px]">
          <h2 id="destaques" className="font-display text-[clamp(30px,4vw,52px)] leading-[1.05]">
            Em destaque
          </h2>
          <div className="mt-8">
            <Rail label="Carros em destaque">
              {featured.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} href={vehicleHref(vehicle.slug)} priority={index < 3} />
              ))}
            </Rail>
          </div>
        </div>
      </section>

      <section id="estoque" aria-labelledby="estoque-title" className="px-[max(5vw,20px)] pt-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="estoque-title" className="font-display text-[clamp(30px,4vw,52px)] leading-[1.05]">
              Estoque
            </h2>
            <p className="num text-[15px] text-silver">
              {visible.length} {visible.length === 1 ? "veículo" : "veículos"}
              {activeBrand ? ` · ${activeBrand.name}` : ""}
            </p>
          </div>

          <div className="glass relative z-20 mt-8 flex flex-wrap items-center gap-1 rounded-[26px] p-1.5 sm:flex-nowrap sm:rounded-full">
            <div role="tablist" aria-label="Tipo de veículo" className="flex w-full sm:w-auto">
              {TYPES.map((option) => (
                <button
                  key={option.value}
                  role="tab"
                  type="button"
                  aria-selected={type === option.value}
                  onClick={() => setType(option.value)}
                  className={`h-10 flex-1 rounded-full px-4 text-[14px] transition-colors sm:flex-none ${
                    type === option.value ? "bg-pearl text-night" : "text-silver hover:text-pearl"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-white/12 sm:block" />
            <button
              type="button"
              onClick={() => setBrandsOpen(true)}
              aria-haspopup="dialog"
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] text-silver transition-colors hover:bg-white/[0.06] hover:text-pearl"
            >
              <span className="text-mist">Marca</span>
              <span className="text-pearl">{activeBrand?.name ?? "Todas"}</span>
              <svg viewBox="0 0 24 24" className="size-4 text-mist" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {(brand || type !== "todos") && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 whitespace-nowrap rounded-full px-3 text-[13px] text-mist underline-offset-4 transition-colors hover:text-pearl hover:underline"
              >
                Limpar
              </button>
            )}
            <div className="ml-auto">
              <GlassSelect label="Ordenar" value={sort} options={SORTS} onChange={setSort} />
            </div>
          </div>

          {visible.length > 0 ? (
            <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-5">
              {visible.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} href={vehicleHref(vehicle.slug)} />
              ))}
            </div>
          ) : (
            <div className="glass mt-8 rounded-[22px] px-6 py-12 text-center text-silver">
              Nenhum veículo com esse filtro agora.{" "}
              <button type="button" className="text-pearl underline underline-offset-4" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <GlassDialog open={brandsOpen} onClose={() => setBrandsOpen(false)} label="Todas as marcas">
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-[28px]">Marcas no estoque</h2>
          <p className="mt-1 text-[15px] text-silver">Escolha uma marca para filtrar.</p>
          <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {[{ slug: null, name: "Todas as marcas", count: vehicles.length }, ...brands].map((item) => {
              const selected = brand === item.slug;
              return (
                <li key={item.slug ?? "todas"}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setBrand(item.slug);
                      setBrandsOpen(false);
                    }}
                    className={`glass flex h-[76px] w-full flex-col items-start justify-center rounded-[16px] px-4 text-left transition hover:-translate-y-0.5 ${
                      selected ? "ring-1 ring-pearl/70" : ""
                    }`}
                  >
                    <span className="text-[15px] font-semibold">{item.name}</span>
                    <span className="num text-[13px] text-mist">
                      {item.count} {item.count === 1 ? "veículo" : "veículos"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </GlassDialog>
    </>
  );
}
