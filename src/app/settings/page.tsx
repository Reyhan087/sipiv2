"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  Store,
  CreditCard,
  Users,
  Printer,
  ChevronRight,
} from "lucide-react";

const settingsItems = [
  {
    label: "Toko",
    description: "Nama toko, logo, kontak, WhatsApp, PPN",
    href: "/settings/store",
    icon: Store,
  },
  {
    label: "Admin Fee",
    description: "Biaya admin per transaksi",
    href: "/settings/admin-fee",
    icon: CreditCard,
  },
  {
    label: "Karyawan",
    description: "Kelola akun karyawan dan akses",
    href: "/settings/employees",
    icon: Users,
  },
  {
    label: "Printer",
    description: "Koneksi printer struk thermal",
    href: "/settings/printer",
    icon: Printer,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-display">Pengaturan</h1>

      <div className="rounded-md border border-border bg-surface overflow-hidden divide-y divide-border">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 transition-colors duration-fast hover:bg-bg",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text-primary">
                  {item.label}
                </span>
                <span className="block text-xs text-text-muted">
                  {item.description}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
