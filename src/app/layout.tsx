import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { PWABanners } from "@/components/layout/PWABanners";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SIPI — POS & Inventaris F&B",
  description: "Sistem Informasi POS dan Inventaris untuk UMKM Food & Beverage",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIPI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-body antialiased">
        <PWABanners>
          <AppLayout>{children}</AppLayout>
        </PWABanners>
      </body>
    </html>
  );
}
