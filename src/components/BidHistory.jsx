import { FiClock, FiUsers } from "react-icons/fi";
import RupeeIcon from "./RupeeIcon";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  return String(value._id || value.id || value.teamId || "");
};

const getTeamName = (bid) => {
  if (bid?.team?.name) {
    return bid.team.name;
  }

  if (bid?.teamName) {
    return bid.teamName;
  }

  if (bid?.team?.teamName) {
    return bid.team.teamName;
  }

  return "Team";
};

const BidHistory = ({ bids = [], currentBid = 0 }) => {
  const sortedBids = [...bids].sort((a, b) => {
    const first = new Date(a?.createdAt || a?.timestamp || 0).getTime();

    const second = new Date(b?.createdAt || b?.timestamp || 0).getTime();

    return second - first;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FiUsers className="h-5 w-5 text-blue-500" />

          <h2 className="font-bold text-slate-900 dark:text-white">
            Bid History
          </h2>
        </div>

        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(currentBid)}
        </span>
      </div>

      {sortedBids.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <RupeeIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No bids yet.
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {sortedBids.map((bid, index) => {
            const bidId = bid?._id || bid?.id || `${getId(bid?.team)}-${index}`;

            const amount = bid?.amount || bid?.bidAmount || bid?.value || 0;

            const date = bid?.createdAt || bid?.timestamp;

            return (
              <div
                key={bidId}
                className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getTeamName(bid)}
                  </p>

                  {date && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <FiClock />

                      {new Date(date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BidHistory;
