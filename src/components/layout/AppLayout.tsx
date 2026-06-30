"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getPageTitle } from "@/lib/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { RightPanel } from "@/components/layout/RightPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const isLogin = pathname === "/login";
  const isPosPage = pathname === "/pos";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen((p) => !p), []);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/**** Sidebar — hidden on mobile, collapsed on tablet, full on desktop ****/}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:shrink-0 transition-all duration-normal bg-sidebar-bg shadow-panel",
          !sidebarOpen && "md:w-[60px]",
          "lg:w-[240px] lg:relative lg:z-30",
          sidebarOpen && "md:fixed md:inset-y-0 md:left-0 md:w-[240px] md:z-40",
          sidebarOpen && "lg:relative lg:z-30",
        )}
      >
        <Sidebar
          collapsed={!sidebarOpen}
          onNavigate={closeSidebar}
        />
      </aside>

      {/**** Backdrop for tablet sidebar overlay ****/}
      {sidebarOpen && (
        <div
          className="hidden md:block lg:hidden fixed inset-0 z-[35] bg-black/40"
          onClick={closeSidebar}
        />
      )}

      {/**** Main column: header + content + bottom nav ****/}
      <div className="flex flex-1 flex-col min-w-0">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
        <BottomNav />
      </div>

      {/**** Desktop right panel — flex child, always visible on /pos ****/}
      {isPosPage && (
        <aside className="hidden lg:flex lg:flex-col lg:shrink-0 w-[320px] bg-surface border-l border-border z-20">
          <DesktopPanelContent />
        </aside>
      )}

      {/**** Tablet overlay + floating toggle + Mobile bottom sheet ****/}
      {isPosPage && (
        <RightPanel
          isOpen={rightPanelOpen}
          onClose={toggleRightPanel}
        />
      )}
    </div>
  );
}

function DesktopPanelContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-title">Detail Order</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">Pesanan kamu akan muncul di sini</p>
        </div>
      </div>
      <div className="border-t border-border p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span className="font-mono">Rp 0</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Pajak</span>
            <span className="font-mono">Rp 0</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Admin Fee</span>
            <span className="font-mono">Rp 0</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold text-text-primary">
            <span>Total</span>
            <span className="font-mono text-price-lg">Rp 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
