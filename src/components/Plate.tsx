import { formatPrice } from "@/lib/store";

const Crown = () => (
  <svg viewBox="0 0 24 24" className="plate-crown" aria-hidden="true">
    <path d="M3 7l4.5 11h9L21 7l-5 4-4-7-4 7-5-4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

type PlateProps = { price: number | null; size?: "sm" | "lg" };

export const Plate = ({ price, size = "sm" }: PlateProps) => (
  <span className={`plate ${size === "lg" ? "text-[18px]" : "text-[13px]"}`}>
    <Crown />
    {formatPrice(price)}
  </span>
);
