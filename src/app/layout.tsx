import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPI — POS & Inventaris F&B",
  description: "Sistem Informasi POS dan Inventaris untuk UMKM Food & Beverage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
