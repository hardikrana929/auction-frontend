import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBarChart2, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

import AuctionStatsCards from "../components/AuctionStatsCards";
import HighestSaleCard from "../components/HighestSaleCard";
import TeamSpendingCard from "../components/TeamSpendingCard";
import RecentTransactions from "../components/RecentTransactions";

import { getAuctionStats } from "../api/auctionStatsApi";

export default function AuctionStatistics() {
  const { id } = useParams();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await getAuctionStats(id);

      console.log("Auction statistics response:", response);

      const data = response?.data || response?.stats || response;

      setStats(data);
    } catch (error) {
      console.error("Auction statistics error:", error);

      toast.error(
        error?.response?.data?.message || "Unable to load auction statistics.",
      );

      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded-lg bg-navy-800" />

          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 rounded-2xl bg-navy-800" />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 rounded-2xl bg-navy-800" />
            <div className="h-72 rounded-2xl bg-navy-800" />
          </div>
        </div>
      </div>
    );
  }

  const auction = stats?.auction || {};

  const summary = stats?.summary || {};

  const highestSoldPlayer = stats?.highestSoldPlayer || null;

  const highestBid = stats?.highestBid || null;

  const teams = stats?.teams || [];

  const recentTransactions = stats?.recentTransactions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to={`/auctions/${id}`}
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-cyan-400"
          >
            <FiArrowLeft size={16} />
            Back to Auction
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <FiBarChart2 size={23} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                AuctionPro Analytics
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                {auction?.name || auction?.title || "Auction Statistics"}
              </h1>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-navy-700
            bg-navy-900
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-navy-850
            disabled:opacity-50
          "
        >
          <FiRefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <AuctionStatsCards summary={summary} />

      {/* TOP ANALYTICS */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <HighestSaleCard player={highestSoldPlayer} highestBid={highestBid} />

        <TeamSpendingCard teams={teams} />
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="mt-6">
        <RecentTransactions transactions={recentTransactions} />
      </div>

      {/* HISTORY LINK */}
      <div className="mt-6 flex justify-center">
        <Link
          to={`/admin/auctions/${id}/history`}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-cyan-500
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-cyan-600
          "
        >
          View Complete Auction History
          <FiArrowLeft size={16} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}
