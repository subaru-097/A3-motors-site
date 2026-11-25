"use client";

import { useId, useState } from "react";
import { formatPrice, whatsappLink } from "@/lib/store";

const TERMS = [24, 36, 48, 60] as const;
const DEFAULT_MONTHLY_RATE = 1.69;

/** Tabela Price: parcela fixa. A taxa é estimativa e o cliente pode ajustar. */
const monthlyPayment = (financed: number, monthlyRatePercent: number, months: number) => {
  const rate = monthlyRatePercent / 100;
  if (financed <= 0) return 0;
  if (rate === 0) return financed / months;
  return (financed * rate) / (1 - (1 + rate) ** -months);
};

export function FinanceSimulator({ price, vehicleTitle }: { price: number; vehicleTitle?: string }) {
  const id = useId();
  const [downPercent, setDownPercent] = useState(40);
  const [months, setMonths] = useState<(typeof TERMS)[number]>(48);
  const [rate, setRate] = useState(DEFAULT_MONTHLY_RATE);

  const down = Math.round((price * downPercent) / 100);
  const installment = monthlyPayment(price - down, rate, months);

  return (
    <section aria-labelledby={`${id}-title`} className="glass rounded-[20px] p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${id}-title`} className="text-[15px] font-semibold">
          Simule sua parcela
        </h3>
        <p className="text-[13px] text-mist">Estimativa. A taxa final depende da análise de crédito.</p>
      </div>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="num font-display text-[clamp(32px,4vw,44px)] leading-none">{formatPrice(Math.round(installment))}</span>
        <span className="text-[15px] text-silver">/mês em {months}x</span>
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-[14px] text-silver">
            Entrada <span className="num text-pearl">{formatPrice(down)} · {downPercent}%</span>
          </span>
          <input
            type="range"
            min={20}
            max={80}
            step={5}
            value={downPercent}
            onChange={(event) => setDownPercent(Number(event.target.value))}
            className="mt-3 h-11 w-full accent-[#c8102e]"
          />
        </label>
        <fieldset>
          <legend className="text-[14px] text-silver">Prazo</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setMonths(term)}
                aria-pressed={months === term}
                className={`num h-11 rounded-full border text-[14px] transition-colors ${
                  months === term ? "border-pearl bg-pearl text-night" : "border-white/15 text-silver hover:border-white/35"
                }`}
              >
                {term}x
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-5 flex items-center justify-between gap-4 text-[14px] text-silver">
        Taxa estimada ao mês (%)
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={5}
          step={0.01}
          value={rate}
          onChange={(event) => setRate(Math.max(0, Number(event.target.value) || 0))}
          className="num h-11 w-24 rounded-xl border border-white/15 bg-black/30 px-3 text-right text-[16px] text-pearl"
        />
      </label>

      {vehicleTitle && (
        <a
          href={whatsappLink(
            `Olá, A3 Motors! Simulei o ${vehicleTitle}: entrada de ${formatPrice(down)} e ${months}x de ${formatPrice(Math.round(installment))}. Podemos conversar?`,
          )}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost mt-5 w-full"
        >
          Enviar esta simulação no WhatsApp
        </a>
      )}
    </section>
  );
}
