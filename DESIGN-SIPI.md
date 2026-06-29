# DESIGN-SIPI.md
## Design System — SIPI (Sistem Informasi POS dan Inventaris F&B)
**Version:** 1.0
**Stack:** Next.js 14 + Tailwind CSS + CSS Variables
**Target:** PWA — Mobile, Tablet, Desktop

---

## 1. Design Philosophy

SIPI dirancang untuk **kasir dan pemilik UMKM F&B** yang bekerja cepat, sering dengan tangan basah, dan butuh informasi seketika. Prinsip utama:

- **Speed over beauty** — tap target besar, info langsung kelihatan
- **Clean & calm** — warna tenang agar tidak lelah saat shift panjang
- **Context-aware** — layout menyesuaikan device tanpa kehilangan fungsi

---

## 2. Color Tokens

Gunakan CSS Variables agar konsisten di seluruh komponen.

```css
:root {
  /* Primary — Biru kepercayaan & aksi */
  --color-primary:        #2563EB; /* Blue-600 — CTA utama, active state */
  --color-primary-hover:  #1D4ED8; /* Blue-700 — hover */
  --color-primary-light:  #DBEAFE; /* Blue-100 — background chip, badge */
  --color-primary-subtle: #EFF6FF; /* Blue-50  — selected card bg */

  /* Neutral — Base UI */
  --color-bg:             #F8FAFC; /* Slate-50  — app background */
  --color-surface:        #FFFFFF; /* White     — card, sidebar, panel */
  --color-border:         #E2E8F0; /* Slate-200 — divider, border */
  --color-border-strong:  #CBD5E1; /* Slate-300 — input border */

  /* Text */
  --color-text-primary:   #0F172A; /* Slate-900 — heading, label utama */
  --color-text-secondary: #475569; /* Slate-600 — sublabel, caption */
  --color-text-muted:     #94A3B8; /* Slate-400 — placeholder, disabled */
  --color-text-inverse:   #FFFFFF; /* White     — teks di atas primary */

  /* Semantic */
  --color-success:        #16A34A; /* Green-600 — stok aman, lunas */
  --color-success-bg:     #DCFCE7; /* Green-100 */
  --color-warning:        #D97706; /* Amber-600 — stok menipis */
  --color-warning-bg:     #FEF3C7; /* Amber-100 */
  --color-danger:         #DC2626; /* Red-600   — stok habis, margin kritis, hapus */
  --color-danger-bg:      #FEE2E2; /* Red-100 */
  --color-info:           #0891B2; /* Cyan-600  — AI Insight, info */
  --color-info-bg:        #CFFAFE; /* Cyan-100 */

  /* Sidebar */
  --color-sidebar-bg:     #1E293B; /* Slate-800 — sidebar gelap */
  --color-sidebar-text:   #94A3B8; /* Slate-400 */
  --color-sidebar-active: #FFFFFF; /* White     — item aktif */
  --color-sidebar-active-bg: #2563EB; /* Primary — highlight item aktif */
  --color-sidebar-hover:  #334155; /* Slate-700 */
}
```

---

## 3. Typography

```css
/* Font stack */
--font-display: 'Plus Jakarta Sans', sans-serif;  /* heading, nav label */
--font-body:    'Inter', sans-serif;               /* body, label, input */
--font-mono:    'JetBrains Mono', monospace;       /* harga, angka, kode */
```

Import di `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
```

### Type Scale

| Token | Size | Weight | Font | Penggunaan |
|-------|------|--------|------|------------|
| `text-display` | 24px / 1.2 | 700 | Plus Jakarta Sans | Judul halaman |
| `text-title` | 18px / 1.3 | 600 | Plus Jakarta Sans | Judul section, card header |
| `text-body-lg` | 16px / 1.5 | 400 | Inter | Body utama |
| `text-body` | 14px / 1.5 | 400 | Inter | Label, deskripsi |
| `text-small` | 12px / 1.4 | 500 | Inter | Caption, badge, metadata |
| `text-price` | 16px / 1.2 | 500 | JetBrains Mono | Harga, total, angka |
| `text-price-lg` | 20px / 1.2 | 500 | JetBrains Mono | Total bayar, grand total |

