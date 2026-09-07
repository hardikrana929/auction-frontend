import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiRadio,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { getAuctions } from "../api/auctionApi";
import formatDate from "../utils/formatDate";
import formatCurrency from "../utils/formatCurrency";
import useAuctionSocket from "../hooks/useAuctionSocket";

export default function LiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("live");

  const loadAuctions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAuctions();

      const data = response?.data || response?.auctions || response;

      setAuctions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load live auctions:", error);

      toast.error(
        error?.response?.data?.message || "Unable to load live auctions.",
      );

      setAuctions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleAuctionStarted = (data) => {
    console.log("Auction started:", data);

    setAuctionStatus("live");

    toast.success("Auction started");
  };
  const handleAuctionPaused = (data) => {
    console.log("Auction paused:", data);

    setAuctionStatus("paused");

    toast("Auction paused");
  };
  const handleAuctionResumed = (data) => {
    console.log("Auction resumed:", data);

    setAuctionStatus("live");

    toast.success("Auction resumed");
  };
  const handleSocketBid = (data) => {
    console.log("Real-time bid received:", data);

    const bid = data?.data || data?.bid || data;

    setCurrentBid((previous) => ({
      ...(previous || {}),
      ...(bid || {}),
    }));

    setBidHistory((previous) => {
      if (!bid) {
        return previous;
      }

      return [bid, ...previous];
    });
  };
  const handlePlayerStarted = (data) => {
    console.log("New player started:", data);

    const player =
      data?.player || data?.currentPlayer || data?.data?.player || data?.data;

    if (!player) {
      return;
    }

    setCurrentBid((previous) => ({
      ...(previous || {}),
      player,
      currentPlayer: player,
      amount: 0,
      currentBid: 0,
      minimumBid: data?.minimumBid || data?.data?.minimumBid || 0,
    }));

    setBidHistory([]);
  };

  const handlePlayerSold = (data) => {
    console.log("Player sold:", data);

    toast.success("Player sold!");

    setCurrentBid((previous) => ({
      ...(previous || {}),
      ...(data?.data || data?.sold || data || {}),
    }));
  };
  const handlePlayerUnsold = (data) => {
    console.log("Player unsold:", data);

    toast("Player marked as unsold");

    setCurrentBid((previous) => ({
      ...(previous || {}),
      ...(data?.data || data?.unsold || data || {}),
    }));
  };
  const handleNextPlayer = (data) => {
    console.log("Next player:", data);

    const player =
      data?.player || data?.currentPlayer || data?.data?.player || data?.data;

    if (!player) {
      return;
    }

    setCurrentBid((previous) => ({
      ...(previous || {}),
      player,
      currentPlayer: player,
      amount: 0,
      currentBid: 0,
      minimumBid: data?.minimumBid || data?.data?.minimumBid || 0,
    }));

    setBidHistory([]);
  };

  const handleAuctionCompleted = (data) => {
    console.log("Auction completed:", data);

    setAuctionStatus("completed");

    toast.success("Auction completed");
  };

  useAuctionSocket({
    auctionId: id,
    onAuctionStarted: handleAuctionStarted,
    onAuctionPaused: handleAuctionPaused,
    onAuctionResumed: handleAuctionResumed,
    onPlayerStarted: handlePlayerStarted,
    onBid: handleSocketBid,
    onPlayerSold: handlePlayerSold,
    onPlayerUnsold: handlePlayerUnsold,
    onNextPlayer: handleNextPlayer,
    onAuctionCompleted: handleAuctionCompleted,
    onNotification: handleNotification,
  });

  const handleNotification = (data) => {
    console.log("Auction notification:", data);

    const message =
      data?.message || data?.notification?.message || "Auction update received";

    toast(message);
  };
  useEffect(() => {
    loadAuctions();
  }, []);

  const liveAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const status = String(auction?.status || "").toLowerCase();

      return ["live", "started", "running", "active", "in-progress"].includes(
        status,
      );
    });
  }, [auctions]);

  const upcomingAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const status = String(auction?.status || "").toLowerCase();

      return ["upcoming", "scheduled", "pending"].includes(status);
    });
  }, [auctions]);

  const getStatus = (auction) => {
    const status = String(auction?.status || "").toLowerCase();

    if (
      ["live", "started", "running", "active", "in-progress"].includes(status)
    ) {
      return "LIVE";
    }

    if (["upcoming", "scheduled", "pending"].includes(status)) {
      return "UPCOMING";
    }

    return auction?.status || "UNKNOWN";
  };

  const AuctionCard = ({ auction }) => {
    const status = getStatus(auction);

    const auctionId = auction?._id || auction?.id;

    return (
      <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-navy-700 dark:bg-navy-900">
        {/* Top */}
        <div className="relative border-b border-gray-200 p-5 dark:border-navy-700">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                {status === "LIVE" ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>

                    <span className="text-xs font-bold tracking-wider text-red-500">
                      LIVE NOW
                    </span>
                  </>
                ) : (
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-bold tracking-wide text-cyan-500">
                    UPCOMING
                  </span>
                )}
              </div>

              <h2 className="truncate text-xl font-bold text-navy-950 dark:text-white">
                {auction?.name || auction?.title || "Cricket Player Auction"}
              </h2>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {auction?.description ||
                  "Join the AuctionPro cricket player auction and experience real-time bidding."}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <FiRadio size={21} />
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="grid grid-cols-2 gap-3 p-5">
          <div className="rounded-xl bg-gray-50 p-3 dark:bg-navy-850">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FiCalendar size={15} />

              <span className="text-xs">Date</span>
            </div>

            <p className="mt-1 text-sm font-semibold text-navy-950 dark:text-white">
              {auction?.startTime || auction?.startDate || auction?.date
                ? formatDate(
                    auction?.startTime || auction?.startDate || auction?.date,
                  )
                : "Not scheduled"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 dark:bg-navy-850">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FiClock size={15} />

              <span className="text-xs">Status</span>
            </div>

            <p className="mt-1 text-sm font-semibold text-navy-950 dark:text-white">
              {status}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-navy-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Base Price
            </p>

            <p className="mt-1 text-sm font-bold text-navy-950 dark:text-white">
              {auction?.basePrice != null
                ? formatCurrency(auction.basePrice)
                : "—"}
            </p>
          </div>

          <Link
            to={
              status === "LIVE"
                ? `/live-auctions/${auctionId}`
                : `/auctions/${auctionId}`
            }
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-cyan-400"
          >
            {status === "LIVE" ? "Enter Live" : "View Auction"}

            <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-pitch-50 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FiActivity className="text-cyan-500" />

              <span className="text-sm font-semibold uppercase tracking-widest text-cyan-500">
                AuctionPro Live
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-navy-950 dark:text-white sm:text-4xl">
              Live Auctions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Watch active cricket auctions and join real-time player bidding
              sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAuctions(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:hover:bg-navy-850"
          >
            <FiRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Live section */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy-950 dark:text-white">
                Live Now
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Auctions currently accepting bids
              </p>
            </div>

            <div className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
              {liveAuctions.length} LIVE
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-navy-800"
                />
              ))}
            </div>
          ) : liveAuctions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-navy-700 dark:bg-navy-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                <FiRadio size={24} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-navy-950 dark:text-white">
                No Live Auctions
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                There are currently no active auctions. Check back when an
                administrator starts an auction.
              </p>

              <Link
                to="/auctions"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 hover:text-cyan-400"
              >
                Browse Auctions
                <FiArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {liveAuctions.map((auction) => (
                <AuctionCard
                  key={auction?._id || auction?.id}
                  auction={auction}
                />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-navy-950 dark:text-white">
              Upcoming Auctions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get ready for the next bidding sessions
            </p>
          </div>

          {upcomingAuctions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-navy-700 dark:bg-navy-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming auctions available.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingAuctions.map((auction) => (
                <AuctionCard
                  key={auction?._id || auction?.id}
                  auction={auction}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
