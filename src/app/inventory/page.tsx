"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Package,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type {
  Ingredient,
  StockStatus,
} from "@/lib/supabase/types";

type Filter = "all" | "menipis" | "habis";

const badgeVariant: Record<StockStatus, "aman" | "menipis" | "habis"> = {
  aman: "aman",
  menipis: "menipis",
  habis: "habis",
};

const badgeLabel: Record<StockStatus, string> = {
  aman: "Aman",
  menipis: "Menipis",
  habis: "Habis",
};

function getStockStatus(item: Ingredient): StockStatus {
  if (item.stock_qty <= 0) return "habis";
  if (item.stock_qty <= item.min_stock) return "menipis";
  return "aman";
}

export default function InventoryPage() {
  const supabase = createClient();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [latestPrices, setLatestPrices] = useState<Map<string, number>>(
    new Map(),
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [itemsRes, pricesRes] = await Promise.all([
      supabase
        .from("ingredients")
        .select("*")
        .order("name"),
      supabase
        .from("ingredient_price_history")
        .select("ingredient_id, price")
        .order("recorded_at", { ascending: false }),
    ]);

    if (itemsRes.data) setIngredients(itemsRes.data);

    const priceMap = new Map<string, number>();
    if (pricesRes.data) {
      for (const p of pricesRes.data) {
        if (!priceMap.has(p.ingredient_id)) {
          priceMap.set(p.ingredient_id, p.price);
        }
      }
    }
    setLatestPrices(priceMap);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const restockItems = ingredients
    .filter((i) => i.stock_qty <= i.min_stock)
    .sort(
      (a, b) =>
        a.stock_qty / Math.max(a.min_stock, 1) -
        b.stock_qty / Math.max(b.min_stock, 1),
    );

  const filtered = ingredients.filter((i) => {
    const status = getStockStatus(i);
    if (filter === "menipis" && status !== "menipis") return false;
    if (filter === "habis" && status !== "habis") return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display">Inventaris</h1>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4" />
          Tambah Bahan
        </Button>
      </div>

      {restockItems.length > 0 && (
        <div className="rounded-md border border-warning bg-warning-bg p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-sm font-semibold text-warning">
              Restock Cerdas — {restockItems.length} bahan perlu segera restock
            </h2>
          </div>
          <div className="space-y-2">
            {restockItems.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-md bg-surface px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {i.name}
                  </span>
                  <span className="ml-2 text-xs text-text-muted">
                    {i.stock_qty} / {i.min_stock} {i.unit} tersisa
                  </span>
                </div>
                <Badge variant={getStockStatus(i) === "habis" ? "habis" : "menipis"}>
                  {getStockStatus(i) === "habis" ? "Habis" : "Menipis"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-64">
          <Input
            search
            placeholder="Cari bahan baku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: "all", label: "Semua" },
            { key: "menipis", label: "Menipis" },
            { key: "habis", label: "Habis" },
          ] as const).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                filter === f.key
                  ? "bg-primary border-transparent text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[1fr_80px_1fr_100px_120px_100px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase text-text-muted border-b border-border">
          <span>Nama</span>
          <span>Satuan</span>
          <span>Stok</span>
          <span className="text-right">Min. Stok</span>
          <span className="text-right">Harga/kg</span>
          <span className="text-right">Status</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Package className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">Belum ada bahan baku</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const status = getStockStatus(item);
              const price = latestPrices.get(item.id);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-2 grid-rows-[auto_auto] gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[1fr_80px_1fr_100px_120px_100px] md:grid-rows-1 md:items-center"
                >
                  <span className="col-span-2 text-sm font-medium text-text-primary md:col-span-1">
                    {item.name}
                  </span>
                  <span className="text-xs text-text-muted md:text-sm">
                    {item.unit}
                  </span>
                  <div className="col-span-2 flex items-center gap-2 text-sm md:col-span-1">
                    <span className="font-mono font-medium text-text-primary">
                      {item.stock_qty}
                    </span>
                    <span className="text-text-muted">/ {item.min_stock}</span>
                  </div>
                  <span className="text-right text-sm font-mono text-text-muted hidden md:block">
                    {item.min_stock} {item.unit}
                  </span>
                  <span className="text-right text-sm font-mono text-text-secondary hidden md:block">
                    {price != null ? formatRupiah(price) : "—"}
                  </span>
                  <div className="col-span-2 md:col-span-1 md:text-right">
                    <Badge variant={badgeVariant[status]}>
                      {badgeLabel[status]}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
