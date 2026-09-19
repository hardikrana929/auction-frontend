import { FiAward, FiDollarSign, FiUser, FiUsers } from "react-icons/fi";

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getPlayerName = (player) => {
  if (!player) return "Waiting for player";

  if (player.fullName) {
    return player.fullName;
  }

  const firstName = player.firstName || player.name || "";

  const lastName = player.lastName || "";

  return `${firstName} ${lastName}`.trim() || "Unknown Player";
};

const getTeamName = (team) => {
  if (!team) return "No bids yet";

  if (typeof team === "string") {
    return team;
  }

  return team.name || team.teamName || team.ownerName || "Unknown Team";
};

const LivePlayerCard = ({ player, currentBid, leadingTeam }) => {
  const playerId = getId(player);

  const photo = player?.photo || player?.image || player?.profileImage || "";

  const name = getPlayerName(player);

  const basePrice = Number(player?.basePrice ?? player?.minimumBid ?? 0);

  const bid = Number(currentBid ?? player?.currentBid ?? basePrice);

  const role = player?.role || player?.playerRole || "Player";

  const status = player?.status || "auctioning";

  const team = leadingTeam || player?.currentBidder || null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-5 py-4 text-white sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Current Player
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-300">LIVE</span>
            </div>
          </div>

          {playerId && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              ID: {String(playerId).slice(-6)}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex justify-center">
            <div className="flex h-52 w-44 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:h-60 sm:w-48">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling.style.display =
                      "flex";
                  }}
                />
              ) : null}

              <div
                className={`h-full w-full items-center justify-center ${
                  photo ? "hidden" : "flex"
                }`}
              >
                <FiUser className="h-20 w-20 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {role}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {status}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {name}
            </h1>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <FiDollarSign />
                  Base Price
                </div>

                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(basePrice)}
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  <FiAward />
                  Current Bid
                </div>

                <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(bid)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                <FiUsers className="h-5 w-5 text-slate-500 dark:text-slate-300" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Leading Team
                </p>

                <p className="font-bold text-slate-900 dark:text-white">
                  {getTeamName(team)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivePlayerCard;
