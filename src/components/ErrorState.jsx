import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function ErrorState({
  title = "Unable to load data",
  description = "Something went wrong while loading this information.",
  onRetry,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-red-200
        bg-red-50
        px-6 py-10
        text-center
        dark:border-red-900/50
        dark:bg-red-950/20
      "
    >
      <FiAlertCircle className="mx-auto text-red-500" size={30} />

      <h3 className="mt-4 text-lg font-bold text-red-600 dark:text-red-400">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-red-500/80 dark:text-red-400/80">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-red-500
            px-4 py-2.5
            text-sm font-semibold
            text-white
            transition
            hover:bg-red-600
          "
        >
          <FiRefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
