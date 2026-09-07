const statusStyles = {
  upcoming: "bg-blue-500/10 text-blue-600 dark:text-blue-400",

  live: "bg-green-500/10 text-green-600 dark:text-green-400",

  paused: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",

  completed: "bg-gray-500/10 text-gray-600 dark:text-gray-400",

  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",

  active: "bg-green-500/10 text-green-600 dark:text-green-400",

  inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .trim();

  const classes =
    statusStyles[normalizedStatus] ||
    "bg-gray-500/10 text-gray-600 dark:text-gray-400";

  const label =
    normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3 py-1
        text-xs
        font-semibold
        ${classes}
      `}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label || "Unknown"}
    </span>
  );
}