---

## 4. Spacing & Sizing

```
Base unit: 4px

xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 32px
4xl: 40px
```

### Tap Target
- **Minimum:** 44×44px (semua elemen interaktif)
- **Recommended:** 48×48px untuk tombol aksi utama di mobile

---

## 5. Border Radius

```css
--radius-sm:   6px;   /* input, badge */
--radius-md:   10px;  /* card produk, dropdown */
--radius-lg:   14px;  /* panel, modal */
--radius-xl:   20px;  /* bottom sheet handle area */
--radius-full: 9999px; /* chip, pill badge, avatar */
```

---

## 6. Shadow

```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
--shadow-panel: 2px 0 8px 0 rgb(0 0 0 / 0.06);   /* sidebar shadow */
--shadow-sheet: 0 -4px 20px 0 rgb(0 0 0 / 0.10); /* bottom sheet shadow */
```

---

## 7. Layout System

### 7.1 Desktop (≥ 1024px) — 3 Panel

```
┌──────────┬──────────────────────────┬─────────────┐
│          │                          │             │
│  LEFT    │       MAIN CONTENT       │   RIGHT     │
│ SIDEBAR  │                          │   PANEL     │
│  240px   │         flex-1           │   320px     │
│  fixed   │       scrollable         │  (toggle)   │
│          │                          │             │
└──────────┴──────────────────────────┴─────────────┘
```

- Left sidebar: fixed, width `240px`, background `--color-sidebar-bg`
- Main content: `margin-left: 240px`, padding `24px`
- Right panel (hanya di `/pos`): fixed right, width `320px`, background `--color-surface`, `border-left: 1px solid --color-border`
- Right panel di halaman lain: tidak ada

### 7.2 Tablet (768px – 1023px) — Collapsed Sidebar

```
┌────┬─────────────────────────────────┐
│    │                                 │
│ 60 │         MAIN CONTENT            │
│ px │                                 │
│    │                                 │
└────┴─────────────────────────────────┘
```

- Left sidebar: collapsed, width `60px`, icon only, tooltip on hover
- Tap icon → expand overlay sidebar (`240px`) dengan backdrop semi-transparan
- Right panel `/pos`: slide in dari kanan sebagai overlay (`320px`)
- Tombol toggle right panel: floating button di kanan bawah dengan badge item count

### 7.3 Mobile (< 768px) — Bottom Nav + Bottom Sheet

```
┌─────────────────────────────┐
│  Header (56px)              │
├─────────────────────────────┤
│                             │
│       MAIN CONTENT          │
│                             │
│                             │
├─────────────────────────────┤
│  BOTTOM NAV (60px)          │
└─────────────────────────────┘
```

**Bottom Nav — 5 item:**
```
[🛒 POS] [📋 Pesanan] [📦 Inventaris] [📊 Laporan] [⋯ Lainnya]
```

Tap **Lainnya** → Bottom Sheet "More Menu" muncul berisi:
- Menu, Pelanggan, Analytics, Promo, QR Meja, Settings

**Mobile Header:**
- Height: `56px`
- Kiri: Logo SIPI kecil
- Tengah: Judul halaman aktif
- Kanan: action kontekstual (search, notif, dsb)

---

## 8. Navigation

### 8.1 Left Sidebar (Desktop & Tablet)

```
┌────────────────────────┐
│  🍽 SIPI               │  ← logo + nama app
│  v2.0                  │
├────────────────────────┤
│  [👤 Hanin — Owner]    │  ← user info
├────────────────────────┤
│  🛒  POS               │  ← item aktif (bg primary)
│  📋  Pesanan           │
│  📦  Inventaris        │
│  🍽  Menu              │
│  👥  Pelanggan         │
│  📊  Laporan           │
│  📈  Analytics         │
│  🎟  Promo             │
│  📱  QR Meja           │
├────────────────────────┤
│  ⚙️  Pengaturan        │  ← di bawah, selalu visible
│  🚪  Keluar            │
└────────────────────────┘
```

