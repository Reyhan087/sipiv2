"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  Loader2,
  Download,
  CalendarDays,
  TrendingUp,
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  Transaction,
  TransactionItem,
} from "@/lib/supabase/types";

type Period = "daily" | "weekly" | "monthly";

interface TxRow extends Transaction {
  transaction_items: TransactionItem[];
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(a: Date, b: Date): boolean {
  const wa = new Date(a);
  wa.setDate(wa.getDate() - wa.getDay());
  const wb = new Date(b);
  wb.setDate(wb.getDate() - wb.getDay());
  return wa.getTime() === wb.getTime();
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function periodMatch(txDate: Date, now: Date, period: Period): boolean {
  const tx = startOfDay(txDate);
  const ref = startOfDay(now);
  if (period === "daily") return isSameDay(tx, ref);
  if (period === "weekly") return isSameWeek(tx, ref);
  return isSameMonth(tx, ref);
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const paymentLabels: Record<string, string> = {
  tunai: "Tunai",
  qris: "QRIS",
  transfer: "Transfer",
};

const periodLabels: Record<Period, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

export default function ReportsPage() {
  const supabase = createClient();
  const [allTx, setAllTx] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("daily");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setDateFrom(toDateInputValue(now));
    setDateTo(toDateInputValue(now));
  }, []);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const res = await supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .order("created_at", { ascending: false });

    if (res.data) setAllTx(res.data as TxRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const now = new Date();
  const filteredByPeriod = allTx.filter((tx) =>
    periodMatch(new Date(tx.created_at), now, period),
  );

  const filteredByDateRange = dateFrom && dateTo
    ? allTx.filter((tx) => {
        const d = new Date(tx.created_at);
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        return d >= from && d <= to;
      })
    : allTx;

  const useDateRange = dateFrom && dateTo;
  const displayed = useDateRange ? filteredByDateRange : filteredByPeriod;

  const summaryTxCount = displayed.length;
  const summaryRevenue = displayed.reduce((s, t) => s + t.total, 0);

  const handleExport = () => {
    window.print();
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
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display">Laporan</h1>
        <Button variant="secondary" size="md" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Total Transaksi</span>
          </div>
          <p className="text-price-lg font-mono text-text-primary">
            {summaryTxCount}
          </p>
          <span className="text-xs text-text-muted">{periodLabels[period]}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Pendapatan</span>
          </div>
          <p className="text-price-lg font-mono text-primary">
            {formatRupiah(summaryRevenue)}
          </p>
          <span className="text-xs text-text-muted">{periodLabels[period]}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
                period === p
                  ? "bg-primary border-transparent text-white"
                  : "bg-surface border-border text-text-secondary hover:border-primary",
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-text-muted" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 rounded-sm border border-border-strong bg-surface px-2 text-sm text-text-primary outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
          />
          <span className="text-text-muted">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 rounded-sm border border-border-strong bg-surface px-2 text-sm text-text-primary outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
          />
          {useDateRange && (
            <button
              type="button"
              onClick={() => {
                const n = new Date();
                setDateFrom(toDateInputValue(n));
                setDateTo(toDateInputValue(n));
              }}
              className="text-xs text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[1fr_160px_120px_100px_60px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase text-text-muted border-b border-border">
          <span>Waktu</span>
          <span>Item</span>
          <span className="text-right">Total</span>
          <span>Metode Bayar</span>
          <span />
        </div>

        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <BarChart3 className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayed.map((tx) => {
              const expanded = expandedId === tx.id;
              const itemCount = tx.transaction_items.length;
              return (
                <div key={tx.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === tx.id ? null : tx.id,
                      )
                    }
                    className="grid w-full grid-cols-2 grid-rows-[auto_auto] gap-x-4 gap-y-0.5 px-4 py-3 text-left md:grid-cols-[1fr_160px_120px_100px_60px] md:grid-rows-1 md:items-center"
                  >
                    <span className="col-span-2 text-sm text-text-primary md:col-span-1 truncate">
                      {formatTime(tx.created_at)}
                    </span>
                    <span className="text-xs text-text-muted md:text-sm">
                      {itemCount} item
                    </span>
                    <span className="text-right text-sm font-mono font-medium text-primary">
                      {formatRupiah(tx.total)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {paymentLabels[tx.payment_method ?? ""] ??
                        tx.payment_method ??
                        "—"}
                    </span>
                    <span className="hidden md:flex md:justify-center">
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-muted" />
                      )}
                    </span>
                  </button>

                  {expanded && (
                    <div className="border-t border-border px-4 py-2">
                      <div className="space-y-1">
                        {tx.transaction_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-text-primary truncate block">
                                {item.name}
                              </span>
                            <span className="text-xs text-text-muted">
                              {item.quantity} x {formatRupiah(item.price)}
                            </span>
                            </div>
                            <span className="ml-3 font-mono text-text-secondary">
                              {formatRupiah(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-border pt-2 text-sm font-medium text-text-primary">
                          <span>Total</span>
                          <span className="font-mono text-primary">
                            {formatRupiah(tx.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
