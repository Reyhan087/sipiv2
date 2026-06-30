"use client";

import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export function PWABanners({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
      {children}
    </>
  );
}
