import { FiCheckCircle, FiClock, FiLock, FiXCircle } from "react-icons/fi";

export default function AuctionAccessStatus({
  loading = false,
  allowed = false,
  status = "",
  message = "",
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-900">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-navy-800" />

          <div className="flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-navy-800" />
            <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200 dark:bg-navy-800" />
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus = String(status).toLowerCase();

  if (allowed) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
        <div className="flex items-start gap-3">
          <FiCheckCircle
            size={22}
            className="mt-0.5 text-green-600 dark:text-green-400"
          />

          <div>
            <h3 className="font-bold text-green-700 dark:text-green-400">
              Auction Access Granted
            </h3>

            <p className="mt-1 text-sm text-green-700/80 dark:text-green-400/80">
              You are eligible to participate in this auction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (normalizedStatus === "pending") {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-950/20">
        <div className="flex items-start gap-3">
          <FiClock
            size={22}
            className="mt-0.5 text-orange-600 dark:text-orange-400"
          />

          <div>
            <h3 className="font-bold text-orange-700 dark:text-orange-400">
              Registration Pending
            </h3>

            <p className="mt-1 text-sm text-orange-700/80 dark:text-orange-400/80">
              Your auction registration is waiting for admin approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (normalizedStatus === "rejected") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <FiXCircle
            size={22}
            className="mt-0.5 text-red-600 dark:text-red-400"
          />

          <div>
            <h3 className="font-bold text-red-700 dark:text-red-400">
              Registration Rejected
            </h3>

            <p className="mt-1 text-sm text-red-700/80 dark:text-red-400/80">
              {message || "Your registration was rejected."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-navy-700 dark:bg-navy-850">
      <div className="flex items-start gap-3">
        <FiLock size={22} className="mt-0.5 text-gray-500" />

        <div>
          <h3 className="font-bold text-navy-950 dark:text-white">
            Auction Access Restricted
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message ||
              "You do not currently have access to participate in this auction."}
          </p>
        </div>
      </div>
    </div>
  );
}
