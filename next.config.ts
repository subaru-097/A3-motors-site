import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // As fotos do estoque vêm do site da A3; a Vercel reduz e converte cada uma para o tamanho da tela.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "a3motorsweb.com.br" },
      { protocol: "https", hostname: "www.a3motorsweb.com.br" },
    ],
  },
};

export default nextConfig;
