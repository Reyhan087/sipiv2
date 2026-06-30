"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Loader2,
  Pencil,
  Trash2,
  X,
  Phone,
  Receipt,
  UserPlus,
} from "lucide-react";
import type { Customer, Transaction } from "@/lib/supabase/types";

type ModalMode = "add" | "edit" | null;

interface CustomerWithStats extends Customer {
  transaction_count: number;
  total_spent: number;
  last_transaction: string | null;
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

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const toggleExpand = (customerId: string) => {
    if (expandedId === customerId) {
      setExpandedId(null);
    } else {
      setExpandedId(customerId);
      fetchHistory(customerId);
    }
  };

  const fetchCustomers = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const res = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!res.data) {
      setLoading(false);
      return;
    }

    const allCustomers = res.data as Customer[];

    const txRes = await supabase
      .from("transactions")
      .select("id, customer_id, total, status, created_at")
      .eq("status", "selesai");

    const txByCustomer = new Map<string, Transaction[]>();
    if (txRes.data) {
      for (const tx of txRes.data) {
        if (tx.customer_id) {
          const existing = txByCustomer.get(tx.customer_id) ?? [];
          existing.push(tx);
          txByCustomer.set(tx.customer_id, existing);
        }
      }
    }

    const withStats: CustomerWithStats[] = allCustomers.map((c) => {
      const txs = txByCustomer.get(c.id) ?? [];
      return {
        ...c,
        transaction_count: txs.length,
        total_spent: txs.reduce((s, t) => s + t.total, 0),
        last_transaction: txs.length > 0
          ? txs.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )[0].created_at
          : null,
      };
    });

    setCustomers(withStats);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const fetchHistory = async (customerId: string) => {
    if (!supabase) return;
    setLoadingHistory(true);
    setExpandedId(customerId);
    const res = await supabase
      .from("transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (res.data) setHistory(res.data);
    setLoadingHistory(false);
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(q))
    );
  });

  const openAdd = () => {
    setModal("add");
    setEditId(null);
    setFormName("");
    setFormWhatsapp("");
  };

  const openEdit = (c: Customer) => {
    setModal("edit");
    setEditId(c.id);
    setFormName(c.name);
    setFormWhatsapp(c.whatsapp ?? "");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setFormName("");
    setFormWhatsapp("");
  };

  const handleSave = async () => {
    if (!supabase || !formName.trim()) return;
    setSaving(true);

    if (modal === "add") {
      await supabase.from("customers").insert({
        name: formName.trim(),
        whatsapp: formWhatsapp.trim() || null,
      });
    } else if (modal === "edit" && editId) {
      await supabase
        .from("customers")
        .update({
          name: formName.trim(),
          whatsapp: formWhatsapp.trim() || null,
        })
        .eq("id", editId);
    }

    setSaving(false);
    closeModal();
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Hapus pelanggan ini?")) return;
    await supabase.from("customers").delete().eq("id", id);
    setExpandedId(null);
    fetchCustomers();
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
        <h1 className="font-display text-display">Pelanggan</h1>
        <Button variant="primary" size="md" onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      <div className="md:w-64">
        <Input
          search
          placeholder="Cari nama atau WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Users className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Belum ada pelanggan</p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_160px_100px_120px_160px_100px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase text-text-muted border-b border-border">
            <span>Nama</span>
            <span>WhatsApp</span>
            <span className="text-center">Transaksi</span>
            <span className="text-right">Total Belanja</span>
            <span>Terakhir</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((customer) => {
              const expanded = expandedId === customer.id;
              return (
                <div key={customer.id}>
                  <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[1fr_160px_100px_120px_160px_100px] md:grid-rows-1 md:items-center">
                    <button
                      type="button"
                      onClick={() => toggleExpand(customer.id)}
                      className="col-span-2 flex items-center gap-2 text-left md:col-span-1"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-sm font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium text-text-primary">
                          {customer.name}
                        </span>
                        <span className="block text-xs text-text-muted md:hidden">
                          {customer.whatsapp ?? "—"}
                        </span>
                      </div>
                    </button>

                    <span className="hidden md:flex items-center gap-1 text-sm text-text-secondary">
                      <Phone className="h-3 w-3" />
                      {customer.whatsapp ?? "—"}
                    </span>

                    <span className="text-xs text-text-muted md:text-sm md:text-center">
                      {customer.transaction_count}x
                    </span>

                    <span className="text-right text-sm font-mono text-text-secondary">
                      {formatRupiah(customer.total_spent)}
                    </span>

                    <span className="text-xs text-text-muted hidden md:block truncate">
                      {customer.last_transaction
                        ? formatTime(customer.last_transaction)
                        : "—"}
                    </span>

                    <div className="col-span-2 flex items-center gap-1 md:col-span-1 md:justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(customer)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg transition-colors duration-fast"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(customer.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors duration-fast"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-border px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-4 w-4 text-text-secondary" />
                        <span className="text-sm font-semibold text-text-primary">
                          Riwayat Transaksi
                        </span>
                      </div>
                      {loadingHistory ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-sm text-text-muted py-4">
                          Belum ada transaksi
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {history.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between rounded-md bg-bg px-3 py-2"
                            >
                              <div>
                                <span className="text-xs text-text-muted">
                                  {formatTime(tx.created_at)}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    variant={
                                      tx.status === "selesai"
                                        ? "success"
                                        : tx.status === "diproses"
                                          ? "default"
                                          : "warning"
                                    }
                                  >
                                    {tx.status.charAt(0).toUpperCase() +
                                      tx.status.slice(1)}
                                  </Badge>
                                  <span className="text-xs text-text-muted">
                                    {tx.payment_method ?? "—"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-mono font-medium text-primary">
                                {formatRupiah(tx.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title text-text-primary">
                {modal === "add" ? "Tambah Pelanggan" : "Edit Pelanggan"}
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
                label="Nama"
                placeholder="Nama pelanggan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                label="WhatsApp"
                placeholder="08xxxxxxxxxx"
                value={formWhatsapp}
                onChange={(e) => setFormWhatsapp(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={saving}
                  disabled={!formName.trim()}
                  onClick={handleSave}
                >
                  {modal === "add" ? "Tambah" : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
