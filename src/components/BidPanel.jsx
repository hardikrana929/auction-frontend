import { useMemo, useState } from "react";
import { FiTrendingUp } from "react-icons/fi";
import RupeeIcon from "./RupeeIcon";
import toast from "react-hot-toast";

import { placeBid } from "../api/biddingApi";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const BidPanel = ({
  auctionId,
  player,
  team,
  currentBid = 0,
  bidIncrement = 10000,
  auctionStatus,
  disabled = false,
  onBidPlaced,
}) => {
  const [processing, setProcessing] = useState(false);

  const teamId = team?._id || team?.id;

  const playerId = player?._id || player?.id;

  const minimumBid = useMemo(() => {
    const current = Number(
      currentBid || player?.currentBid || player?.basePrice || 0,
    );

    const increment = Number(bidIncrement || 0);

    /*
     * First bid:
     *
     * current = 0
     * minimum = base price
     *
     * Existing bid:
     *
     * minimum = current + increment
     */
    if (current <= 0) {
      return Number(player?.basePrice || 0);
    }

    return current + increment;
  }, [currentBid, player, bidIncrement]);

  const canBid =
    Boolean(auctionId) &&
    Boolean(playerId) &&
    Boolean(teamId) &&
    auctionStatus === "player_auction" &&
    !disabled &&
    !processing;

  const handleBid = async () => {
    if (!teamId) {
      toast.error("Your team information is not available.");
      return;
    }

    if (!playerId) {
      toast.error("No active player is available.");
      return;
    }

    if (!auctionId) {
      toast.error("Auction ID is missing.");
      return;
    }

    if (auctionStatus !== "player_auction") {
      toast.error("Bidding is not currently active.");
      return;
    }

    try {
      setProcessing(true);

      const response = await placeBid({
        auctionId,
        playerId,
        teamId,
        amount: minimumBid,
      });

      toast.success("Bid placed successfully.");

      onBidPlaced?.(response);
    } catch (error) {
      console.error("Place bid error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to place bid.";

      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (!player) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="h-5 w-5 text-blue-500" />

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Place Your Bid
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your next valid bid is calculated automatically.
        </p>
      </div>

      {/* Team */}
      <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Your Team
        </p>

        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
          {team?.name || "Team"}
        </p>

        {team?.remainingBudget !== undefined && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Remaining Budget:{" "}
            <span className="font-semibold">
              {formatCurrency(team.remainingBudget)}
            </span>
          </p>
        )}
      </div>

      {/* Next bid */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-900/20">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Next Minimum Bid
        </p>

        <div className="mt-1 flex items-center gap-2">
          <RupeeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />

          <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {formatCurrency(minimumBid)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBid}
        disabled={!canBid}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiTrendingUp />

        {processing ? "Placing Bid..." : "Place Bid"}
      </button>

      {!teamId && (
        <p className="mt-3 text-center text-xs text-red-500">
          Your team is not available. You cannot bid yet.
        </p>
      )}

      {auctionStatus !== "player_auction" && (
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Bidding will become available when the administrator starts the
          player.
        </p>
      )}
    </div>
  );
};

export default BidPanel;
