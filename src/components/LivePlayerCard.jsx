import { FiActivity, FiHash, FiUser } from "react-icons/fi";
import RupeeIcon from "./RupeeIcon";

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const LivePlayerCard = ({ player, currentBid = 0, status = "waiting" }) => {
  if (!player) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <FiUser className="h-8 w-8 text-slate-400" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Waiting for next player
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The auction administrator has not started the next player yet.
        </p>
      </div>
    );
  }

  const playerId = player._id || player.id;

  const image = player.photo || player.image || player.profileImage || "";

  const playerName = player.fullName || player.name || "Unknown Player";

  const role = player.role || "Cricket Player";

  const basePrice = Number(player.basePrice || player.minimumBid || 0);

  const bid = Number(currentBid || player.currentBid || basePrice || 0);

  const isSold = status === "player-sold" || player.status === "sold";

  const isUnsold = status === "player-unsold" || player.status === "unsold";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FiActivity className="h-5 w-5 text-emerald-500" />

          <span className="font-semibold text-slate-900 dark:text-white">
            Current Player
          </span>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isSold
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : isUnsold
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {isSold ? "SOLD" : isUnsold ? "UNSOLD" : "LIVE"}
        </span>
      </div>

      {/* Player */}
      <div className="grid gap-6 p-5 md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={playerName}
              className="h-64 w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-64 items-center justify-center">
              <FiUser className="h-20 w-20 text-slate-400" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Player</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {playerName}
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            {role}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <RupeeIcon />
                Base Price
              </div>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(basePrice)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <RupeeIcon />
                Current Bid
              </div>

              <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(bid)}
              </p>
            </div>
          </div>

          {playerId && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <FiHash />
              Player ID: {String(playerId)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePlayerCard;
