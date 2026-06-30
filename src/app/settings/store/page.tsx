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
  wa_message_template: "Terima kasih telah berbelanja!",
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

export default function StoreSettingsPage() {
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
        <h1 className="font-display text-display">Toko</h1>
        <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Tersimpan" : "Simpan"}
        </Button>
      </div>

      <div className="space-y-6 rounded-md border border-border bg-surface p-5">
        <Input
          label="Nama Toko"
          value={settings.store_name}
          onChange={(e) => update({ store_name: e.target.value })}
        />

        <Input
          label="Logo URL"
          placeholder="https://..."
          value={settings.logo_url ?? ""}
          onChange={(e) => update({ logo_url: e.target.value || null })}
        />

        <Input
          label="Kontak"
          placeholder="Nomor telepon toko"
          value={settings.contact ?? ""}
          onChange={(e) => update({ contact: e.target.value || null })}
        />

        <Input
          label="Pesan WhatsApp"
          helperText="Template pesan untuk struk via WhatsApp"
          value={settings.wa_message_template}
          onChange={(e) =>
            update({ wa_message_template: e.target.value })
          }
        />

        <Input
          label="Google Maps Link"
          placeholder="https://maps.google.com/..."
          value={settings.gmaps_link ?? ""}
          onChange={(e) => update({ gmaps_link: e.target.value || null })}
        />
      </div>

      <div className="space-y-4 rounded-md border border-border bg-surface p-5">
        <h2 className="text-title text-text-primary">Mode Dapur</h2>
        <p className="text-xs text-text-muted">
          Aktifkan tampilan khusus dapur di halaman Pesanan
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={settings.kitchen_mode}
            onClick={() => update({ kitchen_mode: !settings.kitchen_mode })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
              settings.kitchen_mode ? "bg-primary" : "bg-border",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                settings.kitchen_mode ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
          <span className="text-sm text-text-secondary">
            {settings.kitchen_mode ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-md border border-border bg-surface p-5">
        <h2 className="text-title text-text-primary">Pengaturan Pajak (PPN)</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={settings.tax_enabled}
            onClick={() => update({ tax_enabled: !settings.tax_enabled })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
              settings.tax_enabled ? "bg-primary" : "bg-border",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                settings.tax_enabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
          <span className="text-sm text-text-secondary">
            {settings.tax_enabled ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        {settings.tax_enabled && (
          <Input
            label="Persentase PPN"
            type="number"
            min={0}
            max={100}
            value={String(settings.tax_rate)}
            onChange={(e) =>
              update({ tax_rate: parseInt(e.target.value, 10) || 0 })
            }
            helperText="Default: 11%"
          />
        )}
      </div>
    </div>
  );
}
