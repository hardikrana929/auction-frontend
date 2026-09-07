export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch-50 dark:bg-navy-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading AuctionPro...
        </p>
      </div>
    </div>
  );
}
