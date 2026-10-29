import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiLock, FiMinus, FiPlus } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import { formatCurrency } from "../../utils/formatCurrency";

/** One-row bidding controls. The backend remains authoritative for bid validation. */
const BidPanel = ({
  currentBid = 0,
  bidIncrement = 0,
  minimumBid = 0,
  playerActive = false,
  auctionPaused = false,
  accessApproved = true,
  canBid = true,
  submitting = false,
  teamName = "",
  teamId = "",
  purse = null,
  lastBidTeam = null,
  approvedTeamCount = null,
  nextBid = null,
  bidRules = [],
  onPlaceBid,
}) => {
  const current = Number(currentBid || 0);
  // The next tier applies at the exact threshold (upTo is exclusive).
  const matchedRule = Array.isArray(bidRules)
    ? bidRules.find((rule) => rule.upTo == null || current < Number(rule.upTo))
    : null;
  const increment = Number(matchedRule?.increment || bidIncrement || 0);
  const minimum = Number(minimumBid || 0);
  const step = increment > 0 ? increment : 1;

  const lastBidTeamId =
    lastBidTeam?._id || lastBidTeam?.id || lastBidTeam?.teamId || lastBidTeam || null;

  // Prefer a server-calculated next bid. Before the first bid, use the supplied
  // minimum/base price; after a bid, require at least current + increment.
  const automaticNextBid = useMemo(() => {
    const serverNext = Number(nextBid);
    if (nextBid != null && Number.isFinite(serverNext) && serverNext > 0) {
      return serverNext;
    }
    if (lastBidTeamId && current > 0) return current + step;
    if (minimum > 0) return minimum;
    return current > 0 ? current : step;
  }, [nextBid, lastBidTeamId, current, step, minimum]);

  const [customAmount, setCustomAmount] = useState("");

  // If a competing bid raises the minimum while this user is typing, reset a
  // now-invalid amount so the form cannot submit a stale bid.
  useEffect(() => {
    if (customAmount !== "" && Number(customAmount) < automaticNextBid) {
      setCustomAmount("");
    }
  }, [automaticNextBid, customAmount]);

  const bidAmount = customAmount === "" ? automaticNextBid : Number(customAmount);
  const isLastBidder = Boolean(
    teamId && lastBidTeamId && String(teamId) === String(lastBidTeamId),
  );

  const reason = useMemo(() => {
    if (!accessApproved) return "Your team is not approved for this auction.";
    if (!canBid) return "Bidding is not available for this account.";
    if (auctionPaused) return "The auction is paused. Bidding resumes shortly.";
    if (!playerActive) return "No player is live for bidding right now.";
    if (approvedTeamCount != null && Number(approvedTeamCount) < 2) {
      return "At least two active, approved teams are required for bidding.";
    }
    if (isLastBidder) {
      return "Your team placed the latest bid. Wait for another team to bid before bidding again.";
    }
    if (!Number.isFinite(bidAmount) || bidAmount < automaticNextBid) {
      return `Your bid must be at least ${formatCurrency(automaticNextBid)}.`;
    }
    if (Number.isFinite(purse) && bidAmount > purse) {
      return `Not enough purse. Your team has ${formatCurrency(purse)} left.`;
    }
    return "";
  }, [
    accessApproved,
    canBid,
    auctionPaused,
    playerActive,
    approvedTeamCount,
    isLastBidder,
    bidAmount,
    automaticNextBid,
    purse,
  ]);

  const inputsDisabled =
    submitting ||
    !accessApproved ||
    !canBid ||
    auctionPaused ||
    !playerActive ||
    (approvedTeamCount != null && Number(approvedTeamCount) < 2) ||
    isLastBidder;
  const invalidAmount = !Number.isFinite(bidAmount) || bidAmount < automaticNextBid;
  const placeDisabled = inputsDisabled || invalidAmount || Boolean(reason);

  const decrease = () =>
    setCustomAmount(String(Math.max(automaticNextBid, bidAmount - step)));
  const increase = () => setCustomAmount(String(bidAmount + step));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (placeDisabled || typeof onPlaceBid !== "function") return;
    await onPlaceBid(bidAmount);
    setCustomAmount("");
  };

  const roundButton =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Place your bid
        </p>
        {teamName && (
          <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
            Bidding as <b>{teamName}</b>
            {teamId && (
              <span className="font-mono text-emerald-700/80 dark:text-emerald-200/80">
                Team ID: {teamId}
              </span>
            )}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-stretch gap-2 md:flex-nowrap">
        <button
          type="button"
          onClick={decrease}
          disabled={inputsDisabled || bidAmount <= automaticNextBid}
          aria-label="Decrease bid"
          className={roundButton}
        >
          <FiMinus />
        </button>

        <div className="relative min-w-[150px] flex-1">
          <RupeeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="custom-bid"
            type="number"
            min={automaticNextBid}
            step={step}
            value={customAmount === "" ? automaticNextBid : customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            disabled={inputsDisabled}
            aria-label="Bid amount"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-lg font-black tabular-nums text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <button type="button" onClick={increase} disabled={inputsDisabled} aria-label="Increase bid" className={roundButton}>
          <FiPlus />
        </button>

        <button
          type="submit"
          disabled={placeDisabled}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-black text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus:ring-offset-slate-900 md:flex-none"
        >
          {submitting ? (
            <>
              <FiLoader className="animate-spin" />
              Placing bid...
            </>
          ) : (
            <>Place Bid — {formatCurrency(bidAmount)}</>
          )}
        </button>
      </form>

      {reason ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <FiLock className="mt-0.5 shrink-0" />
          <span>{reason}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Increment {formatCurrency(step)} · Minimum next bid {formatCurrency(automaticNextBid)}
          {lastBidTeam?.name ? ` · Latest bid: ${lastBidTeam.name}` : " · Any approved team may bid first"}
        </p>
      )}
    </section>
  );
};

export default BidPanel;
