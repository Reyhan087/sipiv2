"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { ChevronUp, ShoppingCart } from "lucide-react";
import { useCartStore, getSubtotal } from "@/lib/store/cart";
import { formatRupiah } from "@/lib/format";
import { CartPanel } from "@/components/pos/CartPanel";

type SheetState = "collapsed" | "half" | "full";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");

  const itemCount = useCartStore((s) => s.items.length);
  const subtotal = useCartStore((s) => getSubtotal(s.items));

  useEffect(() => {
    if (itemCount === 0) {
      setSheetState("collapsed");
    }
  }, [itemCount]);

  const cycleSheet = useCallback(() => {
    setSheetState((prev) => {
      if (prev === "collapsed") return "half";
      if (prev === "half") return "full";
      return "collapsed";
    });
  }, []);

  const collapseSheet = useCallback(() => setSheetState("collapsed"), []);

  const sheetHeight: Record<SheetState, string> = {
    collapsed: "72px",
    half: "55vh",
    full: "calc(100dvh - 60px)",
  };

  return (
    <>
      {/**** Tablet floating toggle button ****/}
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

      {/**** Tablet overlay panel ****/}
      {isOpen && (
        <>
          <div
            className="hidden md:block lg:hidden fixed inset-0 z-[35] bg-black/40"
            onClick={onClose}
          />
          <aside className="hidden md:flex lg:hidden fixed top-0 right-0 z-[40] h-full w-[320px] flex-col bg-surface border-l border-border shadow-lg">
            <CartPanel onClose={onClose} />
          </aside>
        </>
      )}

      {/**** Mobile bottom sheet with 3 states ****/}
      <div className="md:hidden">
        {sheetState !== "collapsed" && (
          <div
            className="fixed inset-0 z-[19] bg-black/40"
            onClick={collapseSheet}
          />
        )}
        {itemCount > 0 && (
          <div
            className={cn("fixed inset-x-0 z-20 bg-surface shadow-sheet rounded-t-xl")}
            style={{
              bottom: "60px",
              height: sheetHeight[sheetState],
              transitionProperty: "height",
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
                    {itemCount} item
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-primary">
                    {formatRupiah(subtotal)}
                  </span>
                  <ChevronUp className="h-5 w-5 text-text-muted" />
                </div>
              </button>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex justify-center px-4 pt-2 pb-1">
                  <button
                    type="button"
                    onClick={cycleSheet}
                    className="flex w-full justify-center"
                  >
                    <div className="h-1 w-10 rounded-full bg-border" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <CartPanel />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
