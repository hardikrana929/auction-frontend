export default function SkeletonCard() {
  return (
    <div
      className="
        animate-pulse
        rounded-2xl
        border border-gray-200
        bg-white
        p-5
        dark:border-navy-700
        dark:bg-navy-850
      "
    >
      <div className="h-5 w-20 rounded bg-gray-200 dark:bg-navy-700" />

      <div className="mt-5 h-7 w-3/4 rounded bg-gray-200 dark:bg-navy-700" />

      <div className="mt-5 space-y-3">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-navy-700" />
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-navy-700" />
      </div>

      <div className="mt-5 h-16 rounded-xl bg-gray-200 dark:bg-navy-700" />

      <div className="mt-5 h-11 rounded-xl bg-gray-200 dark:bg-navy-700" />
    </div>
  );
}
