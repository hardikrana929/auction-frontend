import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiLock, FiMinus, FiPlus } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import { formatCurrency } from "../../utils/formatCurrency";

/**
 * The bidding controls, all in ONE row:
 *   [ - ]  [ ₹ amount ]  [ + ]  [ Place Bid ]
 * The team is chosen automatically by the page from the logged-in owner.
 */
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
<<<<<<< HEAD
  lastBidTeam = null,
  approvedTeamCount = null,
  nextBid = null,
  onPlaceBid,
}) => {
  const current = Number(currentBid || 0);
  // Thresholds are exclusive (same as backend utils/bidRules.js): once the current
  // bid reaches `upTo`, the next tier applies. Using "<=" here made the UI offer
  // a bid that was one tier too low exactly at a boundary -> HTTP 400.
  const matchedRule = Array.isArray(bidRules) ? bidRules.find((rule) => rule.upTo == null || current < Number(rule.upTo)) : null;
  const increment = Number(matchedRule?.increment || bidIncrement || 0);
=======
  onPlaceBid,
}) => {
  const current = Number(currentBid || 0);
  const increment = Number(bidIncrement || 0);
>>>>>>> parent of 6f3d571 (add new featur and fix bug)
  const minimum = Number(minimumBid || 0);
  const step = increment > 0 ? increment : 1;

  const lastBidTeamId = lastBidTeam?._id || lastBidTeam?.id || lastBidTeam?.teamId || lastBidTeam || null;
  // A player's currentBid is initialized to the base price before the first bid.
  // Do not add an increment until a team has actually placed a bid.
  const automaticNextBid = useMemo(() => {
    // Prefer the amount the server says it will accept; fall back to local math.
    const serverNext = Number(nextBid);
    if (Number.isFinite(serverNext) && serverNext > 0) return serverNext;
    if (lastBidTeamId && current > 0) return current + step;
    return minimum > 0 ? minimum : (current > 0 ? current : step);
  }, [nextBid, current, step, minimum, lastBidTeamId]);

<<<<<<< HEAD
  const bidAmount = automaticNextBid;
  const isLastBidder = Boolean(teamId && lastBidTeamId && String(teamId) === String(lastBidTeamId));
=======
  const [customAmount, setCustomAmount] = useState("");

  // If somebody else bids higher while you were typing, follow the new minimum.
  useEffect(() => {
    if (customAmount !== "" && Number(customAmount) < automaticNextBid) {
      setCustomAmount("");
    }
  }, [automaticNextBid, customAmount]);

  const bidAmount = customAmount === "" ? automaticNextBid : Number(customAmount);
>>>>>>> parent of 6f3d571 (add new featur and fix bug)

  const reason = useMemo(() => {
    if (!accessApproved) return "Your team is not approved for this auction.";
    if (!canBid) return "Bidding is not available for this account.";
    if (auctionPaused) return "The auction is paused. Bidding resumes shortly.";
    if (!playerActive) return "No player is live for bidding right now.";
<<<<<<< HEAD
    if (approvedTeamCount !== null && approvedTeamCount < 2) return "At least two active, approved teams are required for bidding.";
    if (isLastBidder) return "Your team placed the latest bid. Wait for another team to bid before bidding again.";
=======
>>>>>>> parent of 6f3d571 (add new featur and fix bug)
    if (Number.isFinite(purse) && bidAmount > purse) {
      return `Not enough purse. Your team has ${formatCurrency(purse)} left.`;
    }

    return "";
<<<<<<< HEAD
  }, [accessApproved, canBid, auctionPaused, playerActive, purse, bidAmount, approvedTeamCount, isLastBidder]);

  const inputsDisabled = submitting || !accessApproved || !canBid || auctionPaused || !playerActive || (approvedTeamCount !== null && approvedTeamCount < 2) || isLastBidder;
  const placeDisabled = inputsDisabled || !Number.isFinite(bidAmount) || Boolean(reason);
=======
  }, [accessApproved, canBid, auctionPaused, playerActive, purse, bidAmount]);

  const invalidAmount = !Number.isFinite(bidAmount) || bidAmount < automaticNextBid;
  const inputsDisabled = submitting || !accessApproved || !canBid || auctionPaused || !playerActive;
  const placeDisabled = inputsDisabled || invalidAmount || Boolean(reason);

  const decrease = () =>
    setCustomAmount(String(Math.max(automaticNextBid, bidAmount - step)));

  const increase = () => setCustomAmount(String(bidAmount + step));
>>>>>>> parent of 6f3d571 (add new featur and fix bug)

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (placeDisabled) {
      return;
    }

    await onPlaceBid?.(bidAmount);
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
            Bidding as <b className="text-white">{teamName}</b>
            {teamId && <span className="font-mono text-emerald-700/80 dark:text-emerald-200/80">Team ID: {teamId}</span>}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-stretch gap-2 md:flex-nowrap"
      >
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
<<<<<<< HEAD
            aria-label="Next bid amount"
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-lg font-black tabular-nums text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
=======
            aria-label="Bid amount"
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 text-lg font-black tabular-nums text-white outline-none transition [appearance:textfield] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
>>>>>>> parent of 6f3d571 (add new featur and fix bug)
          />
        </div>

        <button
          type="button"
          onClick={increase}
          disabled={inputsDisabled}
          aria-label="Increase bid"
          className={roundButton}
        >
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
<<<<<<< HEAD
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Next increment {formatCurrency(step)} · Next bid{" "}
          {formatCurrency(automaticNextBid)}
          {lastBidTeam?.name ? ` · Latest bid: ${lastBidTeam.name}` : " · Any approved team may bid first"}
=======
        <p className="mt-3 text-xs text-slate-500">
          Increment {formatCurrency(step)} · Minimum next bid{" "}
          {formatCurrency(automaticNextBid)}
>>>>>>> parent of 6f3d571 (add new featur and fix bug)
        </p>
      )}
    </section>
  );
};

export default BidPanel;
