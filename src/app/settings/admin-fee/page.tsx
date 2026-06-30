"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Loader2,
  Check,
} from "lucide-react";
import type { StoreSettings } from "@/lib/supabase/types";

const defaultSettings: StoreSettings = {
  id: 1,
  store_name: "SIPI",
  logo_url: null,
  contact: null,
  wa_message_template: "",
  gmaps_link: null,
  kitchen_mode: false,
  tax_enabled: false,
  tax_rate: 11,
  admin_fee_enabled: false,
  admin_fee_type: "persentase",
  admin_fee_value: 0,
  printer_type: null,
  paper_width: 80,
  auto_print: false,
};

export default function AdminFeePage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const res = await supabase.from("store_settings").select("*").single();
    if (res.data) setSettings(res.data as StoreSettings);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("store_settings")
      .upsert({ id: 1, ...settings }, { onConflict: "id" });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (partial: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
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
        <h1 className="font-display text-display">Admin Fee</h1>
        <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Tersimpan" : "Simpan"}
        </Button>
      </div>

      <div className="space-y-6 rounded-md border border-border bg-surface p-5">
        <div className="space-y-4">
          <h2 className="text-title text-text-primary">Biaya Admin</h2>
          <p className="text-xs text-text-muted">
            Biaya admin per transaksi yang dibebankan ke pelanggan. Tampil di
            struk dan kalkulasi total transaksi di POS.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={settings.admin_fee_enabled}
              onClick={() =>
                update({ admin_fee_enabled: !settings.admin_fee_enabled })
              }
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
                settings.admin_fee_enabled ? "bg-primary" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                  settings.admin_fee_enabled ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <span className="text-sm text-text-secondary">
              {settings.admin_fee_enabled ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>

        {settings.admin_fee_enabled && (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-secondary">
                Jenis Admin Fee
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update({ admin_fee_type: "persentase" })}
                  className={cn(
                    "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                    settings.admin_fee_type === "persentase"
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                  )}
                >
                  Persentase (%)
                </button>
                <button
                  type="button"
                  onClick={() => update({ admin_fee_type: "nominal" })}
                  className={cn(
                    "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                    settings.admin_fee_type === "nominal"
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                  )}
                >
                  Nominal (Rp)
                </button>
              </div>
            </div>

            <Input
              label={
                settings.admin_fee_type === "persentase"
                  ? "Persentase"
                  : "Nominal (Rp)"
              }
              type="number"
              min={0}
              placeholder={
                settings.admin_fee_type === "persentase"
                  ? "5"
                  : "5000"
              }
              value={String(settings.admin_fee_value)}
              onChange={(e) =>
                update({
                  admin_fee_value: parseInt(e.target.value, 10) || 0,
                })
              }
              helperText={
                settings.admin_fee_type === "persentase"
                  ? `${settings.admin_fee_value}% dari subtotal`
                  : `Rp ${settings.admin_fee_value.toLocaleString("id-ID")} per transaksi`
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
