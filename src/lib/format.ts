export function formatRupiah(amount: number): string {
  if (amount == null || isNaN(amount)) return "Rp 0";
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}
