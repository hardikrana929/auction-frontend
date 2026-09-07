import { FiAward, FiDollarSign, FiUser } from "react-icons/fi";

import formatCurrency from "../utils/formatCurrency";

export default function HighestSaleCard({ player, highestBid }) {
  const playerName = player?.fullName || player?.name || "No player yet";

  const playerRole = player?.role || player?.playingRole || "—";

  const salePrice =
    player?.soldPrice ?? player?.finalPrice ?? player?.price ?? 0;

  const bidAmount =
    highestBid?.amount ?? highestBid?.bidAmount ?? highestBid?.currentBid ?? 0;

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
            bg-amber-500/10
            text-amber-400
          "
        >
          <FiAward size={22} />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Top Auction Result
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">Highest Sale</h2>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        {player?.photo ? (
          <img
            src={player.photo}
            alt={playerName}
            className="
              h-16
              w-16
              rounded-xl
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-xl
              bg-navy-800
              text-gray-400
            "
          >
            <FiUser size={25} />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-white">
            {playerName}
          </h3>

          <p className="mt-1 text-sm text-gray-400">{playerRole}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-navy-850 p-4">
          <p className="text-xs text-gray-400">Sold For</p>

          <p className="mt-2 text-lg font-bold text-emerald-400">
            {formatCurrency(salePrice)}
          </p>
        </div>

        <div className="rounded-xl bg-navy-850 p-4">
          <p className="text-xs text-gray-400">Highest Bid</p>

          <div className="mt-2 flex items-center gap-1">
            <FiDollarSign size={15} className="text-cyan-400" />

            <p className="text-lg font-bold text-white">
              {formatCurrency(bidAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
