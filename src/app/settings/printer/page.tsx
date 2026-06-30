"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Check,
  Wifi,
  Bluetooth,
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

export default function PrinterPage() {
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
        <h1 className="font-display text-display">Printer</h1>
        <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Tersimpan" : "Simpan"}
        </Button>
      </div>

      <div className="space-y-5 rounded-md border border-border bg-surface p-5">
        <h2 className="text-title text-text-primary">Koneksi Printer</h2>
        <p className="text-xs text-text-muted">
          Pilih tipe koneksi printer struk thermal
        </p>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-secondary">
            Tipe Koneksi
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update({ printer_type: "bluetooth" })}
              className={cn(
                "flex h-11 items-center gap-2 rounded-sm border px-4 text-sm transition-colors duration-fast",
                settings.printer_type === "bluetooth"
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border-strong bg-surface text-text-secondary hover:border-primary",
              )}
            >
              <Bluetooth className="h-4 w-4" />
              Bluetooth
            </button>
            <button
              type="button"
              onClick={() => update({ printer_type: "wifi" })}
              className={cn(
                "flex h-11 items-center gap-2 rounded-sm border px-4 text-sm transition-colors duration-fast",
                settings.printer_type === "wifi"
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border-strong bg-surface text-text-secondary hover:border-primary",
              )}
            >
              <Wifi className="h-4 w-4" />
              WiFi
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-md border border-border bg-surface p-5">
        <h2 className="text-title text-text-primary">Format Struk</h2>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-secondary">
            Lebar Kertas
          </span>
          <div className="flex gap-2">
            {([58, 80] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => update({ paper_width: w })}
                className={cn(
                  "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                  settings.paper_width === w
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                )}
              >
                {w}mm
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={settings.auto_print}
            onClick={() => update({ auto_print: !settings.auto_print })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
              settings.auto_print ? "bg-primary" : "bg-border",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                settings.auto_print ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
          <div>
            <span className="block text-sm text-text-primary">Cetak Otomatis</span>
            <span className="block text-xs text-text-muted">
              Cetak struk otomatis setelah transaksi selesai
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-title text-text-primary mb-4">Preview Struk</h2>
        <div className="mx-auto max-w-[320px] rounded-md border border-border bg-white p-4 font-mono text-xs leading-relaxed">
          <div className="text-center">
            <p className="text-sm font-bold">{settings.store_name}</p>
            {settings.contact && (
              <p className="text-muted">{settings.contact}</p>
            )}
            <p className="border-b border-dashed border-border pb-2 mt-1 text-muted">
              {new Date().toLocaleString("id-ID")}
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Es Teh Manis</span>
              <span>1 x 8.000</span>
            </div>
            <div className="flex justify-between">
              <span>Nasi Goreng</span>
              <span>2 x 15.000</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border mt-2 pt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp 38.000</span>
            </div>
            {settings.tax_enabled && (
              <div className="flex justify-between">
                <span>PPN ({settings.tax_rate}%)</span>
                <span>Rp 4.180</span>
              </div>
            )}
            {settings.admin_fee_enabled && (
              <div className="flex justify-between">
                <span>Admin Fee</span>
                <span>
                  {settings.admin_fee_type === "persentase"
                    ? `${settings.admin_fee_value}%`
                    : `Rp ${settings.admin_fee_value.toLocaleString("id-ID")}`}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-dashed border-border pt-1 mt-1">
              <span>TOTAL</span>
              <span>Rp 42.180</span>
            </div>
            <div className="flex justify-between">
              <span>Tunai</span>
              <span>Rp 50.000</span>
            </div>
            <div className="flex justify-between">
              <span>Kembali</span>
              <span>Rp 7.820</span>
            </div>
          </div>

          <div className="mt-2 border-t border-dashed border-border pt-2 text-center text-muted">
            <p>Terima kasih telah berbelanja!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
