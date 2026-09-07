import {
  FiCheckCircle,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiStopCircle,
} from "react-icons/fi";

export default function AuctionControls({
  status,
  loading,
  onStart,
  onPause,
  onResume,
  onNextPlayer,
  onCompletePlayer,
  onCompleteAuction,
}) {
  const normalizedStatus = String(status || "").toLowerCase();

  const canStart =
    normalizedStatus === "upcoming" ||
    normalizedStatus === "draft" ||
    normalizedStatus === "unknown";

  const canPause =
    normalizedStatus === "live" || normalizedStatus === "player_auction";

  const canResume = normalizedStatus === "paused";

  const canNextPlayer =
    normalizedStatus === "live" || normalizedStatus === "player_auction";

  const canCompletePlayer =
    normalizedStatus === "live" || normalizedStatus === "player_auction";

  const canCompleteAuction =
    normalizedStatus === "live" || normalizedStatus === "player_auction";

  const isCompleted = normalizedStatus === "completed";

  const button =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section className="rounded-2xl border border-navy-700 bg-navy-900 p-5 shadow-sm">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
            Admin Control
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Auction Controls
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Control the live auction session.
          </p>
        </div>

        <div className="rounded-full border border-navy-700 px-3 py-1.5 text-xs font-semibold text-gray-300">
          Status:
          <span className="ml-1 text-cyan-400">{status || "Unknown"}</span>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* START */}
        <button
          type="button"
          onClick={onStart}
          disabled={loading || !canStart || isCompleted}
          className={`${button} bg-cyan-500 text-white hover:bg-cyan-600`}
        >
          <FiPlay size={17} />
          Start Auction
        </button>

        {/* PAUSE */}
        <button
          type="button"
          onClick={onPause}
          disabled={loading || !canPause}
          className={`${button} bg-amber-600 text-white hover:bg-amber-700`}
        >
          <FiPause size={17} />
          Pause Auction
        </button>

        {/* RESUME */}
        <button
          type="button"
          onClick={onResume}
          disabled={loading || !canResume}
          className={`${button} bg-emerald-700 text-white hover:bg-emerald-800`}
        >
          <FiRefreshCw size={17} />
          Resume Auction
        </button>

        {/* NEXT PLAYER */}
        <button
          type="button"
          onClick={onNextPlayer}
          disabled={loading || !canNextPlayer}
          className={`${button} bg-navy-800 text-white hover:bg-navy-700`}
        >
          <FiChevronRight size={17} />
          Next Player
        </button>

        {/* COMPLETE PLAYER */}
        <button
          type="button"
          onClick={onCompletePlayer}
          disabled={loading || !canCompletePlayer}
          className={`${button} border border-navy-700 bg-navy-850 text-white hover:bg-navy-800`}
        >
          <FiCheckCircle size={17} />
          Complete Player
        </button>

        {/* COMPLETE AUCTION */}
        <button
          type="button"
          onClick={onCompleteAuction}
          disabled={loading || !canCompleteAuction || isCompleted}
          className={`${button} bg-red-600 text-white hover:bg-red-700`}
        >
          <FiStopCircle size={17} />
          Complete Auction
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-cyan-400" />
          Processing auction control...
        </div>
      )}
    </section>
  );
}
