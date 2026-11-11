export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center  ">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-cyan-500" />

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Loading AuctionPro...
        </p>
      </div>
    </div>
  );
}
