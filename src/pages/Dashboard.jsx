import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getAuctions } from "../api/auctionApi";
import { useAuth } from "../hooks/useAuth";

import StatCard from "../components/StatCard";
import AuctionCard from "../components/AuctionCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAuctions();

      /*
       * Support common response wrappers without
       * changing the backend contract.
       */
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.auctions)
            ? response.auctions
            : [];

      setAuctions(list);
    } catch (err) {
      const message =
        err.normalizedMessage || err.message || "Unable to load auctions.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const statistics = useMemo(() => {
    const live = auctions.filter(
      (auction) => String(auction?.status).toLowerCase() === "live",
    ).length;

    const completed = auctions.filter(
      (auction) => String(auction?.status).toLowerCase() === "completed",
    ).length;

    return {
      total: auctions.length,
      live,
      completed,
    };
  }, [auctions]);

  const upcomingAuctions = useMemo(() => {
    return auctions
      .filter((auction) => {
        const status = String(auction?.status || "").toLowerCase();

        return status === "upcoming";
      })
      .slice(0, 3);
  }, [auctions]);

  const liveAuctions = useMemo(() => {
    return auctions
      .filter((auction) => {
        const status = String(auction?.status || "").toLowerCase();

        return status === "live" || status === "paused";
      })
      .slice(0, 3);
  }, [auctions]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* =========================================
          HEADER
      ========================================== */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-500">
            AuctionPro Dashboard
          </p>

          <h1
            className="
              mt-1
              font-display
              text-3xl font-bold
              text-navy-950
              dark:text-white
            "
          >
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your cricket auctions from one place.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/admin/auctions/create"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-5 py-3
              text-sm font-semibold
              text-white
              transition
              hover:bg-cyan-400
            "
          >
            <FiPlus size={18} />
            Create Auction
          </Link>
        )}
      </div>

      {/* =========================================
          STATISTICS
      ========================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Auctions"
          value={statistics.total}
          description="All available auctions"
          type="auctions"
        />

        <StatCard
          title="Live Auctions"
          value={statistics.live}
          description="Currently active or paused"
          type="live"
        />

        <StatCard
          title="Completed"
          value={statistics.completed}
          description="Successfully completed"
          type="completed"
        />

        <StatCard
          title="Your Role"
          value={isAdmin ? "Admin" : "User"}
          description="Current account access"
          type="teams"
        />
      </div>

      {/* =========================================
          ERROR
      ========================================== */}
      {error && !loading && (
        <div className="mt-8">
          <ErrorState
            title="Unable to load auctions"
            description={error}
            onRetry={loadAuctions}
          />
        </div>
      )}

      {/* =========================================
          LIVE AUCTIONS
      ========================================== */}
      {!error && (
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2
                className="
                  font-display
                  text-xl font-bold
                  text-navy-950
                  dark:text-white
                "
              >
                Live Auctions
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Auctions happening right now.
              </p>
            </div>

            <Link
              to="/live-auctions"
              className="
                hidden
                items-center gap-1
                text-sm font-semibold
                text-cyan-500
                hover:text-cyan-400
                sm:flex
              "
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : liveAuctions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {liveAuctions.map((auction) => (
                <AuctionCard
                  key={auction._id || auction.id}
                  auction={auction}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No live auctions"
              description="There are no live auctions at the moment."
            />
          )}
        </section>
      )}

      {/* =========================================
          UPCOMING AUCTIONS
      ========================================== */}
      {!error && (
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2
                className="
                  font-display
                  text-xl font-bold
                  text-navy-950
                  dark:text-white
                "
              >
                Upcoming Auctions
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Prepare for the next player auctions.
              </p>
            </div>

            <Link
              to="/auctions"
              className="
                hidden
                items-center gap-1
                text-sm font-semibold
                text-cyan-500
                hover:text-cyan-400
                sm:flex
              "
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : upcomingAuctions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {upcomingAuctions.map((auction) => (
                <AuctionCard
                  key={auction._id || auction.id}
                  auction={auction}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming auctions"
              description="There are no upcoming auctions available right now."
            />
          )}
        </section>
      )}
    </div>
  );
}
