import React from "react";

const TeamDashboard = () => {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Dashboard</h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your team, players, budget and auction activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Team Budget</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">₹0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Players</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Players Bought</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">0</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Auctions</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">0</h2>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Welcome to AuctionPro
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Your team auction information will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
