"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Ticket,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { Promo } from "@/lib/supabase/types";

type ModalMode = "add" | "edit" | null;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpired(promo: Promo): boolean {
  if (!promo.valid_until) return false;
  return new Date(promo.valid_until) < new Date();
}

export default function PromoPage() {
  const supabase = createClient();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"nominal" | "persentase">("persentase");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [saving, setSaving] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(false);

  const fetchPromos = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const res = await supabase
      .from("promos")
      .select("*")
      .order("created_at", { ascending: false });
    if (res.data) setPromos(res.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const openAdd = () => {
    setModal("add");
    setEditId(null);
    setCode("");
    setDiscountType("persentase");
    setDiscountValue("");
    setValidFrom("");
    setValidUntil("");
  };

  const openEdit = (p: Promo) => {
    setModal("edit");
    setEditId(p.id);
    setCode(p.code);
    setDiscountType(p.discount_type);
    setDiscountValue(String(p.discount_value));
    setValidFrom(p.valid_from ? p.valid_from.slice(0, 10) : "");
    setValidUntil(p.valid_until ? p.valid_until.slice(0, 10) : "");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!supabase || !code.trim() || !discountValue) return;
    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseInt(discountValue, 10),
      valid_from: validFrom || null,
      valid_until: validUntil || null,
    };

    if (modal === "add") {
      await supabase.from("promos").insert(payload);
    } else if (modal === "edit" && editId) {
      await supabase.from("promos").update(payload).eq("id", editId);
    }

    setSaving(false);
    closeModal();
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Hapus promo ini?")) return;
    await supabase.from("promos").delete().eq("id", id);
    fetchPromos();
  };

  const toggleActive = async (promo: Promo) => {
    if (!supabase) return;
    await supabase
      .from("promos")
      .update({ is_active: !promo.is_active })
      .eq("id", promo.id);
    setPromos((prev) =>
      prev.map((p) =>
        p.id === promo.id ? { ...p, is_active: !p.is_active } : p,
      ),
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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display">Promo</h1>
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Buat Promo
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-surface p-4">
        <div>
          <h2 className="text-sm font-medium text-text-primary">
            Diskon Global
          </h2>
          <p className="text-xs text-text-muted">
            Aktifkan untuk menerapkan diskon ke semua item di keranjang
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={globalDiscount}
          onClick={() => setGlobalDiscount(!globalDiscount)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
            globalDiscount ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
              globalDiscount ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Ticket className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Belum ada promo</p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[120px_1fr_100px_160px_100px_80px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase text-text-muted border-b border-border">
            <span>Kode</span>
            <span>Diskon</span>
            <span className="text-center">Status</span>
            <span>Masa Berlaku</span>
            <span className="text-center">Aktif</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-border">
            {promos.map((promo) => {
              const expired = isExpired(promo);
              return (
                <div
                  key={promo.id}
                  className="grid grid-cols-2 grid-rows-[auto_auto_auto] gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[120px_1fr_100px_160px_100px_80px] md:grid-rows-1 md:items-center"
                >
                  <div className="col-span-2 flex items-center gap-2 md:col-span-1">
                    <span className="rounded-md bg-bg px-2 py-1 font-mono text-sm font-bold text-primary">
                      {promo.code}
                    </span>
                  </div>

                  <span className="text-sm font-mono text-text-primary">
                    {promo.discount_type === "persentase"
                      ? `${promo.discount_value}%`
                      : formatRupiah(promo.discount_value)}
                  </span>

                  <span className="col-span-2 md:col-span-1 md:text-center">
                    <Badge variant={expired ? "habis" : "default"}>
                      {expired ? "Expired" : "Aktif"}
                    </Badge>
                  </span>

                  <span className="text-xs text-text-muted">
                    {formatDate(promo.valid_from)} – {formatDate(promo.valid_until)}
                  </span>

                  <div className="col-span-2 flex items-center justify-center md:col-span-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={promo.is_active}
                      disabled={expired}
                      onClick={() => toggleActive(promo)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
                        promo.is_active ? "bg-primary" : "bg-border",
                        expired && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                          promo.is_active ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                    <button
                      type="button"
                      onClick={() => openEdit(promo)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg transition-colors duration-fast"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promo.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors duration-fast"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title text-text-primary">
                {modal === "add" ? "Buat Promo" : "Edit Promo"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg transition-colors duration-fast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Kode Voucher"
                placeholder="Contoh: DISKON10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-secondary">
                  Jenis Diskon
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType("persentase")}
                    className={cn(
                      "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                      discountType === "persentase"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                    )}
                  >
                    Persentase (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("nominal")}
                    className={cn(
                      "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                      discountType === "nominal"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                    )}
                  >
                    Nominal (Rp)
                  </button>
                </div>
              </div>

              <Input
                label={discountType === "persentase" ? "Persentase Diskon" : "Nominal Diskon"}
                type="number"
                placeholder={discountType === "persentase" ? "10" : "10000"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                helperText={
                  discountType === "persentase"
                    ? `Diskon ${discountValue || 0}% dari total`
                    : discountValue
                      ? `Diskon ${formatRupiah(parseInt(discountValue, 10))}`
                      : undefined
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Mulai"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
                <Input
                  label="Berakhir"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={saving}
                  disabled={!code.trim() || !discountValue}
                  onClick={handleSave}
                >
                  {modal === "add" ? "Buat" : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
