import { FiUsers } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import TeamAvatar from "./TeamAvatar";
import { formatCurrency } from "../../utils/formatCurrency";
import { toImageUrl } from "../../utils/imageUrl";

/** The logged-in owner's team (chosen automatically) with purse and squad. */
const MyTeamCard = ({ team, maxPlayers = 0, otherTeamsCount = 0 }) => {
  if (!team) {
    return null;
  }

  const id = String(team._id || team.id || "");
  const total = Number(team.totalBudget ?? 0);
  const hasPurse = team.remainingBudget !== undefined && team.remainingBudget !== null;
  const remaining = hasPurse ? Number(team.remainingBudget) : null;
  const spent = hasPurse && total > 0 ? Math.max(0, total - remaining) : 0;
  const spentPercent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const squad = Array.isArray(team.players) ? team.players.length : null;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        My team
      </p>

      <div className="mt-3 flex items-center gap-3">
        <TeamAvatar name={team.name} logo={toImageUrl(team.logo)} size="lg" />

        <div className="min-w-0">
          <p className="truncate text-xl font-black text-white">{team.name}</p>

          <p className="break-all font-mono text-[11px] text-slate-400">
            Team ID: {id}
          </p>
        </div>
      </div>

      {hasPurse && (
        <div className="mt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <RupeeIcon className="h-3 w-3" />
                Purse left
              </p>

              <p className="text-2xl font-black text-emerald-300">
                {formatCurrency(remaining)}
              </p>
            </div>

            {total > 0 && (
              <p className="text-xs text-slate-500">
                of {formatCurrency(total)}
              </p>
            )}
          </div>

          {total > 0 && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                style={{ width: `${spentPercent}%` }}
              />
            </div>
          )}
        </div>
      )}

      {squad !== null && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-slate-400">
            <FiUsers />
            Squad
          </span>

          <span className="text-sm font-black text-white">
            {squad}
            {maxPlayers > 0 ? ` / ${maxPlayers}` : ""} players
          </span>
        </div>
      )}

      {otherTeamsCount > 0 && (
        <p className="mt-3 text-[11px] text-slate-500">
          This account has {otherTeamsCount} more approved team
          {otherTeamsCount > 1 ? "s" : ""} in this auction. Bids are placed for
          the team shown here.
        </p>
      )}
    </section>
  );
};

export default MyTeamCard;
