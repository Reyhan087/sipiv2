"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  UserMinus,
  UserCheck,
} from "lucide-react";
import type { Employee } from "@/lib/supabase/types";

type ModalMode = "add" | "edit" | null;

export default function EmployeesPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPin, setFormPin] = useState("");
  const [formRole, setFormRole] = useState<"owner" | "karyawan">("karyawan");
  const [saving, setSaving] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const res = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    if (res.data) setEmployees(res.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openAdd = () => {
    setModal("add");
    setEditId(null);
    setFormName("");
    setFormUsername("");
    setFormPin("");
    setFormRole("karyawan");
  };

  const openEdit = (emp: Employee) => {
    setModal("edit");
    setEditId(emp.id);
    setFormName(emp.name);
    setFormUsername(emp.username);
    setFormPin("");
    setFormRole(emp.role);
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!supabase || !formName.trim() || !formUsername.trim()) return;
    setSaving(true);

    if (modal === "add") {
      if (!formPin || formPin.length !== 6) {
        setSaving(false);
        return;
      }
      await supabase.from("employees").insert({
        name: formName.trim(),
        username: formUsername.trim(),
        pin: formPin,
        role: formRole,
      });
    } else if (modal === "edit" && editId) {
      const payload: Record<string, string> = {
        name: formName.trim(),
        username: formUsername.trim(),
        role: formRole,
      };
      if (formPin.length === 6) payload.pin = formPin;
      await supabase
        .from("employees")
        .update(payload)
        .eq("id", editId);
    }

    setSaving(false);
    closeModal();
    fetchEmployees();
  };

  const toggleActive = async (emp: Employee) => {
    if (!supabase) return;
    await supabase
      .from("employees")
      .update({ active: !emp.active })
      .eq("id", emp.id);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id ? { ...e, active: !e.active } : e,
      ),
    );
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Hapus karyawan ini?")) return;
    await supabase.from("employees").delete().eq("id", id);
    fetchEmployees();
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
        <h1 className="font-display text-display">Karyawan</h1>
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Users className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Belum ada karyawan</p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[1fr_1fr_80px_100px_80px_100px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase text-text-muted border-b border-border">
            <span>Nama</span>
            <span>Username</span>
            <span className="text-center">Role</span>
            <span className="text-center">Status</span>
            <span className="text-center">Aktif</span>
            <span className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-border">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-2 grid-rows-[auto_auto_auto] gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[1fr_1fr_80px_100px_80px_100px] md:grid-rows-1 md:items-center"
              >
                <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary text-sm font-medium">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {emp.name}
                  </span>
                </div>

                <span className="text-sm text-text-secondary font-mono">
                  {emp.username}
                </span>

                <span className="col-span-2 md:col-span-1 md:text-center">
                  <Badge variant={emp.role === "owner" ? "default" : "default"}>
                    {emp.role === "owner" ? "Owner" : "Karyawan"}
                  </Badge>
                </span>

                <span className="text-xs text-text-muted md:text-center">
                  ****** (PIN)
                </span>

                <div className="col-span-2 flex items-center justify-center md:col-span-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emp.active}
                    onClick={() => toggleActive(emp)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-fast",
                      emp.active ? "bg-primary" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-fast",
                        emp.active ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                  <button
                    type="button"
                    onClick={() => openEdit(emp)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-bg transition-colors duration-fast"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(emp)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-fast",
                      emp.active
                        ? "text-text-secondary hover:bg-warning-bg hover:text-warning"
                        : "text-text-secondary hover:bg-success-bg hover:text-success",
                    )}
                    title={emp.active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {emp.active ? (
                      <UserMinus className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors duration-fast"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title text-text-primary">
                {modal === "add" ? "Tambah Karyawan" : "Edit Karyawan"}
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
                placeholder="Nama lengkap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                label="Username"
                placeholder="Username login"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
              <Input
                label="PIN (6 digit)"
                type="password"
                maxLength={6}
                placeholder={modal === "edit" ? "Kosongkan jika tidak ingin mengubah" : "******"}
                value={formPin}
                onChange={(e) =>
                  setFormPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                error={
                  formPin.length > 0 && formPin.length !== 6
                    ? "PIN harus 6 digit"
                    : undefined
                }
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-text-secondary">
                  Role
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole("karyawan")}
                    className={cn(
                      "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                      formRole === "karyawan"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                    )}
                  >
                    Karyawan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole("owner")}
                    className={cn(
                      "flex h-11 items-center rounded-sm border px-4 text-sm transition-colors duration-fast",
                      formRole === "owner"
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border-strong bg-surface text-text-secondary hover:border-primary",
                    )}
                  >
                    Owner
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={closeModal}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={saving}
                  disabled={
                    !formName.trim() ||
                    !formUsername.trim() ||
                    (modal === "add" && formPin.length !== 6)
                  }
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
