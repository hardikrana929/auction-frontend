import { FiRotateCcw, FiUser } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatShortAmount } from "../../utils/formatAmount";
import { toImageUrl } from "../../utils/imageUrl";

/** "₹1,00,000" with the short form (1 Lac) next to it. */
export function Money({ value, className = "" }) {
  const short = Number(value) >= 1000 ? formatShortAmount(value) : "";
  return (
    <span className={className}>
      {formatCurrency(value)}
      {short && (
        <span className="ml-1.5 text-[0.7em] font-bold text-emerald-600 dark:text-emerald-400">
          ({short})
        </span>
      )}
    </span>
  );
}

const fullName = (player) =>
  [player?.fullName, player?.lastName].filter(Boolean).join(" ");

/* ---------------------------------------------------------------- player */
export function PlayerDetailsCard({ player, onTheBlock }) {
  const photo = toImageUrl(player?.photo);
  return (
    <section className="surface-card p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">
        Player details
      </h2>
      {!player ? (
        <div className="grid min-h-60 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No player on the block.
          <br />
          Start the next player to begin bidding.
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
          <div className="h-56 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:w-48 lg:w-full xl:w-48 dark:bg-slate-800">
            {photo ? (
              <img src={photo} alt={fullName(player)} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-6xl text-slate-300 dark:text-slate-600">
                <FiUser />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {fullName(player)}
              </h3>
              {player.auctionNumber && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  ID {player.auctionNumber}
                </span>
              )}
              {!onTheBlock && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold capitalize text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {player.status}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {player.role} · {player.villageTown}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Fact label="Age" value={player.age || "—"} />
              <Fact label="Experience" value={`${player.experience || 0} yrs`} />
              <Fact label="Batting" value={player.battingHand} />
              <Fact label="Bowling" value={player.bowlingStyle} />
              <Fact label="Base price" value={<Money value={player.basePrice} />} />
              {player.contactNo && <Fact label="Contact" value={player.contactNo} />}
            </dl>
            {player.bio && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{player.bio}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.05]">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-bold text-slate-900 dark:text-white">{value}</dd>
    </div>
  );
}

/* --------------------------------------------------------------- bidding */
export function BiddingPanel({ bidding, onTheBlock, paused, busy, onRaise, onUndo, canUndo }) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Current bidding
      </h2>
      <p className="mt-2 text-4xl font-black tabular-nums text-slate-900 dark:text-white sm:text-5xl">
        {onTheBlock ? <Money value={bidding.currentBid} /> : "—"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRaise}
          disabled={!onTheBlock || paused || busy}
          className="primary-btn min-w-44 justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          {onTheBlock
            ? `Bidding  +${formatShortAmount(bidding.increment) || bidding.increment}`
            : "Bidding"}
        </button>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || paused || busy}
          className="secondary-btn disabled:cursor-not-allowed disabled:opacity-50"
          title="Take the last raise back"
        >
          <FiRotateCcw /> Undo
        </button>
      </div>
      {onTheBlock && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Next bid will be <Money value={bidding.nextBid} className="font-bold" />
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- team list */
export function TeamBuyList({ teams, onTheBlock, busy, paused, currentBid, onBuy }) {
  return (
    <section className="surface-card p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">
        Team list
      </h2>
      {teams.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No approved teams yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {teams.map((team) => {
            const disabled = !team.canBuy || paused || busy;
            const logo = toImageUrl(team.logo);
            return (
              <li key={team._id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-sm font-black text-slate-500 dark:bg-slate-800">
                  {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : team.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 dark:text-white">{team.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Purse left <Money value={team.remainingBudget} className="font-semibold" />
                    {" · "}
                    {team.playersCount}/{team.maxPlayers} players
                  </p>
                  {onTheBlock && team.canBuy && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      After buying: <Money value={team.balanceAfter} />
                    </p>
                  )}
                  {onTheBlock && !team.canBuy && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                      {team.reason}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onBuy(team)}
                  disabled={disabled}
                  title={team.canBuy ? `Sell at ${formatCurrency(currentBid)}` : team.reason}
                  className="primary-btn disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buy player
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* --------------------------------------------------------------- history */
export function BidHistoryList({ bids }) {
  return (
    <section className="surface-card p-5">
      <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">
        Bidding history of this player
      </h2>
      {bids.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No raises yet.</p>
      ) : (
        <ol className="max-h-64 space-y-1 overflow-y-auto">
          {bids.map((bid, index) => (
            <li
              key={bid._id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${index === 0 ? "bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-50 text-slate-700 dark:bg-white/[0.04] dark:text-slate-300"}`}
            >
              <Money value={bid.amount} />
              <span className="text-xs opacity-70">
                {new Date(bid.createdAt).toLocaleTimeString("en-IN")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------------------------------------------------------- recent sales */
export function RecentSales({ sales, canRollback, busy, onRollback }) {
  if (!sales.length) return null;
  return (
    <section className="surface-card p-5">
      <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">Recent sales</h2>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Sold to the wrong team? Roll back to return the money to that team and
        sell the player again.
      </p>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {sales.map((sale) => (
          <li key={sale.player._id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-slate-900 dark:text-white">{fullName(sale.player)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sale.team?.name || "Team"} · <Money value={sale.price} />
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRollback(sale)}
              disabled={!canRollback || busy}
              className="secondary-btn disabled:cursor-not-allowed disabled:opacity-40"
              title={canRollback ? "Undo this sale" : "Only possible while the auction is live"}
            >
              <FiRotateCcw /> Roll back
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
