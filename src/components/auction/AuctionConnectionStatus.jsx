import { FiRefreshCw, FiWifi, FiWifiOff } from "react-icons/fi";

const chip =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium";

const AuctionConnectionStatus = ({ connected = false, connecting = false }) => {
  if (connected) {
    return (
      <div className={`${chip} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        <FiWifi />

        <span>Connected</span>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className={`${chip} border-amber-500/40 bg-amber-500/10 text-amber-300`}>
        <FiRefreshCw className="animate-spin" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className={`${chip} border-red-500/40 bg-red-500/10 text-red-300`}>
      <FiWifiOff />
      <span>Offline</span>
    </div>
  );
};

export default AuctionConnectionStatus;
