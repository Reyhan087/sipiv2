"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PinInput } from "@/components/ui/PinInput";
import { cn } from "@/lib/cn";

type AuthMode = "owner" | "karyawan";

interface Employee {
  id: string;
  name: string;
  username: string;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [pin, setPin] = useState("");
  const [pinReady, setPinReady] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("employees")
        .select("id, name, username")
        .eq("active", true);

      if (data) setEmployees(data);
    } catch {
      setEmployees([]);
    }
  }, [supabase]);

  useEffect(() => {
    if (mode === "karyawan") {
      setError("");
      fetchEmployees();
    }
  }, [mode, fetchEmployees]);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/pos");
    router.refresh();
  };

  const handleEmployeeLogin = async () => {
    if (!selectedEmployee || !pinReady) return;
    if (!supabase) {
      setError("Supabase belum dikonfigurasi");
      return;
    }

    setLoading(true);
    setError("");
    setPinError(false);

    const emp = employees.find((e) => e.id === selectedEmployee);
    if (!emp) {
      setError("Karyawan tidak ditemukan");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `${emp.username}@employee.sipi`,
      password: pin,
    });

    if (authError) {
      setError("PIN salah");
      setPinError(true);
      setLoading(false);
      return;
    }

    router.push("/pos");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="font-display text-display text-text-primary">SIPI</h1>
          <p className="mt-1 text-sm text-text-muted">
            Sistem Informasi POS &amp; Inventaris
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-md">
          <div className="mb-6 flex rounded-lg bg-bg p-1">
            <button
              type="button"
              onClick={() => {
                setMode("owner");
                setError("");
                setPinError(false);
              }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors duration-fast",
                mode === "owner"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              Masuk sebagai Owner
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("karyawan");
                setError("");
                setPinError(false);
              }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors duration-fast",
                mode === "karyawan"
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              Masuk sebagai Karyawan
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          {mode === "owner" ? (
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="owner@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Masuk
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Nama Karyawan
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    setPinError(false);
                  }}
                  className="h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-text-primary outline-none transition-shadow duration-fast focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
                >
                  <option value="">Pilih karyawan...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  PIN
                </label>
                <PinInput
                  length={6}
                  disabled={!selectedEmployee || loading}
                  error={pinError}
                  onComplete={(value) => {
                    setPin(value);
                    setPinReady(true);
                    setPinError(false);
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!selectedEmployee || !pinReady}
                className="w-full"
                onClick={handleEmployeeLogin}
              >
                Masuk
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
