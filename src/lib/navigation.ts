import {
  ShoppingCart,
  ClipboardList,
  Package,
  UtensilsCrossed,
  Users,
  BarChart3,
  TrendingUp,
  Ticket,
  Smartphone,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarNavItems: NavItem[] = [
  { label: "POS", href: "/pos", icon: ShoppingCart },
  { label: "Pesanan", href: "/orders", icon: ClipboardList },
  { label: "Inventaris", href: "/inventory", icon: Package },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Pelanggan", href: "/customers", icon: Users },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Promo", href: "/promo", icon: Ticket },
  { label: "QR Meja", href: "/qr-tables", icon: Smartphone },
];

export const sidebarBottomItems: NavItem[] = [
  { label: "Pengaturan", href: "/settings", icon: Settings },
  { label: "Keluar", href: "#logout", icon: LogOut },
];

export const bottomNavItems: NavItem[] = [
  { label: "POS", href: "/pos", icon: ShoppingCart },
  { label: "Pesanan", href: "/orders", icon: ClipboardList },
  { label: "Inventaris", href: "/inventory", icon: Package },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
];

export const moreSheetItems: NavItem[] = [
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Pelanggan", href: "/customers", icon: Users },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Promo", href: "/promo", icon: Ticket },
  { label: "QR Meja", href: "/qr-tables", icon: Smartphone },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

const pageTitleMap: Record<string, string> = {
  "/pos": "POS",
  "/orders": "Pesanan",
  "/reports": "Laporan",
  "/menu": "Menu",
  "/inventory": "Inventaris",
  "/customers": "Pelanggan",
  "/analytics": "Analytics",
  "/promo": "Promo",
  "/qr-tables": "QR Meja",
  "/settings": "Pengaturan",
  "/settings/store": "Toko",
  "/settings/admin-fee": "Admin Fee",
  "/settings/employees": "Karyawan",
  "/settings/printer": "Printer",
};

export function getPageTitle(pathname: string): string {
  if (pageTitleMap[pathname]) return pageTitleMap[pathname];
  for (const [path, title] of Object.entries(pageTitleMap)) {
    if (path !== "/" && pathname.startsWith(path)) return title;
  }
  return "SIPI";
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/pos") return pathname === "/pos";
  return pathname.startsWith(href);
}
