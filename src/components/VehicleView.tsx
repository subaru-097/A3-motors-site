"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/inventory";
import { stockHref, vehicleHref } from "@/lib/routes";
import { STORE, formatKm, formatPrice, whatsappLink } from "@/lib/store";
import { CardGallery } from "./CardGallery";
import { FinanceSimulator } from "./FinanceSimulator";
import { Plate } from "./Plate";
import { Rail } from "./Rail";
import { VehicleCard } from "./VehicleCard";

type VehicleViewProps = {
  vehicle: Vehicle;
  related: Vehicle[];
};

const fallbackFeatures = (description: string) =>
  description
    .split(/,| e (?=[a-zà-ú])/i)
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter((item) => item.length > 3)
    .slice(1);

function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* o usuário cancelou ou o navegador não permite */
    }
  };
  return (
    <button type="button" onClick={share} className="btn btn-ghost">
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}

export function VehicleView({ vehicle, related }: VehicleViewProps) {
  const features = vehicle.features?.length ? vehicle.features : fallbackFeatures(vehicle.description);
  const interest = whatsappLink(
    `Olá, A3 Motors! Tenho interesse no ${vehicle.title} (${vehicle.year}) anunciado por ${formatPrice(vehicle.price)}. Ainda está disponível?`,
  );
  const specs = [
    ["Ano", vehicle.year],
    ["Quilometragem", formatKm(vehicle.km)],
    ["Câmbio", vehicle.gearbox],
    ["Combustível", vehicle.fuel],
    ["Cor", vehicle.color],
    ["Marca", vehicle.brand],
  ].filter(([, value]) => value);

  return (
    <article className="pb-28 lg:pb-0">
      <div className="px-[max(4vw,16px)] pt-24">
        <nav aria-label="Você está em" className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 text-[13px] text-mist">
          <a href={stockHref} className="hover:text-pearl">
            Estoque
          </a>
          <span aria-hidden="true">/</span>
          <span>{vehicle.brand}</span>
          <span aria-hidden="true">/</span>
          <span className="text-silver">{vehicle.title}</span>
        </nav>
      </div>

      <div className="mt-6 overflow-hidden px-[max(2vw,8px)]">
        <CardGallery images={vehicle.images} title={vehicle.title} />
      </div>

      <div className="mx-auto mt-12 grid max-w-[1240px] gap-10 px-[max(4vw,16px)] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <p className="eyebrow">{vehicle.brand}</p>
          <h1 className="mt-1 font-display text-[clamp(30px,4vw,52px)] leading-[1.05] [text-wrap:balance]">{vehicle.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Plate price={vehicle.price} size="lg" />
            {vehicle.highlights.map((highlight) => (
              <span key={highlight} className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-[13px] text-silver">
                <svg viewBox="0 0 24 24" className="size-3.5 text-pearl" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                {highlight}
              </span>
            ))}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-white/10 bg-white/10 sm:grid-cols-3">
            {specs.map(([label, value]) => (
              <div key={label} className="bg-coal px-5 py-4">
                <dt className="text-[13px] text-mist">{label}</dt>
                <dd className="num mt-1 text-[17px]">{value}</dd>
              </div>
            ))}
          </dl>

          {features.length > 0 && (
            <section aria-labelledby="itens" className="mt-12">
              <h2 id="itens" className="font-display text-[clamp(24px,2.6vw,32px)]">
                Itens e opcionais
              </h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-3 border-b border-white/[0.06] pb-3 text-[15px] text-silver">
                    <span aria-hidden="true" className="mt-[9px] size-1.5 flex-none rounded-full bg-plate" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {vehicle.price !== null && (
            <section aria-label="Simulação de parcela" className="mt-12">
              <FinanceSimulator price={vehicle.price} vehicleTitle={vehicle.title} />
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="glass-strong sticky top-24 rounded-[24px] p-6">
            <p className="text-[13px] text-mist">Valor do veículo</p>
            <p className="num mt-1 font-display text-[34px] leading-none">{formatPrice(vehicle.price)}</p>
            <div className="mt-6 grid gap-3">
              <a href={interest} target="_blank" rel="noreferrer" className="btn btn-whats w-full">
                Tenho interesse
              </a>
              <a href={`tel:${STORE.phone}`} className="btn btn-ghost w-full">
                Ligar {STORE.phoneLabel}
              </a>
              <ShareButton title={vehicle.title} />
            </div>
            <dl className="mt-6 space-y-4 border-t border-white/10 pt-6 text-[14px]">
              <div>
                <dt className="text-mist">Onde ver o carro</dt>
                <dd className="mt-1 text-silver">
                  {STORE.street}
                  <br />
                  {STORE.district}
                </dd>
              </div>
              <div>
                <dt className="text-mist">WhatsApp · venda digital</dt>
                <dd className="num mt-1 text-silver">{STORE.whatsappLabel}</dd>
              </div>
            </dl>
            <a href={STORE.waze} target="_blank" rel="noreferrer" className="mt-4 inline-block text-[14px] text-pearl underline underline-offset-4">
              Abrir rota no Waze
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="mx-auto mt-20 max-w-[1240px] px-[max(4vw,16px)] pb-20">
          <h2 id="relacionados" className="font-display text-[clamp(24px,2.6vw,32px)]">
            Outros {vehicle.brand} no estoque
          </h2>
          <div className="mt-6">
            <Rail label={`Outros ${vehicle.brand}`}>
              {related.map((item) => (
                <VehicleCard key={item.id} vehicle={item} href={vehicleHref(item.slug)} />
              ))}
            </Rail>
          </div>
        </section>
      )}

      <div className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-[20px] p-3 lg:hidden">
        <div className="min-w-0 flex-1 pl-2">
          <p className="truncate text-[13px] text-mist">{vehicle.title}</p>
          <p className="num text-[17px] font-semibold">{formatPrice(vehicle.price)}</p>
        </div>
        <a href={interest} target="_blank" rel="noreferrer" className="btn btn-whats">
          WhatsApp
        </a>
      </div>
    </article>
  );
}
