export const STORE = {
  name: "A3 Motors",
  since: 2018,
  whatsapp: "5519971550033",
  whatsappLabel: "(19) 97155-0033",
  phone: "+551933770033",
  phoneLabel: "(19) 3377-0033",
  email: "enrico@a3motorsweb.com.br",
  street: "Av. Dona Jane Conceição, 1636",
  district: "Paulista, Piracicaba – SP",
  waze: "https://www.waze.com/ul?ll=-22.73935530%2C-47.65557480&navigate=yes",
  maps: "https://www.google.com/maps/search/?api=1&query=-22.73935530,-47.65557480",
  instagram: "https://www.instagram.com/a3motorsweb/",
  logo: "/brand.svg",
} as const;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("pt-BR");

export const formatPrice = (value: number | null) => (value === null ? "Consulte" : brl.format(value));
export const formatKm = (value: number | null) => (value === null ? "—" : `${int.format(value)} km`);

export const whatsappLink = (message: string) =>
  `https://api.whatsapp.com/send?phone=${STORE.whatsapp}&text=${encodeURIComponent(message)}`;
