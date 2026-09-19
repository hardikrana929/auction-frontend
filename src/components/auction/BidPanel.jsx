import { useMemo, useState } from "react";
import { FiArrowUp, FiDollarSign, FiLock, FiLoader } from "react-icons/fi";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const BidPanel = ({
  currentBid = 0,
  bidIncrement = 0,
  minimumBid = 0,
  playerActive = false,
  auctionPaused = false,
  accessApproved = true,
  canBid = true,
  submitting = false,
  onPlaceBid,
}) => {
  const current = Number(currentBid || 0);
  const increment = Number(bidIncrement || 0);
  const minimum = Number(minimumBid || 0);

  const automaticNextBid = useMemo(() => {
    if (increment > 0) {
      return current + increment;
    }

    if (current > 0) {
      return current + 1;
    }

    return minimum;
  }, [current, increment, minimum]);

  const [customAmount, setCustomAmount] = useState("");

  const nextBid = customAmount ? Number(customAmount) : automaticNextBid;

  const reason = useMemo(() => {
    if (!accessApproved) {
      return "Your team is not approved for this auction.";
    }

    if (auctionPaused) {
      return "Auction is currently paused.";
    }

    if (!playerActive) {
      return "No player is currently live for bidding.";
    }

    if (!canBid) {
      return "Bidding is currently unavailable.";
    }

    return "";
  }, [accessApproved, auctionPaused, playerActive, canBid]);

  const disabled =
    submitting ||
    Boolean(reason) ||
    !Number.isFinite(nextBid) ||
    nextBid <= current;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    await onPlaceBid?.(nextBid);
    setCustomAmount("");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Your Bid
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
            Place your bid
          </h2>
        </div>

        <div className="rounded-xl bg-indigo-50 p-2.5 dark:bg-indigo-950/40">
          <FiDollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Current bid
        </p>

        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
          {formatCurrency(current)}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Next suggested bid
        </p>

        <p className="mt-1 text-3xl font-black text-indigo-700 dark:text-indigo-300">
          {formatCurrency(automaticNextBid)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="custom-bid"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Custom bid amount
          </label>

          <div className="relative">
            <FiDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              id="custom-bid"
              type="number"
              min={automaticNextBid}
              step={increment > 0 ? increment : 1}
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              disabled={submitting || Boolean(reason)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800"
              placeholder={`Minimum ${formatCurrency(automaticNextBid)}`}
            />
          </div>
        </div>

        {reason ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <FiLock className="mt-0.5 shrink-0" />
            <span>{reason}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900"
        >
          {submitting ? (
            <>
              <FiLoader className="animate-spin" />
              Placing Bid...
            </>
          ) : (
            <>
              <FiArrowUp />
              Place Bid — {formatCurrency(nextBid)}
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default BidPanel;
