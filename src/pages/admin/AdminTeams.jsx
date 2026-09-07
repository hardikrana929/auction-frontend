import { useEffect, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

import { getTeamsByAuction } from "../../api/teamApi";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminTeams() {
  const [auctionId, setAuctionId] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTeams = async () => {
    if (!auctionId.trim()) {
      toast.error("Enter an Auction ID");
      return;
    }

    setLoading(true);

    try {
      const response = await getTeamsByAuction(auctionId.trim());

      const data = response?.data || response?.teams || response;

      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load teams error:", error);

      setTeams([]);

      toast.error(error?.response?.data?.message || "Unable to load teams");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-500">
          <FiUsers size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-navy-950 dark:text-white">
            Team Management
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            View teams participating in an auction.
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-900">
        <label className="mb-2 block text-sm font-medium dark:text-gray-300">
          Auction ID
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            placeholder="Enter auction ID"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-cyan-500 dark:border-navy-700 dark:bg-navy-950 dark:text-white"
          />

          <button
            onClick={loadTeams}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />

            {loading ? "Loading..." : "Load Teams"}
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-navy-700">
          <FiUsers className="mx-auto mb-4 text-gray-400" size={40} />

          <h2 className="font-semibold text-navy-950 dark:text-white">
            No Teams Found
          </h2>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const id = team?._id || team?.id;

            const name = team?.name || team?.teamName || "Unnamed Team";

            const budget =
              team?.budget ||
              team?.remainingBudget ||
              team?.startingBudget ||
              0;

            return (
              <div
                key={id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-900"
              >
                <div className="mb-4 flex justify-between">
                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-500">
                    <FiUsers size={22} />
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {team?.status || "Active"}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-navy-950 dark:text-white">
                  {name}
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>

                    <span className="font-semibold text-cyan-500">
                      {formatCurrency(budget)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Players</span>

                    <span className="font-semibold dark:text-white">
                      {team?.players?.length || team?.playerCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
