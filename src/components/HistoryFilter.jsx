import { FiActivity, FiCheckCircle, FiList, FiXCircle } from "react-icons/fi";

export default function HistoryFilter({ value, onChange }) {
  const filters = [
    {
      value: "all",
      label: "All",
      icon: FiList,
    },
    {
      value: "sold",
      label: "Sold",
      icon: FiCheckCircle,
    },
    {
      value: "unsold",
      label: "Unsold",
      icon: FiXCircle,
    },
    {
      value: "bid",
      label: "Bids",
      icon: FiActivity,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;

        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              transition
              ${
                active
                  ? "bg-gradient-to-b from-cyan-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-inset ring-white/30"
                  : "border border-white/70 bg-white/50 text-slate-600 backdrop-blur-xl hover:bg-white/80 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              }
            `}
          >
            <Icon size={16} />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
