"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { whatsappLink } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 113;
const FIRST_BATCH = 24;

const reportLoading = (progress: number) => {
  window.a3LoadProgress = progress;
  window.dispatchEvent(new CustomEvent("a3:loading", { detail: progress }));
};

declare global {
  interface Window {
    a3LoadProgress?: number;
  }
}
const frameSrc = (index: number, size: "1920" | "1280") =>
  `/hero/frames/${size}/${String(index + 1).padStart(3, "0")}.webp`;

/** Mapa do scroll (0 → 1) do trecho fixo do hero. */
const PHASE = {
  lettersOut: 0.1,
  framesStart: 0.03,
  framesEnd: 0.88,
  finaleIn: 0.84,
} as const;

const useFrameSequence = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const frames = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);

  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let image = frames.current[index];
    for (let step = 1; (!image || !image.complete) && step < FRAME_COUNT; step++) {
      image = frames.current[index - step] ?? frames.current[index + step];
    }
    if (!image?.complete) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    current.current = index;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const small = window.matchMedia("(max-width: 820px)").matches;
    const size = small ? "1280" : "1920";
    canvas.width = small ? 1280 : 1920;
    canvas.height = small ? 720 : 1080;

    // A tela de carregamento espera as fotos da capa e o começo do vídeo; o resto chega depois, sem disputar banda.
    const stills = small
      ? ["/hero/still-bg-1920.webp", "/hero/still-car-1920.webp"]
      : ["/hero/still-bg-3840.webp", "/hero/still-car-3840.webp"];
    const total = stills.length + FIRST_BATCH;
    let loaded = 0;
    const tick = () => {
      loaded += 1;
      reportLoading(loaded / total);
    };
    stills.forEach((src) => {
      const image = new Image();
      image.onload = tick;
      image.onerror = tick;
      image.src = src;
    });

    const loadFrame = (index: number, onDone?: () => void) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (index === current.current) draw(index);
        onDone?.();
      };
      image.onerror = () => onDone?.();
      image.src = frameSrc(index, size);
      frames.current[index] = image;
    };

    frames.current = [];
    let pending = FIRST_BATCH;
    for (let index = 0; index < FIRST_BATCH; index++) {
      loadFrame(index, () => {
        tick();
        pending -= 1;
        if (pending === 0) for (let rest = FIRST_BATCH; rest < FRAME_COUNT; rest++) loadFrame(rest);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { draw };
};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { draw } = useFrameSequence(canvasRef);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const playhead = { frame: 0 };

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduceMotion ? true : 0.45,
        },
      });

      timeline
        .to(".hero-a3", { xPercent: -18, opacity: 0, duration: PHASE.lettersOut }, 0)
        .to(".hero-motors", { xPercent: 12, opacity: 0, duration: PHASE.lettersOut }, 0)
        .to(".hero-intro", { opacity: 0, y: -16, duration: PHASE.lettersOut * 0.6 }, 0)
        .to(".hero-canvas", { opacity: 1, duration: 0.02 }, PHASE.framesStart)
        .to(".hero-still", { opacity: 0, duration: 0.02 }, PHASE.framesStart + 0.015)
        .to(
          playhead,
          {
            frame: FRAME_COUNT - 1,
            duration: PHASE.framesEnd - PHASE.framesStart,
            onUpdate: () => draw(Math.round(playhead.frame)),
          },
          PHASE.framesStart,
        )
        .fromTo(".hero-finale-shade", { opacity: 0 }, { opacity: 1, duration: 0.1 }, PHASE.finaleIn)
        .fromTo(
          ".hero-finale > *",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.1, stagger: 0.02, ease: "power2.out" },
          PHASE.finaleIn + 0.02,
        )
        .to({}, { duration: 1 - PHASE.framesEnd - 0.02 });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="A3 Motors" className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-night">
        {/* Palco 16:9 que cobre a tela: todas as camadas usam as mesmas coordenadas. */}
        <div className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,160svh)] -translate-x-1/2 -translate-y-1/2 [container-type:inline-size] max-[820px]:w-[118vw] max-[820px]:-translate-y-[58%]">
          <div className="hero-still absolute inset-0">
            <picture>
              <source media="(max-width: 820px)" srcSet="/hero/still-bg-1920.webp" />
              <img src="/hero/still-bg-3840.webp" alt="" className="absolute inset-0 size-full" fetchPriority="high" />
            </picture>
            <svg viewBox="0 0 1280 720" className="absolute inset-0 size-full" aria-hidden="true">
              {/* A luz das letras segue a do carro: vem de cima e da frente (direita), a traseira fica na sombra. */}
              <defs>
                <linearGradient id="hero-side" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="1240" y2="0">
                  <stop offset="0" stopColor="#f4f2ec" stopOpacity="0.22" />
                  <stop offset="0.06" stopColor="#f4f2ec" stopOpacity="0.26" />
                  <stop offset="0.1" stopColor="#f4f2ec" stopOpacity="0.44" />
                  <stop offset="0.15" stopColor="#f4f2ec" stopOpacity="0.4" />
                  <stop offset="0.24" stopColor="#f4f2ec" stopOpacity="0.32" />
                  <stop offset="0.55" stopColor="#f4f2ec" stopOpacity="0.62" />
                  <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="0.86" stopColor="#f4f2ec" stopOpacity="0.72" />
                  <stop offset="1" stopColor="#f4f2ec" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="hero-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="0.55" stopColor="#fff" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
                </linearGradient>
                <mask id="hero-shade" maskUnits="userSpaceOnUse" x="0" y="120" width="1280" height="160">
                  <rect x="0" y="150" width="1280" height="110" fill="url(#hero-top)" />
                </mask>
                <linearGradient id="hero-spec" gradientUnits="userSpaceOnUse" x1="760" y1="140" x2="980" y2="260">
                  <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.52" stopColor="#fff" stopOpacity="0.55" />
                  <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hero-spec-a3" gradientUnits="userSpaceOnUse" x1="100" y1="150" x2="230" y2="265">
                  <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
                  <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="hero-bloom-fill" gradientUnits="userSpaceOnUse" cx="880" cy="200" r="300">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                {/* Feixe de luz que atravessa as letras de tempos em tempos. */}
                <linearGradient id="hero-sweep" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="260" y2="250">
                  <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.47" stopColor="#fff" stopOpacity="0.85" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                  <stop offset="0.53" stopColor="#fff" stopOpacity="0.85" />
                  <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
                  <animateTransform
                    attributeName="gradientTransform"
                    type="translate"
                    values="-360 0; 1320 0; 1320 0"
                    keyTimes="0; 0.75; 1"
                    keySplines="0.42 0 0.58 1; 0 0 1 1"
                    calcMode="spline"
                    dur="8s"
                    begin="1.2s"
                    repeatCount="indefinite"
                  />
                </linearGradient>
                <filter id="hero-sweep-glow" x="-10%" y="-60%" width="120%" height="220%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <filter id="hero-bloom" x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
              </defs>
              <g fontFamily="var(--font-cinzel)" fontSize="122" letterSpacing="4">
                <g fill="url(#hero-bloom-fill)" filter="url(#hero-bloom)" opacity="0.35">
                  <text className="hero-motors" x="702" y="247">MOTORS</text>
                </g>
                <g fill="url(#hero-side)" mask="url(#hero-shade)">
                  <text className="hero-a3" x="55" y="250">A3</text>
                  <text className="hero-motors" x="702" y="247">MOTORS</text>
                </g>
                <text className="hero-a3" x="55" y="250" fill="url(#hero-spec-a3)">A3</text>
                <text className="hero-motors" x="702" y="247" fill="url(#hero-spec)">MOTORS</text>
                <g className="hero-sweep" fill="url(#hero-sweep)">
                  <g filter="url(#hero-sweep-glow)" opacity="0.9">
                    <text className="hero-a3" x="55" y="250">A3</text>
                    <text className="hero-motors" x="702" y="247">MOTORS</text>
                  </g>
                  <text className="hero-a3" x="55" y="250">A3</text>
                  <text className="hero-motors" x="702" y="247">MOTORS</text>
                </g>
              </g>
            </svg>
            <picture>
              <source media="(max-width: 820px)" srcSet="/hero/still-car-1920.webp" />
              <img
                src="/hero/still-car-3840.webp"
                alt="BMW M3 Competition azul do estoque da A3 Motors"
                className="absolute inset-0 size-full"
                fetchPriority="high"
              />
            </picture>
          </div>
          <canvas ref={canvasRef} className="hero-canvas absolute inset-0 size-full opacity-0" aria-hidden="true" />
        </div>

        <div className="hero-intro pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-6 px-[max(5vw,20px)] pb-8">
          <span className="flex items-center gap-3 text-[13px] text-mist">
            Role para entrar
            <span className="block h-8 w-px overflow-hidden bg-white/15">
              <span className="block h-3 w-px animate-[scrollcue_1.6s_var(--ease-in-out-cubic)_infinite] bg-silver" />
            </span>
          </span>
        </div>

        <div className="hero-finale-shade pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_5_5/0.15)_30%,rgb(5_5_5/0.88))] opacity-0" />
        <div className="hero-finale absolute inset-x-0 bottom-0 px-[max(5vw,20px)] pb-[max(8svh,40px)]">
          <h1 className="display-caps max-w-[14ch] text-[clamp(34px,5vw,76px)] leading-[1.08] [text-wrap:balance] opacity-0">
            Seja bem-vindo à A3.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3 opacity-0">
            <a href="#estoque" className="btn bg-pearl text-night">
              Ver o estoque
            </a>
            <a
              href={whatsappLink("Olá, A3 Motors! Vi o site e queria conversar sobre um carro.")}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
