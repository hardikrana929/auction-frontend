import { FiWifi, FiWifiOff } from "react-icons/fi";

export default function AuctionConnectionStatus({ connected }) {
  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        px-3
        py-1.5
        text-xs
        font-bold
        ${
          connected
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }
      `}
    >
      {connected ? <FiWifi size={14} /> : <FiWifiOff size={14} />}

      {connected ? "Live Connected" : "Disconnected"}
    </div>
  );
}
