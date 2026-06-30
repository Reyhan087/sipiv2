"use client";

import Image from "next/image";
import { formatRupiah } from "@/lib/format";
import { Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import type { CartItem } from "@/lib/store/cart";
import { getItemPrice } from "@/lib/store/cart";

interface OrderItemProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function OrderItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: OrderItemProps) {
  const unitPrice = getItemPrice(item);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-2">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-bg">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.name}
            className="h-full w-full object-cover"
            width={48}
            height={48}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-text-muted opacity-30" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {item.name}
        </p>
        <p className="text-xs text-text-muted">{formatRupiah(unitPrice)}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-primary-subtle transition-colors"
          aria-label="Kurangi"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-medium font-mono text-text-primary">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-primary-subtle transition-colors"
          aria-label="Tambah"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="w-16 text-right text-sm font-mono text-text-primary">
        {formatRupiah(lineTotal)}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-danger-bg hover:text-danger transition-colors"
        aria-label="Hapus"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
