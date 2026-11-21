/**
 * Short, easy-to-read prices (Indian numbering).
 *
 *   10000     -> "10K"
 *   100000    -> "1 Lac"
 *   10000000  -> "1 Cr"
 *
 * Keep in sync with auction-backend/utils/amount.js.
 */
const trim = (value) => String(Number(value.toFixed(2)));

export function formatShortAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  if (amount >= 10000000) return `${trim(amount / 10000000)} Cr`;
  if (amount >= 100000) return `${trim(amount / 100000)} Lac`;
  if (amount >= 1000) return `${trim(amount / 1000)}K`;
  return String(amount);
}

/** "₹1,00,000 (1 Lac)" - full amount plus the short form when there is one. */
export function formatRupeesWithShort(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  const full = `₹${amount.toLocaleString("en-IN")}`;
  const short = formatShortAmount(amount);
  return short && amount >= 1000 ? `${full} (${short})` : full;
}

export default formatShortAmount;
