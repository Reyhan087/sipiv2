# Product Requirements Document (PRD)
## SIPI — Sistem Informasi POS dan Inventaris F&B
**Version:** 2.0 (Final)
**Stack:** Next.js 14 (App Router) — PWA
**Design System:** lihat `DESIGN-starbucks.md`
**Target Device:** Semua device (smartphone, tablet, desktop) — responsive PWA

---

## 1. Overview

SIPI adalah Progressive Web App (PWA) untuk UMKM Food & Beverage yang menggabungkan Point of Sale (POS) dengan manajemen inventaris stok secara real-time.

**Dua masalah utama yang dipecahkan:**
1. Ketidaksinkronan pencatatan manual antara laju penjualan dan sisa stok dapur
2. "Kebocoran margin" akibat fluktuasi harga bahan baku, diatasi dengan kalkulasi HPP harian otomatis

---

## 2. Goals

| # | Tujuan | Indikator Keberhasilan |
|---|--------|------------------------|
| G-1 | Eliminasi kesalahan pencatatan inventaris manual | 0% selisih antara stok sistem dan fisik |
| G-2 | HPP otomatis real-time berbasis harga pasar terkini | 100% menu memiliki nilai HPP terhitung |
| G-3 | Riwayat harga bahan baku untuk keputusan pembelian | 80% bahan baku utama memiliki entri harga mingguan |

---

## 3. User & Akses

> **Catatan:** Dalam konteks UMKM F&B skala kecil, satu orang (Pemilik) umumnya merangkap semua peran. Istilah *Kasir*, *Admin Gudang*, dan *Pemilik* adalah **label fungsional**, bukan entitas terpisah.
>
> MVP menggunakan **1 akun utama (Owner)** dengan akses penuh. Fitur Karyawan memungkinkan penambahan akun staff dengan akses terbatas.

| Role | Akses |
|------|-------|
| **Owner** | Full access semua fitur |
| **Karyawan** | Kasir, Pesanan, Laporan Penjualan (terbatas) |

---

## 4. Fitur & Halaman

### 4.1 Kasir
**Route:** `/pos`

Fitur inti proses transaksi penjualan secara digital.

**Functional Requirements:**
- Tampilkan daftar produk/menu dalam grid (foto, nama, harga)
- Tap menu → tambah ke keranjang
- Kelola quantity di keranjang (tambah, kurang, hapus item)
- Terapkan voucher/promo/diskon global
- Pilih pelanggan dari daftar (opsional)
- Hitung total tagihan + pajak PPN + admin fee otomatis
- Pilih metode pembayaran (Tunai, QRIS, Transfer)
- Hitung kembalian otomatis jika bayar tunai
- Selesaikan transaksi → cetak struk fisik via printer
- Setiap transaksi selesai → stok bahan baku otomatis berkurang sesuai resep

---

### 4.2 Pesanan
**Route:** `/orders`

Fitur untuk mengelola pesanan yang masuk.

**Functional Requirements:**
- Lihat daftar pesanan aktif (status: Pending, Diproses, Selesai)
- Lihat detail pesanan (item, total, waktu, pelanggan)
- Edit pesanan yang belum selesai (tambah/hapus item)
- Proses pembayaran pesanan
- Mode Dapur: tampilan khusus untuk staff dapur (diaktifkan dari pengaturan Toko)

---

### 4.3 Laporan Penjualan
**Route:** `/reports`

Mencatat dan menampilkan semua transaksi yang terjadi.

**Functional Requirements:**
- Tampilkan total transaksi dan pendapatan: harian, mingguan, bulanan
- Filter berdasarkan rentang tanggal
- Rincian per transaksi (waktu, item, total, metode bayar)
- Export laporan ke PDF (harian/mingguan/bulanan)

---

### 4.4 Menu
**Route:** `/menu`

Kelola daftar menu yang tersedia di POS.

