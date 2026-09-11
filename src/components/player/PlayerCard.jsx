import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import PlayerStatusBadge from "./PlayerStatusBadge";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function PlayerCard({
  player,
  onView,
  onEdit,
  onStatus,
  onDelete,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {player.photo?.url ? (
          <img
            src={player.photo.url}
            alt={player.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-black text-slate-300 dark:text-slate-600">
            {player.fullName?.slice(0, 1).toUpperCase() || "P"}
          </div>
        )}
        <div className="absolute right-3 top-3">
          <PlayerStatusBadge status={player.status} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">
          {player.fullName} {player.lastName}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {player.role} · {player.gender}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="Base price" value={money(player.basePrice)} />
          <Metric label="Current bid" value={money(player.currentBid)} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button className="icon-btn" title="View" onClick={() => onView(player)}><FiEye /></button>
          <button className="icon-btn" title="Edit" onClick={() => onEdit(player)}><FiEdit2 /></button>
          <button className="icon-btn" title="Status" onClick={() => onStatus(player)}><FiPower /></button>
          <button
            className="icon-btn text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            title="Delete"
            onClick={() => onDelete(player)}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