**Sidebar item states:**
- Default: text `--color-sidebar-text`, icon opacity 70%
- Hover: background `--color-sidebar-hover`
- Active: background `--color-sidebar-active-bg`, text & icon `--color-sidebar-active`

### 8.2 Bottom Nav (Mobile)

- Height: `60px` + safe area inset bottom
- Background: `--color-surface`
- Border top: `1px solid --color-border`
- Active item: icon & label warna `--color-primary`
- Badge count: merah, posisi top-right icon

---

## 9. Component Library

### 9.1 Button

```
Variant     | Background          | Text              | Border
------------|---------------------|-------------------|--------
primary     | --color-primary     | --color-text-inv  | none
secondary   | transparent         | --color-primary   | 1px primary
danger      | --color-danger      | white             | none
ghost       | transparent         | --color-text-sec  | none
disabled    | --color-border      | --color-text-muted| none
```

- Height: `40px` (md), `48px` (lg — aksi utama mobile)
- Padding: `12px 20px`
- Border radius: `--radius-md`
- Font: Inter 500 14px
- Loading state: spinner menggantikan label

### 9.2 Input & Form

```css
/* Base input */
height: 44px;
padding: 0 12px;
border: 1px solid var(--color-border-strong);
border-radius: var(--radius-sm);
font: 14px Inter;
color: var(--color-text-primary);
background: var(--color-surface);

/* Focus */
border-color: var(--color-primary);
box-shadow: 0 0 0 3px var(--color-primary-light);
outline: none;

/* Error */
border-color: var(--color-danger);
```

- Label: Inter 500 12px, `--color-text-secondary`, margin-bottom `6px`
- Helper text / error: 12px, posisi di bawah input
- Search input: tambah icon search di kiri (padding-left `36px`)

### 9.3 Card Produk (POS)

```
┌────────────────────┐
│   [Foto 1:1]       │  ← aspect ratio square, object-fit cover
│                    │
├────────────────────┤
│  Nama Produk       │  ← Inter 500 13px, truncate 2 baris
│  Rp 10.000         │  ← JetBrains Mono 500 14px, primary color
│  ~~Rp 30.000~~     │  ← strikethrough jika ada diskon, text-muted
│  [30% Off]         │  ← badge danger
└────────────────────┘
```

- Border radius: `--radius-md`
- Border: `1px solid --color-border`
- Shadow: `--shadow-sm`
- Selected state: border `2px solid --color-primary`, bg `--color-primary-subtle`
- Hover: shadow `--shadow-md`, transform `translateY(-1px)`
- Grid: 4 kolom (desktop) → 3 (tablet) → 2 (mobile)

### 9.4 Badge / Status Label

```
Aman      → bg --color-success-bg,   text --color-success
Menipis   → bg --color-warning-bg,   text --color-warning
Habis     → bg --color-danger-bg,    text --color-danger
Diskon    → bg --color-danger,       text white
Kritis    → bg --color-danger-bg,    text --color-danger  (margin kritis)
AI        → bg --color-info-bg,      text --color-info
```

- Padding: `2px 8px`
- Border radius: `--radius-full`
- Font: Inter 600 11px uppercase

### 9.5 Category Chip (Filter POS)

```
Default  → bg --color-surface,       border --color-border,    text --color-text-sec
Active   → bg --color-primary,       border none,              text white
```

- Height: `36px`
- Padding: `0 16px`
- Border radius: `--radius-full`
- Scroll horizontal di mobile (overflow-x auto, hide scrollbar)

### 9.6 Right Panel — Order Detail (Desktop/Tablet)

