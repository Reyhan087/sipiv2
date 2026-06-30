"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getPageTitle } from "@/lib/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CartPanel } from "@/components/pos/CartPanel";
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
          <CartPanel />
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
