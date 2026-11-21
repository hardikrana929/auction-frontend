import { formatShortAmount } from "../utils/formatAmount";

/**
 * Small hint shown right below a price field so big numbers are easy to read:
 * 10000 -> "10K", 100000 -> "1 Lac", 10000000 -> "1 Cr".
 * Renders nothing for empty / tiny values.
 */
export default function AmountHint({ value, className = "" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 1000) return null;
  return (
    <p
      aria-live="polite"
      className={`mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 ${className}`}
    >
      = {formatShortAmount(amount)}
      <span className="ml-1 font-medium text-slate-400 dark:text-slate-500">
        (₹{amount.toLocaleString("en-IN")})
      </span>
    </p>
  );
}
