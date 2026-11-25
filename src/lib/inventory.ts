import "server-only";
import { parse } from "node-html-parser";
import sample from "@/data/sample.json";

const SITE = "https://a3motorsweb.com.br";
const REVALIDATE_SECONDS = 600;
const DETAIL_CONCURRENCY = 8;

export type VehicleType = "carros" | "motos" | "outros";

export type Brand = { id: number; name: string; slug: string; count: number };

export type Vehicle = {
  id: number;
  slug: string;
  title: string;
  publishedAt: string;
  brand: string;
  brandSlug: string;
  type: VehicleType;
  price: number | null;
  year: string;
  km: number | null;
  color: string;
  fuel: string;
  gearbox: string;
  description: string;
  highlights: string[];
  cover: string | null;
  images: string[];
  isPreparing: boolean;
  features?: string[];
};

type WpTerm = { id: number; name: string; slug: string; count: number };
type WpPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  marcas: number[];
  tipos: number[];
  _embedded?: { "wp:featuredmedia"?: { source_url?: string; media_details?: { sizes?: Record<string, { source_url: string }> } }[] };
};

const decodeEntities = (text: string) =>
  text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");

const parseMoney = (text: string | undefined) => {
  if (!text) return null;
  const digits = text.replace(/[^\d,]/g, "").replace(/,\d+$/, "");
  return digits ? Number(digits) : null;
};

const parseKm = (text: string | undefined) => {
  if (!text) return null;
  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

const toFullSize = (url: string) => url.replace(/-\d+x\d+(\.\w+)$/, "$1");

const HIGHLIGHT_PATTERNS: [RegExp, string][] = [
  [/revisad[ao] na ([a-z\- ]+?)[!.,]/i, "Revisada na $1"],
  [/laudo cautelar aprovado/i, "Laudo cautelar aprovado"],
  [/único dono/i, "Único dono"],
  [/garantia de f[áa]brica/i, "Garantia de fábrica"],
  [/manual e chave reserva/i, "Manual e chave reserva"],
];

const extractHighlights = (description: string) =>
  HIGHLIGHT_PATTERNS.flatMap(([pattern, label]) => {
    const match = description.match(pattern);
    if (!match) return [];
    return [label.replace("$1", (match[1] ?? "").trim().replace(/\b\w/g, (c) => c.toUpperCase()))];
  });

const NOT_A_FEATURE = /R\$|venda digital|mais informa|novidade|laudo|revisad|^\d[\d.]*\s*km/i;

/** O anúncio da A3 lista um item por linha: cada <br> ou parágrafo vira um item da lista. */
const extractFeatures = (contentHtml: string) =>
  contentHtml
    .split(/<br\s*\/?>|<\/p>|<\/li>|\n/i)
    .map((line) => decodeEntities(line.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 2 && line.length < 90 && !NOT_A_FEATURE.test(line));

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SITE}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) throw new Error(`A3 API ${response.status} on ${path}`);
  return response.json() as Promise<T>;
}

async function fetchDetail(post: WpPost, brands: Map<number, WpTerm>, types: Map<number, WpTerm>): Promise<Vehicle> {
  const response = await fetch(post.link, { next: { revalidate: REVALIDATE_SECONDS } });
  const html = parse(await response.text());

  const specs = new Map<string, string>();
  for (const row of html.querySelectorAll("table.table-info tr")) {
    const cells = row.querySelectorAll("td");
    if (cells.length === 2) specs.set(cells[0].text.trim().replace(":", ""), cells[1].text.trim());
  }

  const images = [
    ...new Set(
      html
        .querySelectorAll("amp-carousel amp-img")
        .map((img) => img.getAttribute("src"))
        .filter((src): src is string => Boolean(src))
        .map(toFullSize),
    ),
  ];
  const isPreparing = images.length <= 1 && images.every((src) => /preparacao/i.test(src));
  const content = html.querySelector("div.conteudo");
  const description = (content?.text ?? "").replace(/\s+/g, " ").trim();
  const features = extractFeatures(content?.innerHTML ?? "");
  const featured = post._embedded?.["wp:featuredmedia"]?.[0];
  const brand = brands.get(post.marcas[0]);
  const type = types.get(post.tipos[0]);

  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(post.title.rendered),
    publishedAt: post.date,
    brand: brand?.name ?? "",
    brandSlug: brand?.slug ?? "",
    type: (type?.slug as VehicleType) ?? "carros",
    price: parseMoney(html.querySelector("p.preco")?.text),
    year: specs.get("Ano") ?? "",
    km: parseKm(specs.get("Km")),
    color: specs.get("Cor") ?? "",
    fuel: specs.get("Combustível") ?? "",
    gearbox: specs.get("Câmbio") ?? "",
    description,
    highlights: extractHighlights(description),
    cover: isPreparing ? null : (images[0] ?? featured?.source_url ?? null),
    images: isPreparing ? [] : images,
    isPreparing,
    features,
  };
}

async function mapWithLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function loadLive(): Promise<{ vehicles: Vehicle[]; brands: Brand[] }> {
  const [posts, brandTerms, typeTerms] = await Promise.all([
    fetchJson<WpPost[]>("/wp-json/wp/v2/posts?per_page=100&_embed=wp:featuredmedia&_fields=id,slug,date,link,title,marcas,tipos,_links,_embedded"),
    fetchJson<WpTerm[]>("/wp-json/wp/v2/marcas?per_page=100&_fields=id,name,slug,count"),
    fetchJson<WpTerm[]>("/wp-json/wp/v2/tipos?per_page=100&_fields=id,name,slug,count"),
  ]);
  const brands = new Map(brandTerms.map((term) => [term.id, term]));
  const types = new Map(typeTerms.map((term) => [term.id, term]));
  const vehicles = await mapWithLimit(posts, DETAIL_CONCURRENCY, (post) => fetchDetail(post, brands, types));
  return {
    vehicles,
    brands: brandTerms.filter((term) => term.count > 0).sort((a, b) => b.count - a.count),
  };
}

export async function getInventory(): Promise<{ vehicles: Vehicle[]; brands: Brand[]; isSample: boolean }> {
  try {
    return { ...(await loadLive()), isSample: false };
  } catch (error) {
    console.warn("[inventory] usando amostra local:", (error as Error).message);
    return { ...(sample as { vehicles: Vehicle[]; brands: Brand[] }), isSample: true };
  }
}

export async function getVehicle(slug: string) {
  const { vehicles } = await getInventory();
  return vehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}
