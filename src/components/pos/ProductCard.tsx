"use client";

import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { UtensilsCrossed } from "lucide-react";

interface ProductCardProps {
  name: string;
  price: number;
  photoUrl: string | null;
  discount: number;
  onClick: () => void;
}

export function ProductCard({
  name,
  price,
  photoUrl,
  discount,
  onClick,
}: ProductCardProps) {
  const discountedPrice =
    discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-all duration-fast hover:-translate-y-px hover:shadow-md active:scale-[0.98] text-left"
    >
      <div className="aspect-square flex items-center justify-center bg-bg">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
            width={200}
            height={200}
          />
        ) : (
          <UtensilsCrossed className="h-12 w-12 text-text-muted opacity-30" />
        )}
      </div>

      <div className="p-2.5">
        <p className="text-[13px] font-medium leading-snug text-text-primary line-clamp-2">
          {name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[14px] font-medium font-mono text-primary">
            {formatRupiah(discountedPrice)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-xs text-text-muted line-through">
                {formatRupiah(price)}
              </span>
              <Badge variant="diskon">{discount}%</Badge>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
