import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cinzel = localFont({
  src: "../../public/fonts/Cinzel.ttf",
  variable: "--font-cinzel",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "../../public/fonts/InstrumentSans-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/InstrumentSans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A3 Motors · Seminovos de alto padrão em Piracicaba",
  description:
    "Carros e motos seminovos de alto padrão em Piracicaba. BMW, Porsche, Mercedes-Benz, Audi e mais, revisados e com laudo cautelar.",
  robots: { index: false, follow: false },
  metadataBase: new URL("https://a3-motors-site-9u7n.vercel.app"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "A3 Motors",
    title: "A3 Motors · Seminovos de alto padrão em Piracicaba",
    description: "Conheça o estoque da A3 Motors.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A3 Motors" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${instrument.variable}`}>
      <body className="bg-night text-pearl antialiased">{children}</body>
    </html>
  );
}
