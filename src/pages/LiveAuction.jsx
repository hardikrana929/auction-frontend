import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFlag,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import useAuctionEvents from "../hooks/useAuctionEvents";

import { getAuctionById } from "../api/auctionApi";

import { getCurrentBid, getBidHistory, placeBid } from "../api/biddingApi";

import { getAuctionSession } from "../api/auctionControlApi";

import LivePlayerCard from "../components/LivePlayerCard";
import BidPanel from "../components/BidPanel";
import BidHistory from "../components/BidHistory";
import AuctionConnectionStatus from "../components/AuctionConnectionStatus";

import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

import { formatCurrency } from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || value?.playerId || value?.teamId || null;
};

const extractData = (response) => {
  if (!response) {
    return null;
  }

  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
};

const getPlayerFromResponse = (response) => {
  const data = extractData(response);

  return (
    data?.player ||
    data?.currentPlayer ||
    data?.currentPlayerData ||
    data ||
    null
  );
};

const getCurrentBidFromResponse = (response) => {
  const data = extractData(response);

  if (!data) {
    return null;
  }

  if (typeof data === "number") {
    return data;
  }

  return (
    data?.currentBid ||
    data?.highestBid ||
    data?.amount ||
    data?.bidAmount ||
    data?.price ||
    null
  );
};

const getHistoryFromResponse = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  return data?.bids || data?.history || data?.bidHistory || [];
};

/* =========================================================
   COMPONENT
========================================================= */

