"use client";

import { UtensilsCrossed } from "lucide-react";

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
        <UtensilsCrossed className="h-4 w-4" />
      </div>
      <h1 className="flex-1 text-center text-sm font-semibold font-display text-text-primary">
        {title}
      </h1>
      <div className="flex w-8 items-center justify-end">
        {actions}
      </div>
    </header>
  );
}
