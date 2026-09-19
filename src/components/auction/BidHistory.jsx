import { FiClock, FiDollarSign, FiUsers } from "react-icons/fi";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getTeamName = (bid) => {
  const team = bid?.team || bid?.teamId || bid?.bidder || bid?.createdBy;

  if (!team) {
    return "Unknown Team";
  }

  if (typeof team === "string") {
    return team;
  }

  return team.name || team.teamName || team.ownerName || "Unknown Team";
};

const getAmount = (bid) => {
  return bid?.amount ?? bid?.bidAmount ?? bid?.price ?? bid?.value ?? 0;
};

const getDate = (bid) => {
  const date = bid?.createdAt || bid?.timestamp || bid?.date;

  if (!date) {
    return "Just now";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BidHistory = ({ bids = [] }) => {
  const normalizedBids = Array.isArray(bids) ? bids : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Bid History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest bids appear first.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {normalizedBids.length} bids
          </span>
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto p-4">
        {normalizedBids.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center dark:border-slate-700">
            <FiDollarSign className="h-8 w-8 text-slate-400" />

            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-300">
              No bids yet
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The first accepted bid will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {normalizedBids.map((bid, index) => (
              <div
                key={
                  bid?._id ||
                  bid?.id ||
                  `${getTeamName(bid)}-${getAmount(bid)}-${index}`
                }
                className={`rounded-2xl border p-4 transition ${
                  index === 0
                    ? "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/50 dark:bg-indigo-950/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                      <FiUsers className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 dark:text-white">
                        {getTeamName(bid)}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <FiClock />
                        {getDate(bid)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(getAmount(bid))}
                    </p>

                    {index === 0 && (
                      <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        Leading
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BidHistory;
