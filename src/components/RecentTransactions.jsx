import { FiArrowUpRight, FiUser } from "react-icons/fi";

import formatCurrency from "../utils/formatCurrency";

export default function RecentTransactions({ transactions = [] }) {
  const items = Array.isArray(transactions) ? transactions.slice(0, 6) : [];

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Recent Transactions
          </h2>
        </div>

        <FiArrowUpRight size={20} className="text-gray-500" />
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <FiUser size={28} className="mx-auto text-gray-600" />

            <p className="mt-3 text-sm text-gray-400">
              No transactions available.
            </p>
          </div>
        ) : (
          items.map((transaction, index) => {
            const player = transaction?.player;

            const playerName =
              player?.fullName ||
              player?.name ||
              transaction?.playerName ||
              "Unknown player";

            const team = transaction?.team;

            const teamName = team?.name || transaction?.teamName || "No team";

            const amount =
              transaction?.amount ??
              transaction?.bidAmount ??
              transaction?.soldPrice ??
              transaction?.price ??
              0;

            const type =
              transaction?.type || transaction?.status || "Transaction";

            return (
              <div
                key={transaction?._id || transaction?.id || index}
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  bg-navy-850
                  p-4
                "
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {playerName}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {teamName} · {type}
                  </p>
                </div>

                <p className="shrink-0 font-bold text-cyan-400">
                  {formatCurrency(amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
