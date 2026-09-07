import { FiInbox } from "react-icons/fi";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to display.",
}) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border border-dashed
        border-gray-300
        bg-white
        px-6 py-12
        text-center
        dark:border-navy-700
        dark:bg-navy-850
      "
    >
      <div
        className="
          flex h-14 w-14
          items-center justify-center
          rounded-full
          bg-cyan-500/10
          text-cyan-500
        "
      >
        <FiInbox size={24} />
      </div>

      <h3
        className="
          mt-4
          text-lg font-bold
          text-navy-950
          dark:text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2 max-w-md
          text-sm
          text-gray-500
          dark:text-gray-400
        "
      >
        {description}
      </p>
    </div>
  );
}
