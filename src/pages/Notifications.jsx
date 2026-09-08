import React from "react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>

          <p className="mt-1 text-slate-500">
            View your latest AuctionPro notifications.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl">🔔</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            No notifications
          </h2>

          <p className="mt-2 text-slate-500">
            You don't have any new notifications right now.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
