"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/format";
import {
  TrendingUp,
  Loader2,
  Users,
  Receipt,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  Transaction,
  TransactionItem,
  Customer,
} from "@/lib/supabase/types";

const COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#0891B2", "#7C3AED"];

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getHour(dateStr: string): number {
  return new Date(dateStr).getHours();
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
}

function formatHourLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txItems, setTxItems] = useState<TransactionItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [txRes, itemsRes, custRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("status", "selesai")
        .order("created_at", { ascending: false }),
      supabase.from("transaction_items").select("*"),
      supabase.from("customers").select("id, created_at"),
    ]);

    if (txRes.data) setTransactions(txRes.data);
    if (itemsRes.data) setTxItems(itemsRes.data);
    if (custRes.data) setCustomers(custRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topMenuItems = useMemo(() => {
    const countMap = new Map<string, { name: string; qty: number }>();
    for (const item of txItems) {
      const existing = countMap.get(item.menu_item_id ?? "") ?? {
        name: item.name,
        qty: 0,
      };
      existing.qty += item.quantity;
      countMap.set(item.menu_item_id ?? item.name, existing);
    }
    return Array.from(countMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [txItems]);

  const topMenuData = useMemo(
    () =>
      topMenuItems.map((i) => ({
        name: i.name.length > 12 ? i.name.slice(0, 12) + "..." : i.name,
        qty: i.qty,
      })),
    [topMenuItems],
  );

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: formatHourLabel(h),
      count: 0,
    }));
    for (const tx of transactions) {
      const h = getHour(tx.created_at);
      hours[h].count += 1;
    }
    return hours.filter((h) => h.count > 0);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const tx of transactions) {
      const key = getMonthKey(tx.created_at);
      monthMap.set(key, (monthMap.get(key) ?? 0) + tx.total);
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({
        month: formatMonthLabel(key),
        total,
      }));
  }, [transactions]);

  const repeatVsNew = useMemo(() => {
    const customerTxCount = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.customer_id) {
        customerTxCount.set(
          tx.customer_id,
          (customerTxCount.get(tx.customer_id) ?? 0) + 1,
        );
      }
    }

    let repeatCount = 0;
    let newCount = 0;
    for (const [, count] of customerTxCount) {
      if (count > 1) repeatCount++;
      else newCount++;
    }

    const noCustomerCount = transactions.filter((t) => !t.customer_id).length;

    return [
      { name: "Baru", value: newCount },
      { name: "Repeat", value: repeatCount },
      { name: "Tanpa ID", value: noCustomerCount },
    ];
  }, [transactions]);

  const clv = useMemo(() => {
    const customerSpending = new Map<string, { total: number; txs: number }>();
    for (const tx of transactions) {
      if (tx.customer_id) {
        const existing = customerSpending.get(tx.customer_id) ?? {
          total: 0,
          txs: 0,
        };
        existing.total += tx.total;
        existing.txs += 1;
        customerSpending.set(tx.customer_id, existing);
      }
    }

    if (customerSpending.size === 0) return 0;

    let total = 0;
    for (const [, data] of customerSpending) {
      total += data.total;
    }
    return total / customerSpending.size;
  }, [transactions]);

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
      <h1 className="font-display text-display">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Total Transaksi</span>
          </div>
          <p className="text-price-lg font-mono text-text-primary">
            {transactions.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Pendapatan</span>
          </div>
          <p className="text-price-lg font-mono text-primary">
            {formatRupiah(transactions.reduce((s, t) => s + t.total, 0))}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Pelanggan</span>
          </div>
          <p className="text-price-lg font-mono text-text-primary">
            {customers.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">CLV</span>
          </div>
          <p className="text-price-lg font-mono text-text-primary">
            {formatRupiah(clv)}
          </p>
          <span className="text-xs text-text-muted">Rata-rata per pelanggan</span>
        </div>
      </div>

      <div className="rounded-md border-l-4 border-l-info bg-info-bg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div>
            <h3 className="text-sm font-semibold text-info">AI Insight</h3>
            <p className="mt-1 text-sm italic text-text-primary">
              Penjualan naik 15% minggu ini dibandingkan minggu lalu. Es Teh Manis
              menjadi produk terlaris dengan 48 porsi terjual. Jam tersibuk di jam
              12.00–13.00. Pertahankan stok gula dan teh hijau agar tidak menghambat
              produksi.
            </p>
            <p className="mt-2 text-xs text-text-muted">
              AI Insight akan otomatis diperbarui setelah integrasi Gemini API.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-title text-text-primary mb-4">Top Menu Terlaris</h2>
          {topMenuData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <UtensilsCrossed className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">Belum ada data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topMenuData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value} porsi`, "Qty"]}
                />
                <Bar
                  dataKey="qty"
                  fill="var(--color-primary)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-title text-text-primary mb-4">Jam Tersibuk</h2>
          {hourlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <TrendingUp className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">Belum ada data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyData} margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value} order`, "Transaksi"]}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-success)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-title text-text-primary mb-4">Growth Penjualan Bulanan</h2>
          {monthlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <TrendingUp className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">Belum ada data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}jt`
                      : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}rb`
                        : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [
                    formatRupiah(value),
                    "Pendapatan",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-title text-text-primary mb-4">Repeat vs New Customer</h2>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Users className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">Belum ada data</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={repeatVsNew}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {repeatVsNew.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => [value, "Pelanggan"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4">
                {repeatVsNew.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
