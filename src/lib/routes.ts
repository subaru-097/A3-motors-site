const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";

export const PREVIEW_PREFIX = "#v-";

export const vehicleHref = (slug: string) => (IS_PREVIEW ? `${PREVIEW_PREFIX}${slug}` : `/veiculo/${slug}`);

export const stockHref = IS_PREVIEW ? "#estoque" : "/#estoque";

export const relatedTo = <T extends { id: string | number; brandSlug: string; type: string }>(vehicle: T, all: T[], limit = 8) => {
  const others = all.filter((item) => item.id !== vehicle.id);
  const sameBrand = others.filter((item) => item.brandSlug === vehicle.brandSlug);
  const sameType = others.filter((item) => item.brandSlug !== vehicle.brandSlug && item.type === vehicle.type);
  return [...sameBrand, ...sameType].slice(0, limit);
};
