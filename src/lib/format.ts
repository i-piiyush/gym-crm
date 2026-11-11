/**
 * Generic formatting helpers for currency, phone, and metrics.
 */

export function formatCurrencyINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "—";
  if (phone.startsWith("+91") && phone.length === 13) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

