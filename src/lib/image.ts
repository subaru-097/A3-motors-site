const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

type Width = 256 | 640 | 1080 | 1920;

/** Foto do estoque já reduzida pelo otimizador de imagens do Next (fotos originais da A3 são grandes). */
export const stockImage = (src: string, width: Width) =>
  IS_PREVIEW || !src.startsWith("http") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
