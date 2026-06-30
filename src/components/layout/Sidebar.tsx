"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { UtensilsCrossed } from "lucide-react";
import {
  sidebarNavItems,
  sidebarBottomItems,
  isActive,
  type NavItem,
} from "@/lib/navigation";

interface SidebarProps {
  collapsed: boolean;
  onNavigate: () => void;
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className={cn(
        "flex items-center px-4 py-5",
        collapsed ? "justify-center" : "gap-2",
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-white">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display text-base font-bold leading-tight text-white">SIPI</span>
            <span className="text-[11px] leading-tight text-sidebar-text">v2.0</span>
          </div>
        )}
      </div>

      <div className={cn(
        "border-t border-white/10 px-4 py-3",
        collapsed && "px-0 flex justify-center",
      )}>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-hover text-sm font-medium text-white">
            H
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-tight text-sidebar-active">Hanin</p>
              <p className="text-xs leading-tight text-sidebar-text">Owner</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {sidebarNavItems.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-2 py-2">
        <ul className="space-y-1">
          {sidebarBottomItems.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SidebarNavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg py-2.5 text-sm transition-colors duration-fast",
          collapsed ? "justify-center px-0 w-12 mx-auto" : "px-3",
          active
            ? "bg-sidebar-active-bg text-sidebar-active"
            : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-active",
        )}
      >
        <Icon
          className="h-5 w-5 shrink-0"
          style={{ opacity: active ? 1 : 0.7 }}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </li>
  );
}
