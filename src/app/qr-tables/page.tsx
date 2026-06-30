"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Smartphone,
  QrCode,
  Download,
  Trash2,
  Plus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface TableEntry {
  id: string;
  label: string;
  number: number;
  qrCode: string;
}

export default function QRTablesPage() {
  const supabase = createClient();
  const [tableCount, setTableCount] = useState(10);
  const [tables, setTables] = useState<TableEntry[]>([]);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateQRCodes = useCallback(() => {
    const generatedTables: TableEntry[] = Array.from(
      { length: tableCount },
      (_, i) => ({
        id: crypto.randomUUID(),
        label: `Meja ${i + 1}`,
        number: i + 1,
        qrCode: `${window.location.origin}/order/${i + 1}`,
      }),
    );
    setTables(generatedTables);
    setGenerated(true);
  }, [tableCount]);

  const saveToDB = async () => {
    if (!supabase) return;
    setSaving(true);

    await supabase.from("qr_tables").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    if (tables.length > 0) {
      await supabase.from("qr_tables").insert(
        tables.map((t) => ({
          label: t.label,
          table_number: t.number,
          qr_code: t.qrCode,
        })),
      );
    }

    setSaving(false);
  };

  const deleteTable = (idx: number) => {
    setTables((prev) => prev.filter((_, i) => i !== idx));
    if (tables.length <= 1) setGenerated(false);
  };

  const exportSingleQR = (label: string, svgElement: SVGSVGElement | null) => {
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label.replace(/\s+/g, "_")}_QR.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display">QR Meja</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="md:w-48">
            <Input
              label="Jumlah Meja"
              type="number"
              min={1}
              max={100}
              value={String(tableCount)}
              onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              helperText="Meja 1, Meja 2, dst."
            />
          </div>
          <Button variant="primary" size="md" onClick={generateQRCodes}>
            <QrCode className="h-4 w-4" />
            Generate QR
          </Button>
          {generated && (
            <>
              <Button
                variant="secondary"
                size="md"
                loading={saving}
                onClick={saveToDB}
              >
                <Plus className="h-4 w-4" />
                Simpan
              </Button>
              <Button variant="ghost" size="md" onClick={exportAllPDF}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {!generated ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Smartphone className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Masukkan jumlah meja lalu klik Generate QR</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((table, idx) => (
            <div
              key={table.id}
              className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold text-text-primary">
                  {table.label}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTable(idx)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-danger-bg hover:text-danger transition-colors duration-fast"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div
                ref={(el) => {
                  if (el) {
                    el.dataset.tableIdx = String(idx);
                  }
                }}
                className="rounded-md border border-border bg-white p-2"
              >
                <QRCodeSVG
                  value={table.qrCode}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span className="text-xs text-text-muted truncate max-w-full font-mono">
                {table.qrCode}
              </span>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  const svgEl = document.querySelector(
                    `[data-table-idx="${idx}"] svg`,
                  ) as SVGSVGElement | null;
                  exportSingleQR(table.label, svgEl);
                }}
              >
                <Download className="h-3.5 w-3.5" />
                PNG
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