**Functional Requirements:**
- Tampilkan semua menu (kategori, nama, harga, foto, status aktif/nonaktif)
- Tambah menu baru (nama, kategori, harga, foto, discount, variasi)
- Edit menu (kategori, nama, harga, discount, foto)
- Hapus menu
- Kelola variasi menu (contoh: ukuran S/M/L, topping, level manis)
- Toggle aktif/nonaktif — menu nonaktif tidak muncul di POS
- Tampilkan nilai HPP per menu
- Tampilkan label **"Margin Kritis"** jika HPP > 80% harga jual `[FR-10]`
- Tampilkan rekomendasi harga jual baru otomatis pada menu margin kritis, target HPP ideal 50%, dibulatkan ke Rp1.000 terdekat `[FR-10a]`
- Tab **"Menu & Resep"**: kelola komposisi bahan baku (nama & takaran) per menu `[FR-08b]`

---

### 4.5 Inventaris / Gudang
**Route:** `/inventory`

Manajemen stok bahan baku.

**Functional Requirements:**
- Tampilkan daftar semua bahan baku (nama, satuan, stok saat ini, stok minimal)
- Status stok: **Aman** (hijau) / **Menipis** (kuning) / **Habis** — label merah jika stok ≤ batas minimal `[FR-07]`
- Tambah stok (restock): input kuantitas barang masuk `[FR-06]`
- Catat harga beli harian terbaru + tanggal ke riwayat harga pasar per bahan baku `[FR-08]`
- Modal riwayat harga: tampilkan linimasa perubahan harga secara visual `[FR-08a]`
- **Restock Cerdas**: tampilkan daftar rekomendasi restock otomatis untuk bahan baku dengan `stock_qty / avg_consumption_7d < 2` (sisa < 2 hari), diurutkan dari paling mendesak `[FR-15]`

---

### 4.6 HPP & Harga
**Route:** terintegrasi di `/menu` dan `/inventory`

**Functional Requirements:**
- Hitung ulang HPP otomatis setiap kali ada perubahan harga bahan baku `[FR-09]`
- HPP = Σ (harga_bahan_baku_terkini × takaran_dalam_resep)
- Tampilkan label **"Margin Kritis"** jika HPP > 80% harga jual `[FR-10]`
- Rekomendasi harga jual: target HPP ideal 50%, dibulatkan ke Rp1.000 terdekat `[FR-10a]`

---

### 4.7 Toko
**Route:** `/settings/store`

Pengaturan profil dan informasi toko.

**Functional Requirements:**
- Edit nama toko, logo, informasi kontak
- Pesan custom WhatsApp (untuk struk via WhatsApp)
- Lokasi Google Maps (link/embed)
- Mode Dapur: aktifkan/nonaktifkan tampilan khusus dapur di halaman Pesanan
- Pengaturan pajak (PPN): persentase, aktif/nonaktif
- Hapus akun

---

### 4.8 Admin Fee
**Route:** `/settings/admin-fee`

Biaya admin per transaksi yang dibebankan ke pelanggan.

**Functional Requirements:**
- Atur nominal atau persentase admin fee
- Aktifkan/nonaktifkan admin fee
- Admin fee tampil di struk dan kalkulasi total transaksi di POS

---

### 4.9 Karyawan
**Route:** `/settings/employees`

Manajemen akun karyawan.

**Functional Requirements:**
- Tampilkan daftar karyawan aktif
- Tambah akun karyawan (nama, username, PIN, role)
- Edit data karyawan
- Nonaktifkan/hapus akun karyawan
- Karyawan login dengan PIN, akses terbatas sesuai role

---

### 4.10 Pelanggan
**Route:** `/customers`

Simpan dan kelola data pelanggan.

**Functional Requirements:**
- Tampilkan daftar pelanggan (nama, nomor WhatsApp)
- Riwayat transaksi per pelanggan
- Tambah/edit/hapus data pelanggan
- Pilih pelanggan saat proses transaksi di POS
- Data pelanggan digunakan untuk BI (repeat vs new customer, CLV)

