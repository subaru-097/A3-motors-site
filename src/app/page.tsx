import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Inventory } from "@/components/Inventory";
import { Loader } from "@/components/Loader";
import { PreviewRouter } from "@/components/PreviewRouter";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Contact, Footer, Store } from "@/components/Store";
import { getInventory } from "@/lib/inventory";

export const revalidate = 600;

export default async function Home() {
  const { vehicles, brands, isSample } = await getInventory();

  return (
    <>
      <Loader />
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <Inventory vehicles={vehicles} brands={brands} />
        {isSample && process.env.NEXT_PUBLIC_PREVIEW !== "1" && (
          <p className="px-[max(5vw,20px)] pt-4 text-center text-[13px] text-mist">
            Mostrando uma amostra do estoque: o site da A3 não respondeu agora.
          </p>
        )}
        <Store />
        <Contact />
      </main>
      <Footer />
      <PreviewRouter vehicles={vehicles} />
    </>
  );
}