```
┌─────────────────────────┐
│ Detail Order            │  ← title
├─────────────────────────┤
│ Pelanggan               │
│ [dropdown pilih]        │
├─────────────────────────┤
│ Pesanan kamu:           │
│ ┌───────────────────┐   │
│ │ 🖼 Nama Item       │🗑 │
│ │    Rp 10.000       │   │
│ │  [−] 1 [+]  10rb  │   │
│ └───────────────────┘   │
│ (scrollable)            │
├─────────────────────────┤
│ Subtotal        Rp xx   │
│ Pajak (10%)     Rp xx   │
│ Admin Fee       Rp xx   │
│ ─────────────────────── │
│ Total           Rp xx   │
├─────────────────────────┤
│ Metode Bayar            │
│ [Tunai] [QRIS] [TF]     │
├─────────────────────────┤
│ [    Make Order   🚀]   │  ← btn primary full width lg
└─────────────────────────┘
```

### 9.7 Bottom Sheet — Order (Mobile /pos)

**3 states:**

| State | Height | Konten |
|-------|--------|--------|
| Collapsed | 72px | "🛒 2 item · Rp 20.000" + chevron up |
| Half-open | 55vh | List item keranjang + scroll |
| Full-open | 90vh | Full panel (sama dengan desktop right panel) |

- Background: `--color-surface`
- Border radius top: `--radius-xl`
- Shadow: `--shadow-sheet`
- Handle bar: `40px × 4px`, bg `--color-border`, margin auto, border-radius full
- Backdrop (half & full): `rgba(0,0,0,0.4)`, tap untuk collapse
- Animasi: `transform translateY`, `transition: 300ms cubic-bezier(0.32, 0.72, 0, 1)`

### 9.8 Modal

- Backdrop: `rgba(15, 23, 42, 0.5)` (slate-900 / 50%)
- Container: bg `--color-surface`, radius `--radius-lg`, shadow `--shadow-lg`
- Max-width: `480px` (sm), `640px` (md), `800px` (lg)
- Mobile: full screen dari bawah (treated as bottom sheet)
- Animasi masuk: fade + scale dari 96% → 100%

### 9.9 Toast / Notifikasi

- Posisi: top-right (desktop), top-center (mobile)
- Width: `320px`
- Border-left: `4px solid` sesuai tipe (success/warning/danger/info)
- Auto dismiss: 3 detik
- Contoh: "✅ Transaksi berhasil", "⚠️ Stok hampir habis"

---

## 10. Halaman Spesifik

### 10.1 /pos — Kasir

**Desktop layout:**
```
LEFT SIDEBAR (240px) | PRODUCT AREA (flex-1) | RIGHT ORDER PANEL (320px)
```

**Product area:**
- Header: "Sales Transaction" + tanggal + search bar
- Category chips: scroll horizontal
- Product grid: 4 kolom, infinite scroll atau pagination

**Tablet layout:**
- Collapsed sidebar (60px)
- Tombol 🛒 floating button kanan bawah dengan badge count → slide right panel

**Mobile layout:**
- Bottom nav
- Product grid: 2 kolom
- Bottom sheet order (3 states)

---

### 10.2 /orders — Pesanan

- List pesanan: card per pesanan dengan status badge
- Status tabs: Semua / Pending / Diproses / Selesai
- Mode Dapur: toggle switch di header, tampilan card lebih besar, font lebih besar

### 10.3 /inventory — Inventaris

- Table/list bahan baku dengan status badge
- Filter: Semua / Menipis / Habis
- Banner "Restock Cerdas" di bagian atas jika ada bahan baku kritis
- Modal riwayat harga: line chart sederhana (Recharts)

### 10.4 /menu — Menu & Resep

- Grid/list menu dengan HPP info
- Badge "Margin Kritis" merah jika HPP > 80%
- Rekomendasi harga jual tampil di bawah badge kritis
- Tab: "Daftar Menu" | "Menu & Resep"

### 10.5 /analytics — Business Intelligence

