"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { Input } from "@/components/ui/Input";
import { ProductCard } from "@/components/pos/ProductCard";
import { CategoryChips } from "@/components/pos/CategoryChips";
import { Loader2, UtensilsCrossed } from "lucide-react";
import type { MenuItemRow, Category } from "@/lib/supabase/types";

export default function PosPage() {
  const supabase = createClient();
  const addItem = useCartStore((s) => s.addItem);

  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*, categories(id, name)")
        .eq("is_active", true)
        .order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);

    if (itemsRes.data) setItems(itemsRes.data as MenuItemRow[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = items.filter((i) => {
    if (selectedCat && i.category_id !== selectedCat) return false;
    if (
      search &&
      !i.name.toLowerCase().includes(search.toLowerCase())
    )
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

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-title">Transaksi Penjualan</h1>
          <p className="text-small text-text-muted">{today}</p>
        </div>
        <div className="md:w-64">
          <Input
            search
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <CategoryChips
        categories={categories}
        selected={selectedCat}
        onSelect={setSelectedCat}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <UtensilsCrossed className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Tidak ada menu ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              price={item.price}
              photoUrl={item.photo_url}
              discount={item.discount}
              onClick={() =>
                addItem({
                  menu_item_id: item.id,
                  name: item.name,
                  price: item.price,
                  photo_url: item.photo_url,
                  discount: item.discount,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
