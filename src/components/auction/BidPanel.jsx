import { useMemo } from "react";
import { FiLoader, FiLock } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import { formatCurrency } from "../../utils/formatCurrency";

/**
 * Shows the current next-bid amount as a read-only field. The button places
 * exactly that increment; bid rules are enforced again by the backend.
 */
const BidPanel = ({
  currentBid = 0,
  bidIncrement = 0,
  bidRules = [],
  minimumBid = 0,
  playerActive = false,
  auctionPaused = false,
  accessApproved = true,
  canBid = true,
  submitting = false,
  teamName = "",
  teamId = "",
  purse = null,
  nextTurnTeam = null,
  approvedTeamCount = null,
  isMyTurn = true,
  onPlaceBid,
}) => {
  const current = Number(currentBid || 0);
  const matchedRule = Array.isArray(bidRules) ? bidRules.find((rule) => rule.upTo == null || current <= Number(rule.upTo)) : null;
  const increment = Number(matchedRule?.increment || bidIncrement || 0);
  const minimum = Number(minimumBid || 0);
  const step = increment > 0 ? increment : 1;

  const automaticNextBid = useMemo(() => {
    if (current > 0) {
      return current + step;
    }

    return minimum > 0 ? minimum : step;
  }, [current, step, minimum]);

  const bidAmount = automaticNextBid;

  const reason = useMemo(() => {
    if (!accessApproved) return "Your team is not approved for this auction.";
    if (!canBid) return "Bidding is not available for this account.";
    if (auctionPaused) return "The auction is paused. Bidding resumes shortly.";
    if (!playerActive) return "No player is live for bidding right now.";
    if (approvedTeamCount !== null && approvedTeamCount < 2) return "Turn-by-turn bidding requires at least two active, approved teams.";
    if (nextTurnTeam && !isMyTurn) return `It is not your team's turn. ${nextTurnTeam.name || "The next approved team"} must bid next.`;
    if (Number.isFinite(purse) && bidAmount > purse) {
      return `Not enough purse. Your team has ${formatCurrency(purse)} left.`;
    }

    return "";
  }, [accessApproved, canBid, auctionPaused, playerActive, purse, bidAmount, approvedTeamCount, nextTurnTeam, isMyTurn]);

  const inputsDisabled = submitting || !accessApproved || !canBid || auctionPaused || !playerActive || (approvedTeamCount !== null && approvedTeamCount < 2) || Boolean(nextTurnTeam && !isMyTurn);
  const placeDisabled = inputsDisabled || !Number.isFinite(bidAmount) || Boolean(reason);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (placeDisabled) {
      return;
    }

    await onPlaceBid?.(bidAmount);
  };

  const roundButton =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Place your bid
        </p>

        {teamName && (
          <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-500/30">
            Bidding as <b className="text-white">{teamName}</b>
            {teamId && <span className="font-mono text-emerald-200/80">Team ID: {teamId}</span>}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-stretch gap-2 md:flex-nowrap"
      >
        <div className="relative min-w-[150px] flex-1">
          <RupeeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="custom-bid"
            type="text"
            value={formatCurrency(bidAmount)}
            readOnly
            disabled={inputsDisabled}
            aria-label="Next bid amount"
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 text-lg font-black tabular-nums text-white outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <button
          type="submit"
          disabled={placeDisabled}
          className="flex h-12 min-w-[200px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
        >
          {submitting ? (
            <>
              <FiLoader className="animate-spin" />
              Placing bid...
            </>
          ) : (
            <>Bid {formatCurrency(bidAmount)}</>
          )}
        </button>
      </form>

      {reason ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          <FiLock className="mt-0.5 shrink-0" />
          <span>{reason}</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Next increment {formatCurrency(step)} · Next bid{" "}
          {formatCurrency(automaticNextBid)}
          {nextTurnTeam?.name ? ` · Next turn: ${nextTurnTeam.name}` : ""}
        </p>
      )}
    </section>
  );
};

export default BidPanel;
