"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const VISIT_KEY = "sipi_visit_count";
const DISMISSED_KEY = "sipi_install_dismissed";
const MIN_VISITS = 3;

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed === "true") return;

    const count = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(count));

    if (count < MIN_VISITS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-[68px] inset-x-0 z-[60] px-4 md:bottom-4 md:left-auto md:right-4 md:top-auto md:bottom-4 md:inset-auto md:w-80">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface shadow-lg p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">
            Install SIPI
          </p>
          <p className="text-xs text-text-muted">
            Akses cepat langsung dari home screen
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="flex h-9 shrink-0 items-center rounded-md bg-primary px-3 text-xs font-medium text-white transition-colors duration-fast hover:bg-primary-hover"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-bg transition-colors duration-fast"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