---

### 4.11 Business Intelligence + AI Insight
**Route:** `/analytics`

Dashboard analisis bisnis secara visual, dilengkapi interpretasi AI.

**Functional Requirements:**
- Top menu & kategori terlaris
- Jam / jenis order tersibuk
- Growth penjualan bulanan (grafik)
- Repeat vs new customer
- Customer Lifetime Value (CLV)
- Export laporan ke PDF (harian/mingguan/bulanan)
- **AI Insight**: ringkasan otomatis kondisi bisnis dalam bahasa natural menggunakan Gemini API (contoh: *"Penjualan turun 20% minggu ini, produk X paling berkontribusi pada penurunan"*)

---

### 4.12 Promo
**Route:** `/promo`

Manajemen voucher dan diskon.

**Functional Requirements:**
- Buat/edit/hapus voucher diskon (kode unik, nominal/persentase, masa berlaku)
- Aktifkan diskon global: diskon diterapkan ke semua item di keranjang sekaligus
- Promo dapat dipilih/diinput saat transaksi di POS

---

### 4.13 QR Meja
**Route:** `/qr-tables`

Generate dan export QR code per meja. *(Self-order page → v2)*

**Functional Requirements (v1):**
- Input jumlah meja dan label meja (Meja 1, Meja 2, dst.)
- Generate QR code unik per meja
- Export QR ke gambar (PNG) atau PDF untuk dicetak

**Out of scope v1:**
- Halaman self-order publik untuk pelanggan (`/order/[tableId]`) → v2

---

### 4.14 Printer
**Route:** `/settings/printer`

Integrasi dengan printer struk thermal.

**Functional Requirements:**
- Koneksi ke printer thermal (Bluetooth atau WiFi)
- Cetak struk otomatis setelah transaksi selesai
- Preview struk sebelum cetak
- Pengaturan format struk (lebar kertas, info yang tampil)

---

## 5. Page Map

```
/                            → redirect ke /pos
/login                       → login (owner & karyawan)

/pos                         → [4.1]  Kasir — POS transaksi
/orders                      → [4.2]  Pesanan
/reports                     → [4.3]  Laporan Penjualan
/menu                        → [4.4]  Menu & Resep
/inventory                   → [4.5]  Inventaris / Gudang
/inventory/[id]              → Detail bahan baku + riwayat harga
/customers                   → [4.10] Pelanggan
/analytics                   → [4.11] Business Intelligence + AI Insight
/promo                       → [4.12] Promo & Voucher
/qr-tables                   → [4.13] QR Meja (generate only, v1)

/settings                    → Pengaturan (index)
/settings/store              → [4.7]  Toko
/settings/admin-fee          → [4.8]  Admin Fee
/settings/employees          → [4.9]  Karyawan
/settings/printer            → [4.14] Printer
```

---

## 6. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| State | Zustand (cart, session) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (PIN-based) |
| PWA | next-pwa |
| Charts | Recharts |
| PDF | react-pdf atau browser print |
| AI | Google Gemini API |
| QR Generator | qrcode.react |
| Printer | WebBluetooth / WebUSB API |

> Semua keputusan visual mengacu ke `DESIGN-starbucks.md`.

---

## 7. Out of Scope (v1)

- Self-order page pelanggan via QR Meja (`/order/[tableId]`) → v2
- Multi-cabang
- Integrasi marketplace (GoFood, GrabFood)
- Akuntansi lengkap (jurnal, neraca)

---

## 8. Catatan Implementasi

- **AI Insight** menggunakan Gemini API — butuh API key, simpan di `.env.local`
- **Struk** hanya fisik via printer thermal, tidak ada struk digital/WhatsApp
- **Export PDF** format bebas, gunakan `react-pdf` atau browser print
