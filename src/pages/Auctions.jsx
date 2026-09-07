import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCalendar, FiPlus, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getAuctions } from "../api/auctionApi";
import { useAuth } from "../hooks/useAuth";

import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import AuctionCard from "../components/AuctionCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function Auctions() {
  const { isAdmin } = useAuth();

  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuctions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAuctions();

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

  const filteredAuctions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return auctions.filter((auction) => {
      const auctionName = String(
        auction?.name || auction?.title || auction?.auctionName || "",
      ).toLowerCase();

      const auctionStatus = String(auction?.status || "").toLowerCase();

      const matchesSearch = !query || auctionName.includes(query);

      const matchesStatus = status === "all" || auctionStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [auctions, search, status]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div
        className="
          mb-8
          flex flex-col gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-500">
            <FiCalendar size={17} />
            Auction Management
          </div>

          <h1
            className="
              mt-2
              font-display
              text-3xl font-bold
              text-navy-950
              dark:text-white
            "
          >
            Auctions
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and manage cricket player auctions.
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

      {/* Search / Filter */}
      <div
        className="
          mb-8
          flex flex-col gap-4
          rounded-2xl
          border border-gray-200
          bg-white
          p-4
          shadow-sm
          sm:flex-row
          sm:items-center
          sm:justify-between
          dark:border-navy-700
          dark:bg-navy-850
        "
      >
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search auctions..."
          />
        </div>

        <FilterBar status={status} onStatusChange={setStatus} />
      </div>

      {/* Error */}
      {error && !loading && (
        <ErrorState
          title="Unable to load auctions"
          description={error}
          onRetry={loadAuctions}
        />
      )}

      {/* Content */}
      {!error && loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!error && !loading && filteredAuctions.length === 0 && (
        <EmptyState
          title={
            search || status !== "all"
              ? "No matching auctions"
              : "No auctions available"
          }
          description={
            search || status !== "all"
              ? "Try changing your search or status filter."
              : "There are no auctions available yet."
          }
        />
      )}

      {!error && !loading && filteredAuctions.length > 0 && (
        <>
          {/* Result count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-navy-950 dark:text-white">
                {filteredAuctions.length}
              </span>{" "}
              auction
              {filteredAuctions.length !== 1 ? "s" : ""}
            </p>

            <button
              type="button"
              onClick={loadAuctions}
              className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  px-3 py-2
                  text-sm font-medium
                  text-gray-600
                  transition
                  hover:bg-gray-100
                  hover:text-cyan-500
                  dark:text-gray-400
                  dark:hover:bg-navy-800
                  dark:hover:text-cyan-400
                "
            >
              <FiRefreshCw size={15} />
              Refresh
            </button>
          </div>

          {/* Cards */}
          <div
            className="
                grid gap-5
                sm:grid-cols-2
                xl:grid-cols-3
              "
          >
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction._id || auction.id} auction={auction} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
