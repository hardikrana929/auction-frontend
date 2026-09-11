import { FiEdit2, FiEye, FiPower, FiTrash2, FiUsers } from "react-icons/fi";
import TeamStatusBadge from "./TeamStatusBadge";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function TeamCard({
  team,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          {team.logo?.url ? (
            <img
              src={team.logo.url}
              alt={`${team.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-black text-slate-400">
              {team.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              {team.name}
            </h3>
            <TeamStatusBadge status={team.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Owner: {team.ownerName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Budget</p>
          <p className="mt-1 font-bold text-slate-900 dark:text-white">
            {money(team.totalBudget)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
          <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
          <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
            {money(team.remainingBudget)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="mr-auto flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <FiUsers />
          {Array.isArray(team.players) ? team.players.length : 0} players
        </div>
        <button className="icon-btn" title="View" onClick={() => onView(team)}>
          <FiEye />
        </button>
        <button className="icon-btn" title="Edit" onClick={() => onEdit(team)}>
          <FiEdit2 />
        </button>
        <button className="icon-btn" title="Change status" onClick={() => onToggleStatus(team)}>
          <FiPower />
        </button>
        <button
          className="icon-btn text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          title="Delete"
          onClick={() => onDelete(team)}
        >
          <FiTrash2 />
        </button>
      </div>
    </article>
  );
}
