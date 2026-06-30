"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";
import {
  ChevronUp,
  X,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type SheetState = "collapsed" | "half" | "full";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");

  useEffect(() => {
    setSheetState("collapsed");
  }, []);

  const cycleSheet = useCallback(() => {
    setSheetState((prev) => {
      if (prev === "collapsed") return "half";
      if (prev === "half") return "full";
      return "collapsed";
    });
  }, []);

  const collapseSheet = useCallback(() => {
    setSheetState("collapsed");
  }, []);

  const sheetHeight: Record<SheetState, string> = {
    collapsed: "72px",
    half: "55vh",
    full: "calc(100dvh - 60px)",
  };

  return (
    <>
      {/**** Desktop: flex child (rendered by AppLayout as sibling in flex row) ****/}

      {/**** Tablet: floating toggle button ****/}
      <button
        type="button"
        onClick={() => onClose()}
        className={cn(
          "hidden md:flex lg:hidden",
          "fixed bottom-4 right-4 z-30",
          "h-14 w-14 items-center justify-center",
          "rounded-full bg-primary text-white shadow-lg",
          "transition-transform duration-fast hover:scale-105 active:scale-95",
        )}
        aria-label="Buka keranjang"
      >
        <ShoppingCart className="h-6 w-6" />
      </button>

      {/**** Tablet: overlay panel ****/}
      {isOpen && (
        <>
          <div
            className="hidden md:block lg:hidden fixed inset-0 z-[35] bg-black/40"
            onClick={onClose}
          />
          <aside className="hidden md:flex lg:hidden fixed top-0 right-0 z-[40] h-full w-[320px] flex-col bg-surface border-l border-border shadow-lg">
            <PanelContent onClose={onClose} />
          </aside>
        </>
      )}

      {/**** Mobile: bottom sheet with 3 states ****/}
      <div className="md:hidden">
        {sheetState !== "collapsed" && (
          <div
            className="fixed inset-0 z-[19] bg-black/40"
            onClick={collapseSheet}
          />
        )}
        <div
          className={cn(
            "fixed inset-x-0 z-20 bg-surface shadow-sheet rounded-t-xl",
            "transition-all ease-sheet",
          )}
          style={{
            bottom: "60px",
            height: sheetHeight[sheetState],
            transitionDuration: "300ms",
            transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {sheetState === "collapsed" ? (
            <button
              type="button"
              onClick={cycleSheet}
              className="flex h-full w-full items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-text-primary">
                  0 item
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-price font-mono text-primary">Rp 0</span>
                <ChevronUp className="h-5 w-5 text-text-muted" />
              </div>
            </button>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 pt-2 pb-1">
                <button
                  type="button"
                  className="flex justify-center"
                  onClick={cycleSheet}
                >
                  <div className="h-1 w-10 rounded-full bg-border" />
                </button>
                <button
                  type="button"
                  onClick={collapseSheet}
                  className="absolute right-4 top-2"
                  style={{ position: "relative", marginLeft: "auto" }}
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <PanelContent />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PanelContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-title">Detail Order</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-primary-subtle transition-colors"
            aria-label="Tutup panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-text-muted">
            Pesanan kamu akan muncul di sini
          </p>
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
        <Button variant="primary" size="lg" disabled className="mt-4 w-full">
          Buat Pesanan
        </Button>
      </div>
    </div>
  );
}