const LiveAuction = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  /* =====================================================
       SOCKET
    ===================================================== */

  const { socket, connected } = useSocket();

  /* =====================================================
       STATE
    ===================================================== */

  const [auction, setAuction] = useState(null);

  const [currentPlayer, setCurrentPlayer] = useState(null);

  const [currentBid, setCurrentBid] = useState(null);

  const [bidHistory, setBidHistory] = useState([]);

  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [bidding, setBidding] = useState(false);

  const [error, setError] = useState("");

  const [auctionStatus, setAuctionStatus] = useState("waiting");

  /* =====================================================
       USER / ROLE
    ===================================================== */

  const userRole = user?.role || user?.user?.role || "";

  const isAdmin = String(userRole).toLowerCase() === "admin";

  /* =====================================================
       JOIN AUCTION ROOM
    ===================================================== */

  useEffect(() => {
    if (!socket || !connected || !auctionId) {
      return;
    }

    console.log("Joining auction room:", auctionId);

    socket.emit("auction:join", {
      auctionId,
    });

    return () => {
      console.log("Leaving auction room:", auctionId);

      socket.emit("auction:leave", {
        auctionId,
      });
    };
  }, [socket, connected, auctionId]);

  /* =====================================================
       LOAD AUCTION
    ===================================================== */

  const loadAuction = useCallback(async () => {
    if (!auctionId) {
      return;
    }

    try {
      const response = await getAuctionById(auctionId);

      const data = extractData(response);

      setAuction(data);
    } catch (err) {
      console.error("Failed to load auction:", err);

      throw err;
    }
  }, [auctionId]);

  /* =====================================================
       LOAD SESSION
    ===================================================== */

  const loadSession = useCallback(async () => {
    if (!auctionId) {
      return;
    }

    try {
      const response = await getAuctionSession(auctionId);

      const data = extractData(response);

      setSession(data);

      if (data?.status) {
        setAuctionStatus(data.status);
      }
    } catch (err) {
      /*
       * Session may not exist before
       * the admin starts the auction.
       */

      console.warn("Auction session unavailable:", err);
    }
  }, [auctionId]);

  /* =====================================================
       LOAD CURRENT BID
    ===================================================== */

  const loadCurrentBid = useCallback(async () => {
    if (!auctionId) {
      return;
    }

    try {
      const response = await getCurrentBid(auctionId);

      const data = extractData(response);

      const player = getPlayerFromResponse(response);

      const bid = getCurrentBidFromResponse(response);

      if (player) {
        setCurrentPlayer(player);
      }

      if (bid !== null && bid !== undefined) {
        setCurrentBid(Number(bid));
      }
    } catch (err) {
      console.warn("Current bid unavailable:", err);
    }
  }, [auctionId]);

  /* =====================================================
       LOAD BID HISTORY
    ===================================================== */

  const loadBidHistory = useCallback(async () => {
    const playerId = getId(currentPlayer);

    if (!playerId) {
      setBidHistory([]);
      return;
    }

    try {
      const response = await getBidHistory(playerId);

      setBidHistory(getHistoryFromResponse(response));
    } catch (err) {
      console.warn("Failed to load bid history:", err);

      setBidHistory([]);
    }
  }, [currentPlayer]);

  /* =====================================================
       INITIAL DATA
    ===================================================== */

  const loadData = useCallback(async () => {
    if (!auctionId) {
      setError("Auction ID is missing.");

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await Promise.all([loadAuction(), loadSession(), loadCurrentBid()]);
    } catch (err) {
      console.error("Failed to load live auction:", err);

      setError(err?.response?.data?.message || "Failed to load auction.");
    } finally {
      setLoading(false);
    }
  }, [auctionId, loadAuction, loadSession, loadCurrentBid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =====================================================
       LOAD HISTORY WHEN PLAYER CHANGES
    ===================================================== */

  useEffect(() => {
    loadBidHistory();
  }, [loadBidHistory]);

  /* =====================================================
       SOCKET EVENT: AUCTION STARTED
    ===================================================== */

  const handleAuctionStarted = useCallback((data) => {
    console.log("Auction started:", data);

    setAuctionStatus("live");

    if (data?.auction) {
      setAuction((previous) => ({
        ...previous,
        ...data.auction,
      }));
    }

    toast.success("Auction has started");
  }, []);

  /* =====================================================
       SOCKET EVENT: AUCTION PAUSED
    ===================================================== */

  const handleAuctionPaused = useCallback(() => {
    setAuctionStatus("paused");

    toast("Auction paused", {
      icon: "⏸️",
    });
  }, []);

  /* =====================================================
       SOCKET EVENT: AUCTION RESUMED
    ===================================================== */

  const handleAuctionResumed = useCallback(() => {
    setAuctionStatus("live");

    toast.success("Auction resumed");
  }, []);

  /* =====================================================
       SOCKET EVENT: PLAYER STARTED
    ===================================================== */

  const handlePlayerStarted = useCallback((data) => {
    console.log("Player started:", data);

    const player = data?.player || data?.currentPlayer || data;

    if (player) {
      setCurrentPlayer(player);
    }

    const startingBid =
      data?.currentBid ||
      data?.startingBid ||
      data?.minimumBid ||
      player?.minimumBid ||
      null;

    if (startingBid !== null && startingBid !== undefined) {
      setCurrentBid(Number(startingBid));
    } else {
      setCurrentBid(null);
    }

    setBidHistory([]);

    setAuctionStatus("live");

    toast.success("New player is now up for bidding");
  }, []);

  /* =====================================================
       SOCKET EVENT: NEW BID
    ===================================================== */

  const handleBidNew = useCallback((data) => {
    console.log("New bid:", data);

    const amount =
      data?.amount ||
      data?.bidAmount ||
      data?.currentBid ||
      data?.highestBid ||
      data?.bid?.amount ||
      null;

    if (amount !== null && amount !== undefined) {
      setCurrentBid(Number(amount));
    }

    const newBid = data?.bid || data;

    if (newBid) {
      setBidHistory((previous) => [newBid, ...previous]);
    }
  }, []);

  /* =====================================================
       SOCKET EVENT: PLAYER SOLD
    ===================================================== */

  const handlePlayerSold = useCallback((data) => {
    console.log("Player sold:", data);

    setAuctionStatus("player-sold");

    const soldPrice =
      data?.soldPrice || data?.price || data?.amount || data?.finalBid || null;

    if (soldPrice !== null && soldPrice !== undefined) {
      setCurrentBid(Number(soldPrice));
    }

    toast.success("Player sold!");
  }, []);

  /* =====================================================
       SOCKET EVENT: PLAYER UNSOLD
    ===================================================== */

  const handlePlayerUnsold = useCallback(() => {
    console.log("Player unsold");

    setAuctionStatus("player-unsold");

    toast("Player went unsold", {
      icon: "❌",
    });
  }, []);

  /* =====================================================
       SOCKET EVENT: NEXT PLAYER
    ===================================================== */

  const handleNextPlayer = useCallback((data) => {
    console.log("Next player:", data);

    const player = data?.player || data?.currentPlayer || null;

    if (player) {
      setCurrentPlayer(player);
    }

    const startingBid =
      data?.currentBid ||
      data?.startingBid ||
      data?.minimumBid ||
      player?.minimumBid ||
      null;

    setCurrentBid(startingBid !== null ? Number(startingBid) : null);

    setBidHistory([]);

    setAuctionStatus("live");
  }, []);

  /* =====================================================
       SOCKET EVENT: AUCTION COMPLETED
    ===================================================== */

  const handleAuctionCompleted = useCallback(() => {
    console.log("Auction completed");

    setAuctionStatus("completed");

    toast.success("Auction completed");
  }, []);

  /* =====================================================
       AUCTION SOCKET EVENTS
    ===================================================== */

  useAuctionEvents({
    socket,
    enabled: Boolean(socket) && Boolean(connected),

    onAuctionStarted: handleAuctionStarted,

    onAuctionPaused: handleAuctionPaused,

    onAuctionResumed: handleAuctionResumed,

    onPlayerStarted: handlePlayerStarted,

    onBidNew: handleBidNew,

    onPlayerSold: handlePlayerSold,

    onPlayerUnsold: handlePlayerUnsold,

    onNextPlayer: handleNextPlayer,

    onAuctionCompleted: handleAuctionCompleted,
  });

  /* =====================================================
       PLACE BID
    ===================================================== */

  const handlePlaceBid = async (amount) => {
    if (!currentPlayer) {
      toast.error("No player is currently available.");

      return;
    }

    if (auctionStatus !== "live") {
      toast.error("Bidding is not currently active.");

      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid bid amount.");

      return;
    }

    try {
      setBidding(true);

      const playerId = getId(currentPlayer);

      await placeBid({
        auctionId,
        playerId,
        amount: Number(amount),
      });

      /*
       * Normally the socket event will
       * update the current bid.
       *
       * Refresh as a fallback.
       */

      await loadCurrentBid();
      await loadBidHistory();

      toast.success("Bid placed successfully");
    } catch (err) {
      console.error("Failed to place bid:", err);

      toast.error(err?.response?.data?.message || "Failed to place bid");
    } finally {
      setBidding(false);
    }
  };

  /* =====================================================
       REFRESH
    ===================================================== */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadData();
      await loadBidHistory();

      toast.success("Auction refreshed");
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  /* =====================================================
       DERIVED VALUES
    ===================================================== */

  const minimumBid = useMemo(() => {
    if (currentPlayer?.minimumBid !== undefined) {
      return Number(currentPlayer.minimumBid);
    }

    if (auction?.minimumBid !== undefined) {
      return Number(auction.minimumBid);
    }

    return 0;
  }, [currentPlayer, auction]);

  const bidIncrement = useMemo(() => {
    return Number(auction?.bidIncrement || 0);
  }, [auction]);

  const displayCurrentBid = currentBid || minimumBid || 0;

  /* =====================================================
       LOADING
    ===================================================== */

  if (loading) {
    return <PageLoader />;
  }

  /* =====================================================
       ERROR
    ===================================================== */

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <ErrorState
            title="Unable to load auction"
            message={error}
            onRetry={loadData}
          />
        </div>
      </div>
    );
  }

  /* =====================================================
       NO AUCTION
    ===================================================== */

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <EmptyState
            title="Auction not found"
            message="The requested auction could not be found."
          />
        </div>
      </div>
    );
  }

  /* =====================================================
       RENDER
    ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* =================================================
                HEADER
            ================================================= */}

      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/live-auctions"
                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-gray-200
                                    text-gray-600
                                    transition
                                    hover:bg-gray-100
                                    dark:border-gray-700
                                    dark:text-gray-300
                                    dark:hover:bg-gray-800
                                "
              >
                <FiArrowLeft />
              </Link>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Live Auction
                </p>

                <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {auction.name}
                </h1>

                {auction.date && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(auction.date)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AuctionConnectionStatus connected={connected} />

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    transition
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    dark:border-gray-700
                                    dark:bg-gray-900
                                    dark:text-gray-200
                                    dark:hover:bg-gray-800
                                "
              >
                <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              {isAdmin && (
                <Link
                  to={`/admin/auctions/${auctionId}/control`}
                  className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-indigo-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-indigo-700
                                    "
                >
                  <FiFlag />
                  Admin Control
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
                STATUS BAR
            ================================================= */}

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiPlay />
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auction Status
                </p>

                <p className="font-semibold capitalize text-gray-900 dark:text-white">
                  {auctionStatus.replace("-", " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <FiDollarSign />
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Bid
                </p>

                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(displayCurrentBid)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <FiClock />
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimum Bid
                </p>

                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(minimumBid)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <FiUsers />
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bid Increment
                </p>

                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(bidIncrement)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
                MAIN CONTENT
            ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* =========================================
                        CURRENT PLAYER
                    ========================================= */}

          <div className="lg:col-span-2">
            {currentPlayer ? (
              <LivePlayerCard
                player={currentPlayer}
                currentBid={displayCurrentBid}
                auction={auction}
                status={auctionStatus}
              />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
                <EmptyState
                  title="Waiting for player"
                  message={
                    auctionStatus === "waiting"
                      ? "The administrator has not started the next player yet."
                      : "There is currently no player available for bidding."
                  }
                  icon={<FiUsers className="h-8 w-8" />}
                />
              </div>
            )}
          </div>

          {/* =========================================
                        BID PANEL
                    ========================================= */}

          <div>
            {currentPlayer ? (
              <BidPanel
                currentBid={displayCurrentBid}
                minimumBid={minimumBid}
                bidIncrement={bidIncrement}
                onPlaceBid={handlePlaceBid}
                loading={bidding}
                disabled={auctionStatus !== "live" || isAdmin}
              />
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <FiFlag className="h-6 w-6" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  Bidding unavailable
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Waiting for the administrator to start a player.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
                    BID HISTORY
                ================================================= */}

        <div className="mt-6">
          <BidHistory bids={bidHistory} currentBid={displayCurrentBid} />
        </div>

        {/* =================================================
                    STATUS MESSAGE
                ================================================= */}

        {auctionStatus === "paused" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-500/10">
            <FiPause className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />

            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Auction paused
              </p>

              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Bidding is temporarily unavailable. Please wait for the auction
                administrator to resume the auction.
              </p>
            </div>
          </div>
        )}

        {auctionStatus === "player-sold" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-500/10">
            <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Player sold
              </p>

              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                Final bid: {formatCurrency(displayCurrentBid)}
              </p>
            </div>
          </div>
        )}

        {auctionStatus === "player-unsold" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-500/10">
            <FiXCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Player unsold
              </p>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                Waiting for the next player.
              </p>
            </div>
          </div>
        )}

        {auctionStatus === "completed" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/50 dark:bg-indigo-500/10">
            <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />

            <div>
              <p className="font-semibold text-indigo-800 dark:text-indigo-300">
                Auction completed
              </p>

              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
                This auction has been completed.
              </p>
            </div>
          </div>
        )}

        {/* =================================================
                    CONNECTION WARNING
                ================================================= */}

        {!connected && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-500/10">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Real-time connection unavailable
              </p>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                You may still see existing auction data, but live bids and
                auction events may be delayed until the socket reconnects.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveAuction;
