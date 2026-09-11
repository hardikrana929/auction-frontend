const statusClass = {
  available: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  auctioning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sold: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  unsold: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export default function PlayerStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
        statusClass[status] || statusClass.unsold
      }`}
    >
      {status || "unknown"}
    </span>
  );
}
