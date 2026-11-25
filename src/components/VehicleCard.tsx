/* eslint-disable @next/next/no-img-element */
import type { Vehicle } from "@/lib/inventory";
import { stockImage } from "@/lib/image";
import { formatKm } from "@/lib/store";
import { Plate } from "./Plate";

type VehicleCardProps = { vehicle: Vehicle; href: string; priority?: boolean };

export function VehicleCard({ vehicle, href, priority = false }: VehicleCardProps) {
  return (
    <article className="group glass overflow-hidden rounded-[22px] transition-transform duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-1">
      <a href={href} className="block" aria-label={`Ver ${vehicle.title}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[21px] bg-graphite">
          {vehicle.cover ? (
            <img
              src={stockImage(vehicle.cover, 640)}
              alt={vehicle.title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid size-full place-items-center text-center text-[14px] text-mist">
              <span>
                Em preparação
                <br />
                <span className="text-[13px]">fotos em breve</span>
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(5_5_5/0.75))]" />
          <div className="absolute bottom-3 left-3">
            <Plate price={vehicle.price} />
          </div>
        </div>
        <div className="space-y-1.5 px-5 pb-5 pt-4">
          <p className="eyebrow">{vehicle.brand}</p>
          <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug [text-wrap:balance]">{vehicle.title}</h3>
          <p className="num flex flex-wrap gap-x-3 text-[14px] text-silver/80">
            <span>{vehicle.year}</span>
            <span aria-hidden="true">·</span>
            <span>{formatKm(vehicle.km)}</span>
            <span aria-hidden="true">·</span>
            <span>{vehicle.gearbox}</span>
          </p>
        </div>
      </a>
    </article>
  );
}
