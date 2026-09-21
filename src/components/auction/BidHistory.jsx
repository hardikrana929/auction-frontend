import { FiClock } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import TeamAvatar from "./TeamAvatar";
import { formatCurrency } from "../../utils/formatCurrency";
import { resolveTeam, shortId } from "../../utils/teamInfo";

const getAmount = (bid) =>
  bid?.amount ?? bid?.bidAmount ?? bid?.price ?? bid?.value ?? 0;

const getTime = (bid) => {
  const date = bid?.createdAt || bid?.timestamp || bid?.date;
  const parsed = date ? new Date(date) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/** Live list of bids for the current player, newest first. */
const BidHistory = ({ bids = [], directory = {}, myTeamId = "" }) => {
  const list = Array.isArray(bids) ? bids : [];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-white">Live bid history</h2>

          <p className="text-xs text-slate-500">Latest bids appear first.</p>
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
          {list.length} bids
        </span>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-4">
        {list.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 text-center">
            <RupeeIcon className="h-8 w-8 text-slate-600" />

            <p className="mt-3 font-semibold text-slate-300">No bids yet</p>

            <p className="mt-1 text-sm text-slate-500">
              The first accepted bid will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((bid, index) => {
              const team = resolveTeam(
                bid?.team || bid?.teamId || bid?.bidder || bid?.createdBy,
                directory,
              );

              const mine = Boolean(myTeamId) && team.id === myTeamId;

              return (
                <li
                  key={bid?._id || bid?.id || `${team.id}-${getAmount(bid)}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                    index === 0
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <TeamAvatar name={team.name} logo={team.logo} size="sm" />

                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-bold text-white">
                        {team.name || "Team"}

                        {mine && (
                          <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
                            You
                          </span>
                        )}
                      </p>

                      <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                        {team.id && (
                          <span className="font-mono" title={team.id}>
                            Team ID: …{shortId(team.id, 8)}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1">
                          <FiClock />
                          {getTime(bid)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black tabular-nums text-white">
                      {formatCurrency(getAmount(bid))}
                    </p>

                    {index === 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wide text-emerald-400">
                        Leading
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default BidHistory;
