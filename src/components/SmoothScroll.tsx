"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    a3Lenis?: Lenis;
  }
}

/** Rolagem suave ligada ao ScrollTrigger, para o vídeo do hero responder sem trancos. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    window.a3Lenis = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const target = link.getAttribute("href") ?? "#";
      // Links da página do carro (prévia) trocam o hash de verdade; o PreviewRouter cuida deles.
      if (target.startsWith("#v-")) return;
      if (window.location.hash.startsWith("#v-")) {
        requestAnimationFrame(() => lenis.scrollTo(target, { offset: -80, immediate: true }));
        return;
      }
      event.preventDefault();
      lenis.scrollTo(target === "#" ? 0 : target, { offset: -80, duration: 1.1 });
    };
    document.addEventListener("click", onAnchor);

    return () => {
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.a3Lenis = undefined;
    };
  }, []);

  return null;
}
