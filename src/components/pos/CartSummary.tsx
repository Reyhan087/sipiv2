"use client";

import { formatRupiah } from "@/lib/format";
import type { CartItem } from "@/lib/store/cart";
import {
  getSubtotal,
  getTax,
  getAdminFee,
  getTotal,
  TAX_RATE,
  ADMIN_FEE_RATE,
} from "@/lib/store/cart";

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = getSubtotal(items);
  const tax = getTax(subtotal);
  const adminFee = getAdminFee(subtotal);
  const total = getTotal(subtotal);

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-text-secondary">
        <span>Subtotal</span>
        <span className="font-mono">{formatRupiah(subtotal)}</span>
      </div>
      {TAX_RATE > 0 && (
        <div className="flex justify-between text-text-secondary">
          <span>Pajak ({Math.round(TAX_RATE * 100)}%)</span>
          <span className="font-mono">{formatRupiah(tax)}</span>
        </div>
      )}
      {ADMIN_FEE_RATE > 0 && (
        <div className="flex justify-between text-text-secondary">
          <span>Admin Fee</span>
          <span className="font-mono">{formatRupiah(adminFee)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-2 font-semibold text-text-primary">
        <span>Total</span>
        <span className="font-mono text-price-lg">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
