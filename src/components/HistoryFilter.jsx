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
                  ? "bg-cyan-500 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
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
