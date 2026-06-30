"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useCartStore,
  getSubtotal,
  getTax,
  getAdminFee,
  getTotal,
} from "@/lib/store/cart";
import { OrderItem } from "@/components/pos/OrderItem";
import { CartSummary } from "@/components/pos/CartSummary";
import {
  ShoppingCart,
  Banknote,
  QrCode,
  Building2,
  X,
  CheckCircle,
} from "lucide-react";

interface CartPanelProps {
  onClose?: () => void;
}

export function CartPanel({ onClose }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const cashReceived = useCartStore((s) => s.cashReceived);
  const isCheckingOut = useCartStore((s) => s.isCheckingOut);

  const { setQuantity, removeItem, setPaymentMethod, setCashReceived, clearCart, setIsCheckingOut } =
    useCartStore();

  const [success, setSuccess] = useState(false);

  const subtotal = getSubtotal(items);
  const total = getTotal(subtotal);

  const canCheckout = items.length > 0 && !!paymentMethod;
  const cashValid =
    paymentMethod === "cash" ? cashReceived >= total : true;

  const handleCheckout = useCallback(async () => {
    if (!canCheckout || !cashValid || isCheckingOut) return;

    const supabase = createClient();
    if (!supabase) return;

    setIsCheckingOut(true);

    try {
      const state = useCartStore.getState();
      const st = getSubtotal(state.items);
      const tx2 = getTax(st);
      const fee = getAdminFee(st);
      const tot = st + tx2 + fee;

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
          subtotal: st,
          tax_rate: 0.11,
          tax_amount: tx2,
          admin_fee_rate: 0,
          admin_fee_amount: fee,
          total: tot,
          payment_method: state.paymentMethod,
          amount_paid:
            state.paymentMethod === "cash" ? state.cashReceived : tot,
          change_amount:
            state.paymentMethod === "cash"
              ? state.cashReceived - tot
              : 0,
        })
        .select()
        .single();

      if (txError) throw txError;

      const txItems = state.items.map((item) => {
        const unitPrice =
          item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price;
        return {
          transaction_id: tx.id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: Math.round(unitPrice * item.quantity),
        };
      });

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(txItems);
      if (itemsError) throw itemsError;

      for (const item of state.items) {
        const { data: recipes } = await supabase
          .from("recipes")
          .select("ingredient_id, quantity")
          .eq("menu_item_id", item.menu_item_id);

        if (recipes) {
          for (const r of recipes) {
            await supabase.rpc("deduct_stock", {
              p_ingredient_id: r.ingredient_id,
              p_amount: r.quantity * item.quantity,
            });
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsCheckingOut(false);
    }
  }, [canCheckout, cashValid, isCheckingOut, setIsCheckingOut, clearCart]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-title">Detail Order</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-primary-subtle transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {success ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <p className="text-sm font-semibold text-success">
            Transaksi berhasil!
          </p>
        </div>
      ) : (
        <>
          <div className="shrink-0 px-4 pt-3">
            <label className="text-xs font-medium text-text-secondary">
              Pelanggan
            </label>
            <select className="mt-1 h-9 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)] transition-shadow duration-fast">
              <option value="">Pilih pelanggan (opsional)</option>
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase text-text-muted">
              Pesanan kamu
            </p>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <ShoppingCart className="mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <OrderItem
                    key={item.id}
                    item={item}
                    onIncrement={() =>
                      setQuantity(item.id, item.quantity + 1)
                    }
                    onDecrement={() =>
                      setQuantity(item.id, item.quantity - 1)
                    }
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-4 border-t border-border p-4">
            <CartSummary items={items} />

            <div>
              <label className="text-xs font-medium text-text-secondary">
                Metode Bayar
              </label>
              <div className="mt-1.5 flex gap-2">
                {(
                  [
                    { key: "cash", label: "Tunai", Icon: Banknote },
                    { key: "qris", label: "QRIS", Icon: QrCode },
                    { key: "transfer", label: "Transfer", Icon: Building2 },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPaymentMethod(m.key)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors duration-fast",
                      paymentMethod === m.key
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border text-text-secondary hover:border-primary",
                    )}
                  >
                    <m.Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-1.5">
                <Input
                  type="number"
                  label="Jumlah Bayar"
                  placeholder="Masukkan nominal"
                  value={cashReceived > 0 ? cashReceived : ""}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                />
                {cashReceived >= total && total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Kembalian</span>
                    <span className="font-mono font-semibold text-success">
                      {formatRupiah(cashReceived - total)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              loading={isCheckingOut}
              disabled={!canCheckout || !cashValid}
              className="w-full"
              onClick={handleCheckout}
            >
              Buat Pesanan
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
