import { useEffect, useMemo, useState } from "react";
import { FiArrowUp, FiCheckCircle, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

import { placeBid } from "../api/biddingApi";
import { formatCurrency } from "../utils/formatCurrency";

export default function BidPanel({
  auctionId,
  playerId,
  currentBid = 0,
  minimumBid = 0,
  bidIncrement = 0,
  teamId = "",
  disabled = false,
  disabledReason = "",
  onBidPlaced,
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const numericCurrentBid = Number(currentBid) || 0;
  const numericMinimumBid = Number(minimumBid) || 0;
  const numericIncrement = Number(bidIncrement) || 0;

  const calculatedMinimum = useMemo(() => {
    if (numericMinimumBid > numericCurrentBid) {
      return numericMinimumBid;
    }

    if (numericIncrement > 0) {
      return numericCurrentBid + numericIncrement;
    }

    return numericCurrentBid + 1;
  }, [numericCurrentBid, numericMinimumBid, numericIncrement]);

  useEffect(() => {
    setAmount(String(calculatedMinimum));
  }, [calculatedMinimum]);

  const numericAmount = Number(amount);

  const amountValid =
    Number.isFinite(numericAmount) && numericAmount >= calculatedMinimum;

  const handleBid = async (event) => {
    event.preventDefault();

    if (submitting || disabled) {
      return;
    }

    if (!auctionId || !playerId || !teamId) {
      toast.error("Auction, player, or team information is missing.");
      return;
    }

    if (!amountValid) {
      toast.error(`Bid must be at least ${formatCurrency(calculatedMinimum)}.`);
      return;
    }

    setSubmitting(true);

    try {
      /*
       * IMPORTANT:
       * Verify the exact request body against your backend controller/Postman.
       * Do not add fields that your backend does not expect.
       */
      const response = await placeBid({
        auctionId,
        playerId,
        teamId,
        amount: numericAmount,
      });

      toast.success("Bid placed successfully.");

      if (onBidPlaced) {
        onBidPlaced(response);
      }
    } catch (error) {
      const message =
        error?.normalizedMessage ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to place bid.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-500">
            Place Your Bid
          </p>

          <h2 className="mt-1 text-xl font-bold text-navy-950 dark:text-white">
            {formatCurrency(numericCurrentBid)}
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
          <FiArrowUp size={21} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-pitch-50 p-4 dark:bg-navy-850">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Minimum next bid
        </p>

        <p className="mt-1 text-lg font-bold text-navy-950 dark:text-white">
          {formatCurrency(calculatedMinimum)}
        </p>
      </div>

      {disabled ? (
        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
          <div className="flex gap-3">
            <FiLock className="mt-0.5 text-orange-600" />

            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-400">
                Bidding unavailable
              </p>

              <p className="mt-1 text-sm text-orange-700/80 dark:text-orange-400/80">
                {disabledReason || "Bidding is currently unavailable."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBid} className="mt-5">
          <label
            htmlFor="bidAmount"
            className="text-sm font-semibold text-navy-950 dark:text-white"
          >
            Bid Amount
          </label>

          <input
            id="bidAmount"
            type="number"
            min={calculatedMinimum}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={submitting}
            className="
              mt-2
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
              text-lg
              font-bold
              text-navy-950
              outline-none
              transition
              focus:border-cyan-500
              focus:ring-2
              focus:ring-cyan-500/20
              dark:border-navy-700
              dark:bg-navy-850
              dark:text-white
            "
          />

          {!amountValid && amount !== "" && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Enter at least {formatCurrency(calculatedMinimum)}.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !amountValid}
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-5
              py-3
              font-bold
              text-white
              transition
              hover:bg-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-50
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
            "
          >
            {submitting ? (
              "Placing Bid..."
            ) : (
              <>
                <FiCheckCircle size={18} />
                Place Bid
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
