import {
  FiCheckCircle,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSkipForward,
  FiStopCircle,
  FiXCircle,
} from "react-icons/fi";

const base =
  "flex h-12 min-w-[150px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40";

const Spinner = <FiRefreshCw className="animate-spin" />;

/** All auctioneer controls in ONE row. */
const AdminControlBar = ({
  paused = false,
  playerActive = false,
  controlLoading = "",
  onPauseResume,
  onSell,
  onUnsold,
  onNext,
  onComplete,
}) => {
  const busy = Boolean(controlLoading);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Auctioneer controls
      </p>

      <div className="flex flex-wrap items-stretch gap-2 lg:flex-nowrap">
        <button
          type="button"
          onClick={onPauseResume}
          disabled={busy}
          className={`${base} border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20`}
        >
          {controlLoading === "pause" || controlLoading === "resume" ? (
            Spinner
          ) : paused ? (
            <FiPlay />
          ) : (
            <FiPause />
          )}
          {paused ? "Resume" : "Pause"}
        </button>

        <button
          type="button"
          onClick={onSell}
          disabled={busy || !playerActive}
          className={`${base} bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
        >
          {controlLoading === "sell" ? Spinner : <FiCheckCircle />}
          Sell player
        </button>

        <button
          type="button"
          onClick={onUnsold}
          disabled={busy || !playerActive}
          className={`${base} border border-slate-600 bg-slate-800 text-white hover:bg-slate-700`}
        >
          {controlLoading === "unsold" ? Spinner : <FiXCircle />}
          Mark unsold
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          className={`${base} bg-sky-500 text-slate-950 hover:bg-sky-400`}
        >
          {controlLoading === "next" ? Spinner : <FiSkipForward />}
          Next player
        </button>

        <button
          type="button"
          onClick={onComplete}
          disabled={busy}
          className={`${base} border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
        >
          {controlLoading === "complete" ? Spinner : <FiStopCircle />}
          Complete
        </button>
      </div>
    </section>
  );
};

export default AdminControlBar;
