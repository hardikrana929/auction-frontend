import { FiFilter } from "react-icons/fi";

export default function FilterBar({ status, onStatusChange }) {
  return (
    <div
      className="
        flex flex-col gap-3
        sm:flex-row sm:items-center
      "
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        <FiFilter size={17} />
        Status
      </div>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="
          rounded-xl
          border border-gray-300
          bg-white
          px-4 py-3
          text-sm
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
      >
        <option value="all">All Auctions</option>
        <option value="upcoming">Upcoming</option>
        <option value="live">Live</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
