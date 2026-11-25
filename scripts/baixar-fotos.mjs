// Baixa todas as fotos de todos os veículos do site da A3 Motors.
// Uso (na pasta do projeto):  node scripts/baixar-fotos.mjs
// Resultado: fotos-a3/<marca>/<slug-do-veiculo>/01.jpg, 02.jpg, ... e um estoque.json com os dados.

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";

const SITE = "https://a3motorsweb.com.br";
const OUT = path.resolve("fotos-a3");
const PARALLEL = 6;

const exists = (file) => access(file).then(() => true, () => false);
const toFullSize = (url) => url.replace(/-\d+x\d+(\.\w+)$/, "$1");

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} em ${url}`);
  return response.json();
}

async function download(url, file) {
  if (await exists(file)) return "já existia";
  const response = await fetch(url);
  if (!response.ok) return `falhou (${response.status})`;
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return "ok";
}

async function pool(items, size, task) {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) await task(items[next++]);
    }),
  );
}

const [posts, brands] = await Promise.all([
  getJson(`${SITE}/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,link,title,marcas`),
  getJson(`${SITE}/wp-json/wp/v2/marcas?per_page=100&_fields=id,slug`),
]);
const brandSlug = new Map(brands.map((brand) => [brand.id, brand.slug]));
console.log(`${posts.length} veículos encontrados. Baixando fotos em ${OUT}\n`);

const inventory = [];
let total = 0;

await pool(posts, PARALLEL, async (post) => {
  const html = parse(await (await fetch(post.link)).text());
  const images = [
    ...new Set(
      html
        .querySelectorAll("amp-carousel amp-img")
        .map((img) => img.getAttribute("src"))
        .filter(Boolean)
        .map(toFullSize),
    ),
  ].filter((src) => !/preparacao/i.test(src));

  const folder = path.join(OUT, brandSlug.get(post.marcas[0]) ?? "outros", post.slug);
  await mkdir(folder, { recursive: true });

  const files = [];
  for (const [index, src] of images.entries()) {
    const name = `${String(index + 1).padStart(2, "0")}${path.extname(new URL(src).pathname) || ".jpg"}`;
    await download(src, path.join(folder, name));
    files.push(path.relative(OUT, path.join(folder, name)));
  }
  total += files.length;
  inventory.push({ slug: post.slug, title: post.title.rendered, link: post.link, photos: files });
  console.log(`✓ ${post.title.rendered} (${files.length} fotos)`);
});

await writeFile(path.join(OUT, "estoque.json"), JSON.stringify(inventory, null, 2));
console.log(`\nPronto: ${total} fotos de ${posts.length} veículos em ${OUT}`);
