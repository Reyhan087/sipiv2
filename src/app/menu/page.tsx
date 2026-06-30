"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import type {
  MenuItemRow,
  Category,
} from "@/lib/supabase/types";

type Tab = "list" | "recipe";

const EMPTY_MAP = new Map<string, number>();

function calculateHPP(
  recipes: MenuItemRow["recipes"],
  prices: Map<string, number>,
): number {
  if (!recipes?.length) return 0;
  return recipes.reduce((sum, r) => {
    const unitPrice = prices.get(r.ingredient_id) ?? 0;
    return sum + unitPrice * r.quantity;
  }, 0);
}

function isMarginKritis(hpp: number, sellPrice: number): boolean {
  return hpp > 0 && hpp > sellPrice * 0.8;
}

function recommendedPrice(hpp: number): number {
  return Math.ceil((hpp / 0.5) / 1000) * 1000;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
        checked ? "bg-primary" : "bg-border",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export default function MenuPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("list");
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prices, setPrices] = useState<Map<string, number>>(EMPTY_MAP);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [itemsRes, catsRes, pricesRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select(
          "*, categories(id, name), recipes(*, ingredients(id, name, unit)), menu_variations(*)",
        )
        .order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("ingredient_price_history")
        .select("ingredient_id, price")
        .order("recorded_at", { ascending: false }),
    ]);

    if (catsRes.data) setCategories(catsRes.data);

    const priceMap = new Map<string, number>();
    if (pricesRes.data) {
      for (const p of pricesRes.data) {
        if (!priceMap.has(p.ingredient_id)) {
          priceMap.set(p.ingredient_id, p.price);
        }
      }
    }
    setPrices(priceMap);

    if (itemsRes.data) setItems(itemsRes.data as MenuItemRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = async (id: string, current: boolean) => {
    if (!supabase) return;
    await supabase.from("menu_items").update({ is_active: !current }).eq("id", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: !current } : i)),
    );
  };

  const filtered = items.filter((i) => {
    if (selectedCat && i.category_id !== selectedCat) return false;
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
        <h1 className="font-display text-display">Menu</h1>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4" />
          Tambah Menu
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg bg-bg p-1 w-fit">
        {(["list", "recipe"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors duration-fast",
              tab === t
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            {t === "list" ? "Daftar Menu" : "Menu & Resep"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-64">
          <Input
            search
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            className={cn(
              "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
              !selectedCat
                ? "bg-primary border-transparent text-white"
                : "bg-surface border-border text-text-secondary hover:border-primary",
            )}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                selectedCat === c.id
                  ? "bg-primary border-transparent text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {tab === "list" ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const hpp = calculateHPP(item.recipes, prices);
            const sellPrice =
              item.discount > 0
                ? item.price * (1 - item.discount / 100)
                : item.price;
            const kritis = isMarginKritis(hpp, sellPrice);
            const reco = kritis ? recommendedPrice(hpp) : null;

            return (
              <div
                key={item.id}
                className={cn(
                  "overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-shadow duration-fast hover:shadow-md",
                  !item.is_active && "opacity-60",
                )}
              >
                <div className="aspect-square flex items-center justify-center bg-bg">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <UtensilsCrossed className="h-12 w-12 text-text-muted opacity-30" />
                  )}
                </div>

                <div className="space-y-2 p-3">
                  {item.categories && (
                    <span className="text-small text-text-muted">
                      {item.categories.name}
                    </span>
                  )}

                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-price font-mono text-primary">
                      {formatRupiah(sellPrice)}
                    </span>
                    {item.discount > 0 && (
                      <>
                        <span className="text-xs text-text-muted line-through">
                          {formatRupiah(item.price)}
                        </span>
                        <Badge variant="diskon">{item.discount}%</Badge>
                      </>
                    )}
                  </div>

                  {item.recipes && item.recipes.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">HPP</span>
                      <span className="font-mono text-text-secondary">
                        {formatRupiah(hpp)}
                      </span>
                    </div>
                  )}

                  {kritis && reco && (
                    <div className="space-y-1">
                      <Badge variant="kritis">Margin Kritis</Badge>
                      <p className="text-xs text-danger">
                        Rekomendasi: {formatRupiah(reco)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-text-muted">
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    <Toggle
                      checked={item.is_active}
                      onChange={() => handleToggle(item.id, item.is_active)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-muted">
              <UtensilsCrossed className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Belum ada menu</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const hpp = calculateHPP(item.recipes, prices);
            const sellPrice =
              item.discount > 0
                ? item.price * (1 - item.discount / 100)
                : item.price;
            const kritis = isMarginKritis(hpp, sellPrice);
            const reco = kritis ? recommendedPrice(hpp) : null;

            return (
              <div
                key={item.id}
                className="rounded-md border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {item.name}
                    </h3>
                    {item.categories && (
                      <span className="text-small text-text-muted">
                        {item.categories.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-price font-mono text-primary">
                      {formatRupiah(sellPrice)}
                    </span>
                    <div className="text-xs text-text-secondary">
                      HPP:{" "}
                      <span className="font-mono">{formatRupiah(hpp)}</span>
                    </div>
                    {kritis && reco && (
                      <Badge variant="kritis" className="mt-1">
                        Rekomendasi {formatRupiah(reco)}
                      </Badge>
                    )}
                  </div>
                </div>

                {item.recipes && item.recipes.length > 0 ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-text-muted">
                      Resep
                    </p>
                    <div className="space-y-1">
                      {item.recipes.map((r) => {
                        const unitPrice =
                          prices.get(r.ingredient_id) ?? 0;
                        return (
                          <div
                            key={r.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-text-primary">
                              {r.ingredients?.name ?? "—"}
                            </span>
                            <div className="flex items-center gap-4 text-text-secondary">
                              <span className="font-mono text-xs">
                                {r.quantity} {r.ingredients?.unit ?? ""}
                              </span>
                              <span className="w-20 text-right font-mono text-xs">
                                {formatRupiah(unitPrice * r.quantity)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 border-t border-border pt-3 text-xs text-text-muted">
                    Belum ada resep
                  </p>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted">
              <UtensilsCrossed className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Belum ada menu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
