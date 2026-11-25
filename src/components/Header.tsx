"use client";

import { useEffect, useState } from "react";
import { STORE, whatsappLink } from "@/lib/store";

const LINKS = [
  { href: "#estoque", label: "Estoque" },
  { href: "#loja", label: "A loja" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-[max(3vw,12px)] pt-3">
      <nav
        aria-label="Principal"
        className={`mx-auto flex h-14 max-w-[1240px] items-center justify-between rounded-full pl-5 pr-2 transition-[background-color,box-shadow,border-color] duration-300 ${
          isSolid ? "glass" : "border border-transparent"
        }`}
      >
        <a href="#" className="flex items-center gap-3" aria-label="A3 Motors, início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STORE.logo} alt="" width={26} height={26} className="opacity-80" />
          <span className="brand-wordmark font-display text-[15px] tracking-[0.08em]">A3 Motors</span>
        </a>
        <ul className="hidden items-center gap-7 text-[14px] text-silver md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-pearl">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={whatsappLink("Olá, A3 Motors! Vi o site e queria conversar sobre um carro.")}
          target="_blank"
          rel="noreferrer"
          className="btn btn-whats min-h-10 px-4 text-[14px]"
        >
          WhatsApp
        </a>
      </nav>
    </header>
  );
}