- Cards summary: total transaksi, pendapatan, pelanggan baru
- AI Insight card: bg `--color-info-bg`, border-left info, icon ✨
  - Teks AI dalam bahasa natural, font italic
- Charts: Recharts (LineChart, BarChart, PieChart)
- Color chart: gunakan `--color-primary`, `--color-success`, `--color-warning`

### 10.6 /login

- Layout: centered card, max-width `400px`
- Logo SIPI di atas
- Toggle: "Masuk sebagai Owner" / "Masuk sebagai Karyawan"
- Owner: email + password
- Karyawan: pilih nama dari list → input PIN (6 digit, besar-besar)
- PIN input: 6 kotak besar (style OTP input), tap-friendly

---

## 11. Responsive Breakpoints (Tailwind)

```js
// tailwind.config.js
screens: {
  'sm':  '480px',
  'md':  '768px',   // tablet — sidebar collapsed
  'lg':  '1024px',  // desktop — sidebar full
  'xl':  '1280px',
  '2xl': '1536px',
}
```

---

## 12. Animasi & Transisi

```css
/* Default transition */
--transition-fast:   150ms ease;
--transition-normal: 200ms ease;
--transition-slow:   300ms cubic-bezier(0.32, 0.72, 0, 1);

/* Penggunaan */
button, a, .card   → transition: all var(--transition-fast)
sidebar collapse   → transition: width var(--transition-normal)
bottom sheet       → transition: transform var(--transition-slow)
modal masuk        → transition: opacity, transform var(--transition-normal)
```

Respek `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; }
}
```

---

## 13. Ikon

Gunakan **Lucide React** (sudah tersedia di Next.js ecosystem).

```bash
npm install lucide-react
```

Ukuran standar:
- Sidebar icon: `20px`
- Inline icon: `16px`
- Action button icon: `18px`
- Empty state icon: `48px`, opacity 30%

---

## 14. PWA — Pertimbangan UI

- **Splash screen:** background `--color-primary`, logo SIPI putih centered
- **Status bar:** warna `--color-primary` (di `manifest.json`: `theme_color`)
- **Safe area:** gunakan `env(safe-area-inset-*)` untuk bottom nav & bottom sheet
- **Install prompt:** custom banner di bawah header (bisa dismiss), muncul setelah 3x kunjungan
- **Offline state:** banner tipis di atas ("Tidak ada koneksi — data mungkin belum terbaru")

---

## 15. Aksesibilitas

- Semua warna memenuhi **WCAG AA** (contrast ratio ≥ 4.5:1 untuk teks)
- Focus ring: `box-shadow: 0 0 0 3px var(--color-primary-light)` pada semua elemen interaktif
- ARIA labels pada icon-only button
- Skip to main content link (visually hidden, muncul saat Tab pertama)

---

## 16. File Structure (Design-related)

```
src/
├── app/
│   └── globals.css          ← CSS variables, base styles
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       ← Left sidebar (desktop & tablet)
│   │   ├── BottomNav.tsx     ← Mobile bottom navigation
│   │   ├── Header.tsx        ← Mobile header
│   │   └── RightPanel.tsx    ← Order panel /pos
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   └── Toast.tsx
│   └── pos/
│       ├── ProductCard.tsx
│       ├── CategoryChips.tsx
│       └── OrderItem.tsx
└── lib/
    └── cn.ts                 ← clsx + tailwind-merge utility
```

---

## 17. Quick Reference untuk OpenCode

Saat generate komponen, selalu:
1. Gunakan CSS variables (`var(--color-*)`) bukan hardcode hex
2. Tailwind untuk spacing & layout, CSS variables untuk warna & shadow
3. Mobile-first: default style untuk mobile, `md:` untuk tablet, `lg:` untuk desktop
4. Semua tap target minimal `44px`
5. Gunakan `cn()` utility untuk conditional classes
6. Import icon dari `lucide-react`
7. Font harga/angka selalu `font-mono` (JetBrains Mono)
