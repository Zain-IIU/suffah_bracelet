import { formatPrice } from "@/lib/format";
import { isOnSale } from "@/lib/products";

export function Price({
  price,
  sale_price,
  className = "text-base font-medium",
}: {
  price: number;
  sale_price: number | null;
  className?: string;
}) {
  if (isOnSale({ price, sale_price })) {
    return (
      <span className={`inline-flex flex-wrap items-baseline gap-2 ${className}`}>
        <span className="text-rose">{formatPrice(sale_price as number)}</span>
        <s className="text-[0.85em] font-normal text-mauve">
          <span className="sr-only">was </span>
          {formatPrice(price)}
        </s>
      </span>
    );
  }
  return <span className={className}>{formatPrice(price)}</span>;
}
