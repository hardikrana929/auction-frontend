import { FiUser } from "react-icons/fi";
import { formatCurrency } from "../utils/formatCurrency";

export default function LivePlayerCard({ player }) {
  if (!player) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-navy-700 dark:bg-navy-900">
        <FiUser size={40} className="mx-auto text-gray-400" />

        <h2 className="mt-4 text-xl font-bold text-navy-950 dark:text-white">
          No Player Currently Active
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Waiting for the auctioneer to start the next player.
        </p>
      </div>
    );
  }

  const playerName = player?.name || player?.playerName || "Player";

  const role = player?.role || player?.playingRole || "Player";

  const basePrice = player?.basePrice ?? player?.startingPrice ?? 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-900">
      <div className="flex min-h-[380px] items-center justify-center bg-navy-950 p-8">
        {player?.image || player?.photo ? (
          <img
            src={player.image || player.photo}
            alt={playerName}
            className="h-72 w-56 rounded-2xl object-cover shadow-2xl"
          />
        ) : (
          <div className="flex h-72 w-56 items-center justify-center rounded-2xl bg-navy-800">
            <FiUser size={80} className="text-gray-500" />
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-500">
          Current Player
        </p>

        <h1 className="mt-2 text-3xl font-bold text-navy-950 dark:text-white">
          {playerName}
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{role}</p>

        <div className="mt-6 rounded-2xl bg-pitch-50 p-4 dark:bg-navy-850">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Base Price
          </p>

          <p className="mt-1 text-xl font-bold text-navy-950 dark:text-white">
            {formatCurrency(basePrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
