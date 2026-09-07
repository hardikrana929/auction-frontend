import { FiCheckCircle, FiClock, FiUser, FiXCircle } from "react-icons/fi";

import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";

function getTransactionType(transaction) {
  return String(transaction?.type || transaction?.status || "").toLowerCase();
}

function StatusBadge({ transaction }) {
  const type = getTransactionType(transaction);

  const isSold = type === "sold" || type === "sell";

  const isUnsold = type === "unsold";

  if (isSold) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
        <FiCheckCircle size={13} />
        Sold
      </span>
    );
  }

  if (isUnsold) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
        <FiXCircle size={13} />
        Unsold
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
      <FiClock size={13} />
      Bid
    </span>
  );
}

export default function AuctionHistoryTable({ transactions = [] }) {
  const items = Array.isArray(transactions) ? transactions : [];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-navy-700 bg-navy-900 p-10 text-center">
        <FiUser size={34} className="mx-auto text-gray-600" />

        <h3 className="mt-4 text-lg font-bold text-white">
          No auction history
        </h3>

        <p className="mt-2 text-sm text-gray-400">
          Transactions will appear here once auction activity begins.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700 bg-navy-900">
      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full">
          <thead className="border-b border-navy-700 bg-navy-850">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Player
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Team
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-700">
            {items.map((transaction, index) => {
              const player = transaction?.player;

              const team = transaction?.team;

              const playerName =
                player?.fullName ||
                player?.name ||
                transaction?.playerName ||
                "Unknown player";

              const teamName = team?.name || transaction?.teamName || "—";

              const amount =
                transaction?.amount ??
                transaction?.bidAmount ??
                transaction?.soldPrice ??
                transaction?.price ??
                0;

              const date = transaction?.createdAt || transaction?.updatedAt;

              return (
                <tr
                  key={transaction?._id || transaction?.id || index}
                  className="transition hover:bg-navy-850"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {player?.photo ? (
                        <img
                          src={player.photo}
                          alt={playerName}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gray-500">
                          <FiUser size={17} />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-white">{playerName}</p>

                        <p className="text-xs text-gray-500">
                          {player?.role || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-300">
                    {teamName}
                  </td>

                  <td className="px-5 py-4 text-sm font-bold text-cyan-400">
                    {formatCurrency(amount)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge transaction={transaction} />
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-400">
                    {formatDate(date)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="divide-y divide-navy-700 md:hidden">
        {items.map((transaction, index) => {
          const player = transaction?.player;

          const team = transaction?.team;

          const playerName =
            player?.fullName ||
            player?.name ||
            transaction?.playerName ||
            "Unknown player";

          const teamName = team?.name || transaction?.teamName || "—";

          const amount =
            transaction?.amount ??
            transaction?.bidAmount ??
            transaction?.soldPrice ??
            transaction?.price ??
            0;

          const date = transaction?.createdAt || transaction?.updatedAt;

          return (
            <div
              key={transaction?._id || transaction?.id || index}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {player?.photo ? (
                    <img
                      src={player.photo}
                      alt={playerName}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-gray-500">
                      <FiUser size={18} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {playerName}
                    </p>

                    <p className="truncate text-xs text-gray-500">{teamName}</p>
                  </div>
                </div>

                <StatusBadge transaction={transaction} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDate(date)}
                </span>

                <span className="font-bold text-cyan-400">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
