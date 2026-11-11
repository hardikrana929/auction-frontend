import { FiFilter } from "react-icons/fi";
import GlassSelect from "./GlassSelect";

const OPTIONS = [
  { value: "all", label: "All Auctions" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export default function FilterBar({ status, onStatusChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        <FiFilter size={17} />
        Status
      </div>
      <GlassSelect
        ariaLabel="Filter by status"
        value={status}
        onChange={onStatusChange}
        options={OPTIONS}
        className="sm:w-52"
      />
    </div>
  );
}
