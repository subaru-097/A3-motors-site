import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleTopBar } from "@/components/VehicleTopBar";
import { Footer } from "@/components/Store";
import { VehicleView } from "@/components/VehicleView";
import { getInventory, getVehicle } from "@/lib/inventory";
import { relatedTo } from "@/lib/routes";
import { formatPrice } from "@/lib/store";

export const revalidate = 600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { vehicles } = await getInventory();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const vehicle = await getVehicle((await params).slug);
  if (!vehicle) return {};
  return {
    title: `${vehicle.title} ${vehicle.year} · ${formatPrice(vehicle.price)} · A3 Motors`,
    description: vehicle.description.slice(0, 155),
    openGraph: { images: vehicle.cover ? [vehicle.cover] : [] },
  };
}

export default async function VehiclePage({ params }: Params) {
  const { slug } = await params;
  const [vehicle, { vehicles }] = await Promise.all([getVehicle(slug), getInventory()]);
  if (!vehicle) notFound();

  return (
    <>
      <VehicleTopBar />
      <main>
        <VehicleView vehicle={vehicle} related={relatedTo(vehicle, vehicles)} />
      </main>
      <Footer />
    </>
  );
}
