import { FiDollarSign, FiUsers } from "react-icons/fi";

import formatCurrency from "../utils/formatCurrency";

export default function TeamSpendingCard({ teams = [] }) {
  const normalizedTeams = Array.isArray(teams) ? teams : [];

  return (
    <div
      className="
        rounded-2xl
        border
        border-navy-700
        bg-navy-900
        p-6
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-cyan-500/10
            text-cyan-400
          "
        >
          <FiUsers size={21} />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Team Analytics
          </p>

          <h2 className="text-xl font-bold text-white">Team Spending</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {normalizedTeams.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No team spending data available.
          </p>
        ) : (
          normalizedTeams.map((team, index) => {
            const name = team?.team?.name || team?.name || `Team ${index + 1}`;

            const spent = Number(
              team?.totalSpent ?? team?.spent ?? team?.totalSpending ?? 0,
            );

            const players = Number(
              team?.playersBought ??
                team?.playersCount ??
                team?.playerCount ??
                0,
            );

            return (
              <div
                key={team?._id || team?.team?._id || name}
                className="
                  rounded-xl
                  bg-navy-850
                  p-4
                "
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{name}</p>

                    <p className="mt-1 text-xs text-gray-400">
                      {players} player
                      {players === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-bold text-cyan-400">
                    <FiDollarSign size={15} />

                    {formatCurrency(spent)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
