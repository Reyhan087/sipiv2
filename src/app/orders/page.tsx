"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  X,
  Plus,
  Minus,
  Check,
  Clock,
  Cash,
  QrCode,
  ArrowRightLeft,
} from "lucide-react";
import type {
  Transaction,
  TransactionItem,
  OrderStatus,
} from "@/lib/supabase/types";

type Tab = "semua" | "pending" | "diproses" | "selesai";

interface OrderRow extends Transaction {
  transaction_items: TransactionItem[];
  customers: Pick<{ name: string; whatsapp: string | null }, "name" | "whatsapp"> | null;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "warning" | "success" }
> = {
  pending: { label: "Pending", variant: "warning" },
  diproses: { label: "Diproses", variant: "default" },
  selesai: { label: "Selesai", variant: "success" },
};

const paymentLabels: Record<string, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface EditableItem extends TransactionItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tab, setTab] = useState<Tab>("semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const res = await supabase
      .from("transactions")
      .select("*, transaction_items(*), customers(name, whatsapp)")
      .order("created_at", { ascending: false });

    if (res.data) setOrders(res.data as OrderRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (tab === "pending" && o.status !== "pending") return false;
    if (tab === "diproses" && o.status !== "diproses") return false;
    if (tab === "selesai" && o.status !== "selesai") return false;
    if (search) {
      const q = search.toLowerCase();
      const customerName = o.customers?.name?.toLowerCase() ?? "";
      const orderNum = o.id.toLowerCase();
      if (!customerName.includes(q) && !orderNum.includes(q)) return false;
    }
    return true;
  });

  const startEdit = (order: OrderRow) => {
    setEditingId(order.id);
    setEditItems(
      order.transaction_items.map((i) => ({ ...i })),
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItems([]);
  };

  const updateItemQty = (idx: number, delta: number) => {
    setEditItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }),
    );
  };

  const removeItem = (idx: number) => {
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const recalcTotal = (items: EditableItem[]) =>
    items.reduce((s, i) => s + i.subtotal, 0);

  const saveEdit = async (orderId: string) => {
    if (!supabase || editItems.length === 0) return;
    setSaving(true);

    const newSubtotal = recalcTotal(editItems);
    const taxAmount = Math.round((newSubtotal * (orders.find((o) => o.id === orderId)?.tax_rate ?? 0)) / 100);
    const adminFeeAmount = Math.round((newSubtotal * (orders.find((o) => o.id === orderId)?.admin_fee_rate ?? 0)) / 100);
    const newTotal = newSubtotal + taxAmount + adminFeeAmount;

    const deletedIds = orders
      .find((o) => o.id === orderId)
      ?.transaction_items.filter(
        (oi) => !editItems.some((ei) => ei.id === oi.id),
      );

    if (deletedIds && deletedIds.length > 0) {
      await supabase
        .from("transaction_items")
        .delete()
        .in("id", deletedIds.map((d) => d.id));
    }

    for (const item of editItems) {
      await supabase
        .from("transaction_items")
        .update({ quantity: item.quantity, subtotal: item.subtotal })
        .eq("id", item.id);
    }

    await supabase
      .from("transactions")
      .update({
        subtotal: newSubtotal,
        tax_amount: taxAmount,
        admin_fee_amount: adminFeeAmount,
        total: newTotal,
      })
      .eq("id", orderId);

    setSaving(false);
    setEditingId(null);
    setEditItems([]);
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!supabase) return;
    await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-text-muted text-sm">
        <p>Supabase belum dikonfigurasi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-display">Pesanan</h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-64">
          <Input
            search
            placeholder="Cari pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: "semua", label: "Semua" },
              { key: "pending", label: "Pending" },
              { key: "diproses", label: "Diproses" },
              { key: "selesai", label: "Selesai" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                tab === t.key
                  ? "bg-primary border-transparent text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <ClipboardList className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const expanded = expandedId === order.id;
            const editing = editingId === order.id;
            const cfg = statusConfig[order.status];
            const itemCount = order.transaction_items.length;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-shadow duration-fast hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((prev) =>
                      prev === order.id ? null : order.id,
                    )
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-text-muted">
                        {formatDateShort(order.created_at)}
                      </span>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {order.customers?.name ?? "Tanpa Pelanggan"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {itemCount} item
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-price font-mono text-primary">
                      {formatRupiah(order.total)}
                    </span>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-muted" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary">
                        <div>
                          <span className="text-xs text-text-muted">Waktu</span>
                          <p>{formatTime(order.created_at)}</p>
                        </div>
                        {order.customers && (
                          <div>
                            <span className="text-xs text-text-muted">
                              Pelanggan
                            </span>
                            <p>{order.customers.name}</p>
                          </div>
                        )}
                        {order.payment_method && (
                          <div>
                            <span className="text-xs text-text-muted">
                              Bayar
                            </span>
                            <p className="flex items-center gap-1">
                              <PaymentIcon method={order.payment_method} />
                              {paymentLabels[order.payment_method] ??
                                order.payment_method}
                            </p>
                          </div>
                        )}
                      </div>

                      {editing ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {editItems.map((item, idx) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-md bg-bg px-3 py-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-medium text-text-primary truncate block">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-text-muted">
                                    {formatRupiah(item.price)} x {item.quantity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <span className="w-20 text-right text-sm font-mono text-text-primary">
                                    {formatRupiah(item.subtotal)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateItemQty(idx, -1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface transition-colors duration-fast"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-mono">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateItemQty(idx, 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface transition-colors duration-fast"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(idx)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-danger hover:bg-danger-bg transition-colors duration-fast"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="md"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                              Batal
                            </Button>
                            <Button
                              variant="primary"
                              size="md"
                              loading={saving}
                              onClick={() => saveEdit(order.id)}
                            >
                              <Check className="h-4 w-4" />
                              Simpan
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                            <div className="hidden md:grid md:grid-cols-[1fr_80px_80px_100px] md:gap-4 md:px-3 md:py-2 text-xs font-semibold uppercase text-text-muted bg-bg">
                              <span>Item</span>
                              <span className="text-center">Qty</span>
                              <span className="text-right">Harga</span>
                              <span className="text-right">Subtotal</span>
                            </div>
                            {order.transaction_items.map((item) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-2 grid-rows-[auto_auto] gap-x-4 gap-y-0.5 px-3 py-2 md:grid-cols-[1fr_80px_80px_100px] md:grid-rows-1 md:items-center"
                              >
                                <span className="col-span-2 text-sm text-text-primary md:col-span-1 truncate">
                                  {item.name}
                                </span>
                                <span className="text-xs text-text-muted md:text-sm md:text-center">
                                  {item.quantity}
                                </span>
                                <span className="col-span-2 text-right text-xs text-text-muted md:col-span-1 md:text-sm font-mono">
                                  {formatRupiah(item.price)}
                                </span>
                                <span className="text-right text-sm font-mono text-text-primary">
                                  {formatRupiah(item.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1 rounded-md bg-bg px-3 py-2 text-sm">
                            <div className="flex justify-between text-text-secondary">
                              <span>Subtotal</span>
                              <span className="font-mono">
                                {formatRupiah(order.subtotal)}
                              </span>
                            </div>
                            {order.tax_amount > 0 && (
                              <div className="flex justify-between text-text-secondary">
                                <span>Pajak ({order.tax_rate}%)</span>
                                <span className="font-mono">
                                  {formatRupiah(order.tax_amount)}
                                </span>
                              </div>
                            )}
                            {order.admin_fee_amount > 0 && (
                              <div className="flex justify-between text-text-secondary">
                                <span>Admin Fee</span>
                                <span className="font-mono">
                                  {formatRupiah(order.admin_fee_amount)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-border pt-1 font-medium text-text-primary">
                              <span>Total</span>
                              <span className="font-mono text-primary">
                                {formatRupiah(order.total)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.status === "pending" && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="md"
                                  onClick={() => startEdit(order)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="primary"
                                  size="md"
                                  onClick={() =>
                                    updateStatus(order.id, "diproses")
                                  }
                                >
                                  <Clock className="h-4 w-4" />
                                  Proses
                                </Button>
                              </>
                            )}
                            {order.status === "diproses" && (
                              <Button
                                variant="primary"
                                size="md"
                                onClick={() =>
                                  updateStatus(order.id, "selesai")
                                }
                              >
                                <Check className="h-4 w-4" />
                                Selesai
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaymentIcon({ method }: { method: string }) {
  switch (method) {
    case "tunai":
      return <Cash className="h-3 w-3" />;
    case "qris":
      return <QrCode className="h-3 w-3" />;
    case "transfer":
      return <ArrowRightLeft className="h-3 w-3" />;
    default:
      return <Cash className="h-3 w-3" />;
  }
}
