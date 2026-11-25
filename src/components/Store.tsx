/* eslint-disable @next/next/no-img-element */
import { STORE, whatsappLink } from "@/lib/store";

const FACTS = [
  { value: `${STORE.since}`, label: "Ano de fundação" },
  { value: "Laudo cautelar", label: "Aprovado e informado no anúncio" },
  { value: "Venda digital", label: "Negocie tudo pelo WhatsApp" },
];

export function Store() {
  return (
    <section id="loja" aria-labelledby="loja-title" className="px-[max(5vw,20px)] pt-[clamp(80px,12vw,160px)]">
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div>
          <h2 id="loja-title" className="font-display text-[clamp(30px,4vw,52px)] leading-[1.05] [text-wrap:balance]">
            Um showroom feito para escolher com calma.
          </h2>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-silver">
            A A3 Motors nasceu em {STORE.since}, em Piracicaba, unindo tradição e atendimento próximo. Os anúncios trazem
            histórico de revisão e laudo cautelar, e a negociação acontece sem pressa: no salão, no lounge ou pela venda
            digital no WhatsApp.
          </p>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {FACTS.map((fact) => (
              <div key={fact.label} className="bg-night px-5 py-4">
                <dt className="font-display text-[22px]">{fact.value}</dt>
                <dd className="mt-1 text-[13px] text-mist">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-6 gap-3">
          <figure className="col-span-6 overflow-hidden rounded-[22px]">
            <img src="/loja/salao.webp" alt="Salão da A3 Motors com o mezanino ao fundo" loading="lazy" className="aspect-[16/9] w-full object-cover" />
          </figure>
          <figure className="col-span-3 overflow-hidden rounded-[22px]">
            <img src="/loja/lounge.webp" alt="Lounge com poltronas e TV" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </figure>
          <figure className="col-span-3 overflow-hidden rounded-[22px]">
            <img src="/loja/cafe.webp" alt="Cantinho do café com a parede de coroas da A3" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </figure>
          <figure className="col-span-4 overflow-hidden rounded-[22px]">
            <img src="/loja/motos.webp" alt="Motos, quadriciclo e jet skis ao lado do lounge" loading="lazy" className="aspect-[4/3] size-full object-cover" />
          </figure>
          <figure className="col-span-2 overflow-hidden rounded-[22px]">
            <img src="/loja/fachada.webp" alt="Fachada da A3 Motors na entrega de um Corolla" loading="lazy" className="size-full object-cover object-[50%_40%]" />
          </figure>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contato" aria-labelledby="contato-title" className="px-[max(5vw,20px)] py-[clamp(80px,12vw,160px)]">
      <div className="glass-strong mx-auto grid max-w-[1240px] gap-10 overflow-hidden rounded-[28px] p-[clamp(24px,4vw,56px)] lg:grid-cols-2">
        <div>
          <h2 id="contato-title" className="font-display text-[clamp(30px,4vw,52px)] leading-[1.05]">
            Venha conhecer.
          </h2>
          <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-silver">
            Agende uma visita ou fale direto com um consultor. Respondemos rápido pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink("Olá, A3 Motors! Quero agendar uma visita.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whats"
            >
              Agendar pelo WhatsApp
            </a>
            <a href={STORE.waze} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Abrir rota no Waze
            </a>
          </div>
        </div>
        <dl className="grid content-start gap-6 text-[15px]">
          <div>
            <dt className="text-[13px] text-mist">Endereço</dt>
            <dd className="mt-1">
              {STORE.street}
              <br />
              {STORE.district}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-mist">WhatsApp · venda digital</dt>
            <dd className="num mt-1">{STORE.whatsappLabel}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-mist">Telefone</dt>
            <dd className="num mt-1">{STORE.phoneLabel}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-mist">E-mail</dt>
            <dd className="mt-1 break-all">{STORE.email}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-[max(5vw,20px)] py-10 text-[13px] text-mist">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4">
        <p className="font-display text-[15px] text-silver">A3 Motors</p>
        <p>
          © {STORE.since}–{new Date().getFullYear()} A3 Motors · {STORE.district}
        </p>
        <a href={STORE.instagram} target="_blank" rel="noreferrer" className="hover:text-pearl">
          Instagram
        </a>
      </div>
    </footer>
  );
}
