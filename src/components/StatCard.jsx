import { FiActivity, FiCalendar, FiCheckCircle, FiUsers } from "react-icons/fi";

const iconMap = {
  auctions: FiCalendar,
  live: FiActivity,
  teams: FiUsers,
  completed: FiCheckCircle,
};

export default function StatCard({
  title,
  value,
  description,
  type = "auctions",
}) {
  const Icon = iconMap[type] || FiActivity;

  return (
    <div
      className="
        rounded-2xl
        border border-gray-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        dark:border-navy-700
        dark:bg-navy-850
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="
              text-sm font-medium
              text-gray-500
              dark:text-gray-400
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-3xl font-bold
              text-navy-950
              dark:text-white
            "
          >
            {value}
          </p>
        </div>

        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-cyan-500/10
            text-cyan-500
          "
        >
          <Icon size={21} />
        </div>
      </div>

      {description && (
        <p
          className="
            mt-4 text-xs
            text-gray-500
            dark:text-gray-400
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}
