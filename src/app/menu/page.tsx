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
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  MenuItemRow,
  Category,
  Ingredient,
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
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [prices, setPrices] = useState<Map<string, number>>(EMPTY_MAP);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDiscount, setAddDiscount] = useState("");
  const [addCategoryId, setAddCategoryId] = useState<string | null>(null);
  const [addPhotoUrl, setAddPhotoUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const [recipeItem, setRecipeItem] = useState<MenuItemRow | null>(null);
  const [recipeEntries, setRecipeEntries] = useState<Array<{ ingredient_id: string; quantity: number }>>([]);
  const [newIngId, setNewIngId] = useState("");
  const [newQty, setNewQty] = useState("");
  const [savingRecipe, setSavingRecipe] = useState(false);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [itemsRes, catsRes, pricesRes, ingsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*, categories(id, name), recipes(*, ingredients(id, name, unit)), menu_variations(*)")
        .order("name", { ascending: true }),
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase.from("ingredient_price_history").select("ingredient_id, price").order("recorded_at", { ascending: false }),
      supabase.from("ingredients").select("id, name, unit").order("name", { ascending: true }),
    ]);

    if (catsRes.data) setCategories(catsRes.data);
    if (ingsRes.data) setAllIngredients(ingsRes.data);

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

  const openAddModal = () => {
    setAddName("");
    setAddPrice("");
    setAddDiscount("");
    setAddCategoryId(null);
    setAddPhotoUrl("");
    setShowAddModal(true);
  };

  const handleAddMenu = async () => {
    if (!supabase || !addName.trim() || !addPrice) return;
    setAdding(true);
    await supabase.from("menu_items").insert({
      name: addName.trim(),
      price: parseInt(addPrice, 10),
      category_id: addCategoryId,
      discount: parseInt(addDiscount, 10) || 0,
      photo_url: addPhotoUrl.trim() || null,
      is_active: true,
    });
    setAdding(false);
    setShowAddModal(false);
    fetchData();
  };

  const handleToggle = async (id: string, current: boolean) => {
    if (!supabase) return;
    await supabase.from("menu_items").update({ is_active: !current }).eq("id", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: !current } : i)),
    );
  };

  const openRecipeModal = (item: MenuItemRow) => {
    setRecipeItem(item);
    setRecipeEntries(
      (item.recipes ?? []).map((r) => ({
        ingredient_id: r.ingredient_id,
        quantity: r.quantity,
      })),
    );
    setNewIngId("");
    setNewQty("");
  };

  const liveHPP = recipeEntries.reduce((sum, e) => {
    const unitPrice = prices.get(e.ingredient_id) ?? 0;
    return sum + unitPrice * e.quantity;
  }, 0);

  const recipeSellPrice = recipeItem
    ? recipeItem.discount > 0
      ? recipeItem.price * (1 - recipeItem.discount / 100)
      : recipeItem.price
    : 0;

  const recipeKritis = isMarginKritis(liveHPP, recipeSellPrice);
  const recipeReco = recipeKritis ? recommendedPrice(liveHPP) : null;

  const addRecipeEntry = () => {
    if (!newIngId || !newQty) return;
    const qty = parseFloat(newQty);
    if (qty <= 0) return;
    if (recipeEntries.some((e) => e.ingredient_id === newIngId)) return;
    setRecipeEntries((prev) => [...prev, { ingredient_id: newIngId, quantity: qty }]);
    setNewIngId("");
    setNewQty("");
  };

  const removeRecipeEntry = (ingredientId: string) => {
    setRecipeEntries((prev) => prev.filter((e) => e.ingredient_id !== ingredientId));
  };

  const handleSaveRecipe = async () => {
    if (!supabase || !recipeItem) return;
    setSavingRecipe(true);

    await supabase.from("recipes").delete().eq("menu_item_id", recipeItem.id);

    if (recipeEntries.length > 0) {
      await supabase.from("recipes").insert(
        recipeEntries.map((e) => ({
          menu_item_id: recipeItem.id,
          ingredient_id: e.ingredient_id,
          quantity: e.quantity,
        })),
      );
    }

    setSavingRecipe(false);
    setRecipeItem(null);
    fetchData();
  };

  const filtered = items.filter((i) => {
    if (selectedCat && i.category_id !== selectedCat) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
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
        <Button variant="primary" size="md" onClick={openAddModal}>
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
          <Input search placeholder="Cari menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            const sellPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
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
                    <Image src={item.photo_url} alt={item.name} className="h-full w-full object-cover" width={200} height={200} />
                  ) : (
                    <UtensilsCrossed className="h-12 w-12 text-text-muted opacity-30" />
                  )}
                </div>

                <div className="space-y-2 p-3">
                  {item.categories && (
                    <span className="text-small text-text-muted">{item.categories.name}</span>
                  )}

                  <h3 className="text-sm font-medium text-text-primary truncate">{item.name}</h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-price font-mono text-primary">{formatRupiah(sellPrice)}</span>
                    {item.discount > 0 && (
                      <>
                        <span className="text-xs text-text-muted line-through">{formatRupiah(item.price)}</span>
                        <Badge variant="diskon">{item.discount}%</Badge>
                      </>
                    )}
                  </div>

                  {item.recipes && item.recipes.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">HPP</span>
                      <span className="font-mono text-text-secondary">{formatRupiah(hpp)}</span>
                    </div>
                  )}

                  {kritis && reco && (
                    <div className="space-y-1">
                      <Badge variant="kritis">Margin Kritis</Badge>
                      <p className="text-xs text-danger">Rekomendasi: {formatRupiah(reco)}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-text-muted">{item.is_active ? "Aktif" : "Nonaktif"}</span>
                    <Toggle checked={item.is_active} onChange={() => handleToggle(item.id, item.is_active)} />
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
            const sellPrice = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            const kritis = isMarginKritis(hpp, sellPrice);
            const reco = kritis ? recommendedPrice(hpp) : null;

            return (
              <div key={item.id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{item.name}</h3>
                    {item.categories && (
                      <span className="text-small text-text-muted">{item.categories.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openRecipeModal(item)}
                      className="flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-text-secondary transition-colors duration-fast hover:bg-bg hover:text-text-primary"
                    >
                      <Pencil className="h-3 w-3" />
                      Kelola Resep
                    </button>
                    <div className="text-right">
                      <span className="text-price font-mono text-primary">{formatRupiah(sellPrice)}</span>
                      <div className="text-xs text-text-secondary">
                        HPP: <span className="font-mono">{formatRupiah(hpp)}</span>
                      </div>
                      {kritis && reco && (
                        <Badge variant="kritis" className="mt-1">Rekomendasi {formatRupiah(reco)}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {item.recipes && item.recipes.length > 0 ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-text-muted">Resep</p>
                    <div className="space-y-1">
                      {item.recipes.map((r) => {
                        const unitPrice = prices.get(r.ingredient_id) ?? 0;
                        return (
                          <div key={r.id} className="flex items-center justify-between text-sm">
                            <span className="text-text-primary">{r.ingredients?.name ?? "—"}</span>
                            <div className="flex items-center gap-4 text-text-secondary">
                              <span className="font-mono text-xs">{r.quantity} {r.ingredients?.unit ?? ""}</span>
                              <span className="w-20 text-right font-mono text-xs">{formatRupiah(unitPrice * r.quantity)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
                    <p className="text-xs text-text-muted">Belum ada resep</p>
                    <button
                      type="button"
                      onClick={() => openRecipeModal(item)}
                      className="flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-primary transition-colors duration-fast hover:bg-bg"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Resep
                    </button>
                  </div>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-lg p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title text-text-primary">Tambah Menu</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg transition-colors duration-fast">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Input label="Nama Menu" placeholder="Contoh: Es Teh Manis" value={addName} onChange={(e) => setAddName(e.target.value)} />
              <Input label="Harga (Rp)" type="number" min={0} placeholder="10000" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} />
              <Input label="Diskon (%)" type="number" min={0} max={100} placeholder="0" value={addDiscount} onChange={(e) => setAddDiscount(e.target.value)} helperText={addDiscount ? `Harga jual: ${formatRupiah(parseInt(addPrice || "0") * (1 - Math.min(parseInt(addDiscount, 10) || 0, 100) / 100))}` : undefined} />

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-secondary">Kategori</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAddCategoryId(null)}
                    className={cn(
                      "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                      !addCategoryId ? "bg-primary border-transparent text-white" : "bg-surface border-border text-text-secondary hover:border-primary",
                    )}
                  >
                    Tanpa Kategori
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setAddCategoryId(c.id)}
                      className={cn(
                        "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                        addCategoryId === c.id ? "bg-primary border-transparent text-white" : "bg-surface border-border text-text-secondary hover:border-primary",
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Foto URL" placeholder="https://... (opsional)" value={addPhotoUrl} onChange={(e) => setAddPhotoUrl(e.target.value)} helperText="Paste URL gambar menu" />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button variant="primary" size="md" loading={adding} disabled={!addName.trim() || !addPrice} onClick={handleAddMenu}>Tambah</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {recipeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRecipeItem(null)} />
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface shadow-lg p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-title text-text-primary">Kelola Resep</h2>
                <p className="text-xs text-text-muted mt-0.5">{recipeItem.name}</p>
              </div>
              <button type="button" onClick={() => setRecipeItem(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg transition-colors duration-fast">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-md bg-bg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">HPP (live)</span>
                  <span className={cn("font-mono font-medium", recipeKritis ? "text-danger" : "text-primary")}>
                    {formatRupiah(liveHPP)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Harga Jual</span>
                  <span className="font-mono text-text-primary">{formatRupiah(recipeSellPrice)}</span>
                </div>
                {recipeKritis && (
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="kritis">Margin Kritis</Badge>
                    {recipeReco && <span className="text-xs text-danger">Rekomendasi: {formatRupiah(recipeReco)}</span>}
                  </div>
                )}
              </div>

              {recipeEntries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-muted">Komposisi</p>
                  {recipeEntries.map((entry) => {
                    const ing = allIngredients.find((i) => i.id === entry.ingredient_id);
                    const unitPrice = prices.get(entry.ingredient_id) ?? 0;
                    return (
                      <div key={entry.ingredient_id} className="flex items-center justify-between rounded-md bg-bg px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm text-text-primary truncate">{ing?.name ?? "—"}</span>
                          <span className="text-xs text-text-muted">{entry.quantity} {ing?.unit ?? ""} × {formatRupiah(unitPrice)}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="w-20 text-right font-mono text-xs text-text-secondary">{formatRupiah(unitPrice * entry.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => removeRecipeEntry(entry.ingredient_id)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-danger-bg hover:text-danger transition-colors duration-fast"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-text-muted">Tambah Bahan</p>
                <div className="flex gap-2">
                  <select
                    value={newIngId}
                    onChange={(e) => setNewIngId(e.target.value)}
                    className="h-11 flex-1 rounded-sm border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
                  >
                    <option value="">Pilih bahan...</option>
                    {allIngredients
                      .filter((i) => !recipeEntries.some((e) => e.ingredient_id === i.id))
                      .map((i) => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                  </select>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Qty"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="!mt-0 w-24"
                  />
                  <Button variant="secondary" size="md" onClick={addRecipeEntry} disabled={!newIngId || !newQty || parseFloat(newQty) <= 0}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={() => setRecipeItem(null)}>Batal</Button>
                <Button variant="primary" size="md" loading={savingRecipe} onClick={handleSaveRecipe}>
                  Simpan Resep
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
