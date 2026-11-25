import { stockHref } from "@/lib/routes";

/** Barra de vidro da página do carro: voltar ao estoque e a marca da loja. */
export function VehicleTopBar() {
  return (
    <div className="glass-strong fixed left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full py-2 pl-2 pr-5">
      <a href={stockHref} className="btn btn-ghost h-10 px-4 text-[14px]">
        ← Estoque
      </a>
      <span className="brand-wordmark font-display text-[15px] tracking-[0.18em]">A3 MOTORS</span>
    </div>
  );
}
