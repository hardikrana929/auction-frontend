import { FiAward, FiTrendingUp } from "react-icons/fi";

import TeamAvatar from "./TeamAvatar";
import { formatCurrency } from "../../utils/formatCurrency";

/**
 * Big "scoreboard" showing the current bid and which team leads.
 * `team` is { id, name, logo } (see utils/teamInfo.resolveTeam).
 */
const CurrentBidCard = ({
  currentBid = 0,
  nextBid = 0,
  basePrice = 0,
  team = null,
  isMine = false,
  active = false,
}) => {
  const hasLeader = Boolean(team && (team.id || team.name));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 p-5 shadow-xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            <FiTrendingUp />
            Current bid
            {active && (
              <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-red-500" />
            )}
          </p>

          <p className="mt-2 text-5xl font-black tabular-nums tracking-tight text-white sm:text-6xl">
            {formatCurrency(currentBid || basePrice)}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Next bid{" "}
            <span className="font-bold text-amber-300">
              {formatCurrency(nextBid)}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4 lg:min-w-[300px]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Leading team
            </p>

            {isMine && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-black uppercase text-slate-950">
                <FiAward />
                You lead
              </span>
            )}
          </div>

          {hasLeader ? (
            <div className="mt-3 flex items-center gap-3">
              <TeamAvatar name={team.name} logo={team.logo} />

              <div className="min-w-0">
                <p className="truncate text-lg font-black text-white">
                  {team.name || "Team"}
                </p>

                {team.id && (
                  <p className="break-all font-mono text-[11px] text-slate-400">
                    Team ID: {team.id}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No bids yet. Opening at{" "}
              <span className="font-bold text-slate-200">
                {formatCurrency(basePrice)}
              </span>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CurrentBidCard;
