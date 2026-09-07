import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

import AuctionHistoryTable from "../components/AuctionHistoryTable";
import HistoryFilter from "../components/HistoryFilter";

import { getAuctionHistory } from "../api/auctionHistoryApi";

export default function AuctionHistory() {
  const { id } = useParams();

  const [transactions, setTransactions] = useState([]);

  const [auction, setAuction] = useState(null);

  const [pagination, setPagination] = useState(null);

  const [filter, setFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!id) return;

    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
      };

      if (filter !== "all") {
        params.type = filter;
      }

      const response = await getAuctionHistory(id, params);

      console.log("Auction history response:", response);

      const data = response?.data || response;

      const history = data?.transactions || data?.history || [];

      setTransactions(Array.isArray(history) ? history : []);

      setAuction(data?.auction || response?.auction || null);

      setPagination(data?.pagination || response?.pagination || null);
    } catch (error) {
      console.error("Auction history error:", error);

      toast.error(
        error?.response?.data?.message || "Unable to load auction history.",
      );

      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [id, page, filter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const currentPage = Number(
    pagination?.page ?? pagination?.currentPage ?? page,
  );

  const totalPages = Number(pagination?.totalPages ?? pagination?.pages ?? 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          to={`/auctions/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-cyan-400"
        >
          <FiArrowLeft size={16} />
          Back to Auction
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <FiClock size={22} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                  AuctionPro
                </p>

                <h1 className="mt-1 text-3xl font-bold text-white">
                  Auction History
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              {auction?.name ||
                auction?.title ||
                "Complete auction transaction history"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
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
              hover:bg-navy-850
              disabled:opacity-50
            "
          >
            <FiRefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6">
        <HistoryFilter value={filter} onChange={handleFilterChange} />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="rounded-2xl border border-navy-700 bg-navy-900 p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-navy-850" />
            ))}
          </div>
        </div>
      ) : (
        <AuctionHistoryTable transactions={transactions} />
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
            className="
                rounded-xl
                border
                border-navy-700
                bg-navy-900
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
          >
            Previous
          </button>

          <span className="rounded-xl bg-navy-850 px-4 py-2.5 text-sm font-semibold text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="
                rounded-xl
                border
                border-navy-700
                bg-navy-900
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
