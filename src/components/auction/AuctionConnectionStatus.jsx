import { FiWifi, FiWifiOff, FiRefreshCw } from "react-icons/fi";

const AuctionConnectionStatus = ({ connected = false, connecting = false }) => {
  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        <FiWifi />

        <span>Live</span>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
        <FiRefreshCw className="animate-spin" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
      <FiWifiOff />
      <span>Offline</span>
    </div>
  );
};

export default AuctionConnectionStatus;
