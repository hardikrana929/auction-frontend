import { FiActivity, FiUser } from "react-icons/fi";
import { formatCurrency } from "../utils/formatCurrency";

export default function BidHistory({ bids = [] }) {
  if (!Array.isArray(bids) || bids.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <FiActivity size={19} />
          </div>

          <div>
            <h2 className="font-bold text-navy-950 dark:text-white">
              Bid History
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              No bids yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
          <FiActivity size={19} />
        </div>

        <div>
          <h2 className="font-bold text-navy-950 dark:text-white">
            Bid History
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest bids
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {bids.map((bid, index) => {
          const bidder =
            bid?.teamName ||
            bid?.team?.name ||
            bid?.userName ||
            bid?.user?.name ||
            "Team";

          const value = bid?.amount ?? bid?.bidAmount ?? bid?.price ?? 0;

          const key = bid?._id || bid?.id || `${value}-${index}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-2xl bg-pitch-50 p-4 dark:bg-navy-850"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                  <FiUser size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-950 dark:text-white">
                    {bidder}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bid #{bids.length - index}
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {formatCurrency(value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
