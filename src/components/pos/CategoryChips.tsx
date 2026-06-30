"use client";

import { cn } from "@/lib/cn";

interface CategoryChipsProps {
  categories: Array<{ id: string; name: string }>;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
          !selected
            ? "bg-primary border-transparent text-white"
            : "bg-surface border-border text-text-secondary hover:border-primary",
        )}
      >
        Semua
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={cn(
            "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-fast border",
            selected === c.id
              ? "bg-primary border-transparent text-white"
              : "bg-surface border-border text-text-secondary hover:border-primary",
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
