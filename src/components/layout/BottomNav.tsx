"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { MoreHorizontal } from "lucide-react";
import {
  bottomNavItems,
  moreSheetItems,
  isActive,
} from "@/lib/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleMoreClick = (href: string) => {
    setMoreOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav className="flex shrink-0 items-center justify-around border-t border-border bg-surface px-2 md:hidden" style={{ height: "60px", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 h-full min-w-0",
                active ? "text-primary" : "text-text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 h-full min-w-0 text-text-muted"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">Lainnya</span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-[29] bg-black/40 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-0 z-[31] rounded-t-xl bg-surface shadow-sheet p-4 md:hidden" style={{ bottom: "60px" }}>
            <div className="mb-4 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreSheetItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleMoreClick(item.href)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg p-3 transition-colors duration-fast",
                      active
                        ? "bg-primary-subtle"
                        : "hover:bg-primary-subtle active:bg-primary-light",
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      active ? "bg-primary text-white" : "bg-primary-light text-primary",
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
