import React, { useCallback, useEffect, useState } from "react";

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
  FiSkipForward,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import useSocket from "../hooks/useSocket";
import useAuctionEvents from "../hooks/useAuctionEvents";

import { getAuctionById } from "../api/auctionApi";

import {
  startAuction,
  pauseAuction,
  resumeAuction,
  getAuctionSession,
  startNextPlayer,
  completeCurrentPlayer,
  completeAuction,
} from "../api/auctionControlApi";

import { startBidding, sellPlayer, markPlayerUnsold } from "../api/biddingApi";

import PageLoader from "../components/PageLoader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import { formatCurrency } from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";

/* =========================================================
   HELPERS
========================================================= */

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

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || value?.playerId || null;
};

const getPlayer = (data) => {
  return data?.player || data?.currentPlayer || data?.currentPlayerData || null;
};

const getBidAmount = (data) => {
  return (
    data?.amount ||
    data?.bidAmount ||
    data?.currentBid ||
    data?.highestBid ||
    data?.finalBid ||
    data?.soldPrice ||
    data?.price ||
    0
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const AdminAuctionControl = () => {
  const { auctionId } = useParams();

  const { socket, connected } = useSocket();

  /* =====================================================
       STATE
    ===================================================== */

  const [auction, setAuction] = useState(null);
  const [session, setSession] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const [currentBid, setCurrentBid] = useState(0);

  const [status, setStatus] = useState("waiting");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
       LOAD AUCTION
    ===================================================== */

  const loadAuction = useCallback(async () => {
    const response = await getAuctionById(auctionId);

    const data = extractData(response);

    setAuction(data);

    if (data?.status) {
      setStatus(data.status);
    }

    return data;
  }, [auctionId]);

  /* =====================================================
       LOAD SESSION
    ===================================================== */

  const loadSession = useCallback(async () => {
    try {
      const response = await getAuctionSession(auctionId);

      const data = extractData(response);

      setSession(data);

      const player = getPlayer(data);

      if (player) {
        setCurrentPlayer(player);
      }

      const bid = getBidAmount(data);

      if (bid) {
        setCurrentBid(Number(bid));
      }

      if (data?.status) {
        setStatus(data.status);
      }

      return data;
    } catch (err) {
      /*
       * A session may not exist before
       * the auction has been started.
       */

      console.warn("Auction session not available:", err);

      return null;
    }
  }, [auctionId]);

  /* =====================================================
       LOAD EVERYTHING
    ===================================================== */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([loadAuction(), loadSession()]);
    } catch (err) {
      console.error("Failed to load auction control:", err);

      setError(err?.response?.data?.message || "Failed to load auction.");
    } finally {
      setLoading(false);
    }
  }, [loadAuction, loadSession]);

  useEffect(() => {
    if (auctionId) {
      loadData();
    }
  }, [auctionId, loadData]);

  /* =====================================================
       JOIN AUCTION ROOM
    ===================================================== */

  useEffect(() => {
    if (!socket || !connected || !auctionId) {
      return;
    }

    socket.emit("auction:join", {
      auctionId,
    });

    return () => {
      socket.emit("auction:leave", {
        auctionId,
      });
    };
  }, [socket, connected, auctionId]);

  /* =====================================================
       AUCTION STARTED
    ===================================================== */

  const handleAuctionStarted = useCallback((data) => {
    setStatus("live");

    if (data?.auction) {
      setAuction((previous) => ({
        ...previous,
        ...data.auction,
      }));
    }

    if (data?.session) {
      setSession(data.session);
    }

    toast.success("Auction started");
  }, []);

  /* =====================================================
       AUCTION PAUSED
    ===================================================== */

  const handleAuctionPaused = useCallback(() => {
    setStatus("paused");

    toast("Auction paused", {
      icon: "⏸️",
    });
  }, []);

  /* =====================================================
       AUCTION RESUMED
    ===================================================== */

  const handleAuctionResumed = useCallback(() => {
    setStatus("live");

    toast.success("Auction resumed");
  }, []);

  /* =====================================================
       PLAYER STARTED
    ===================================================== */

  const handlePlayerStarted = useCallback((data) => {
    const player = getPlayer(data);

    if (player) {
      setCurrentPlayer(player);
    }

    const bid = getBidAmount(data);

    setCurrentBid(Number(bid || 0));

    setStatus("live");

    toast.success("Player started");
  }, []);

  /* =====================================================
       NEW BID
    ===================================================== */

  const handleBidNew = useCallback((data) => {
    const amount = getBidAmount(data);

    if (amount) {
      setCurrentBid(Number(amount));
    }
  }, []);

  /* =====================================================
       PLAYER SOLD
    ===================================================== */

  const handlePlayerSold = useCallback((data) => {
    const amount = getBidAmount(data);

    if (amount) {
      setCurrentBid(Number(amount));
    }

    setStatus("player-sold");

    toast.success("Player sold");
  }, []);

  /* =====================================================
       PLAYER UNSOLD
    ===================================================== */

  const handlePlayerUnsold = useCallback(() => {
    setStatus("player-unsold");

    toast("Player marked unsold", {
      icon: "❌",
    });
  }, []);

  /* =====================================================
       NEXT PLAYER
    ===================================================== */

  const handleNextPlayer = useCallback((data) => {
    const player = getPlayer(data);

    if (player) {
      setCurrentPlayer(player);
    }

    const bid = getBidAmount(data);

    setCurrentBid(Number(bid || 0));

    setStatus("live");
  }, []);

  /* =====================================================
       AUCTION COMPLETED
    ===================================================== */

  const handleAuctionCompleted = useCallback(() => {
    setStatus("completed");

    toast.success("Auction completed");
  }, []);

  /* =====================================================
       SOCKET EVENTS
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
       ACTION HELPER
    ===================================================== */

  const executeAction = async (action, successMessage) => {
    if (processing) {
      return;
    }

    try {
      setProcessing(true);

      await action();

      toast.success(successMessage);

      await loadData();
    } catch (err) {
      console.error("Auction control action failed:", err);

      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  /* =====================================================
       START AUCTION
    ===================================================== */

  const handleStartAuction = () => {
    executeAction(
      () =>
        startAuction({
          auctionId,
        }),
      "Auction started",
    );
  };

  /* =====================================================
       PAUSE
    ===================================================== */

  const handlePauseAuction = () => {
    executeAction(
      () =>
        pauseAuction({
          auctionId,
        }),
      "Auction paused",
    );
  };

  /* =====================================================
       RESUME
    ===================================================== */

  const handleResumeAuction = () => {
    executeAction(
      () =>
        resumeAuction({
          auctionId,
        }),
      "Auction resumed",
    );
  };

  /* =====================================================
       START NEXT PLAYER
    ===================================================== */

  const handleStartNextPlayer = () => {
    executeAction(
      () =>
        startNextPlayer({
          auctionId,
        }),
      "Next player started",
    );
  };

  /* =====================================================
       START BIDDING
    ===================================================== */

  const handleStartBidding = () => {
    const playerId = getId(currentPlayer);

    if (!playerId) {
      toast.error("No current player available.");

      return;
    }

    executeAction(
      () =>
        startBidding({
          auctionId,
          playerId,
        }),
      "Bidding started",
    );
  };

  /* =====================================================
       SELL PLAYER
    ===================================================== */

  const handleSellPlayer = () => {
    const playerId = getId(currentPlayer);

    if (!playerId) {
      toast.error("No current player available.");

      return;
    }

    if (currentBid <= 0) {
      toast.error("There is no valid bid to sell.");

      return;
    }

    executeAction(
      () =>
        sellPlayer({
          auctionId,
          playerId,
          amount: currentBid,
        }),
      "Player sold successfully",
    );
  };

  /* =====================================================
       UNSOLD PLAYER
    ===================================================== */

  const handleUnsoldPlayer = () => {
    const playerId = getId(currentPlayer);

    if (!playerId) {
      toast.error("No current player available.");

      return;
    }

    executeAction(
      () =>
        markPlayerUnsold({
          auctionId,
          playerId,
        }),
      "Player marked unsold",
    );
  };

  /* =====================================================
       COMPLETE CURRENT PLAYER
    ===================================================== */

  const handleCompletePlayer = () => {
    executeAction(
      () =>
        completeCurrentPlayer({
          auctionId,
        }),
      "Current player completed",
    );
  };

  /* =====================================================
       COMPLETE AUCTION
    ===================================================== */

  const handleCompleteAuction = () => {
    const confirmed = window.confirm(
      "Are you sure you want to complete this auction? This action should only be performed after all players have been processed.",
    );

    if (!confirmed) {
      return;
    }

    executeAction(
      () =>
        completeAuction({
          auctionId,
        }),
      "Auction completed",
    );
  };

  /* =====================================================
       REFRESH
    ===================================================== */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadData();

      toast.success("Auction data refreshed");
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

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
       AUCTION NOT FOUND
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
       BUTTON STATES
    ===================================================== */

  const auctionStarted =
    status === "live" ||
    status === "paused" ||
    status === "player-sold" ||
    status === "player-unsold";

  const canPause = status === "live";

  const canResume = status === "paused";

  const canStartPlayer =
    auctionStarted && !currentPlayer && status !== "completed";

  const canStartBidding = Boolean(currentPlayer) && status === "live";

  const canSell = Boolean(currentPlayer) && currentBid > 0 && status === "live";

  const canUnsold = Boolean(currentPlayer) && status === "live";

  /* =====================================================
       RENDER
    ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* =================================================
                HEADER
            ================================================= */}

      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={`/auctions/${auctionId}`}
                className="
                                    flex
                                    h-10
                                    w-10
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
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Admin Control
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
              <div
                className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    ${
                                      connected
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                    }
                                `}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                {connected ? "Socket Connected" : "Socket Disconnected"}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || processing}
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
                                    font-semibold
                                    text-gray-700
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
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
                CONTENT
            ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =============================================
                    STATUS
                ============================================= */}

        <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Auction status
              </p>

              <div className="mt-1 flex items-center gap-3">
                <span
                  className={`
                                        inline-flex
                                        rounded-full
                                        px-3
                                        py-1
                                        text-sm
                                        font-bold
                                        capitalize
                                        ${
                                          status === "live"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                            : status === "paused"
                                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                              : status === "completed"
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        }
                                    `}
                >
                  {status.replace("-", " ")}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current bid
              </p>

              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {formatCurrency(currentBid)}
              </p>
            </div>
          </div>
        </div>

        {/* =============================================
                    CURRENT PLAYER
                ============================================= */}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {currentPlayer ? (
                <>
                  <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Current Player
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                          {currentPlayer.name ||
                            currentPlayer.fullName ||
                            "Player"}
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <FiUser className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Player ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {getId(currentPlayer) || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Base Price
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          currentPlayer.minimumBid ||
                            currentPlayer.basePrice ||
                            auction.minimumBid ||
                            0,
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Current Bid
                      </p>

                      <p className="mt-1 text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(currentBid)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Bid Increment
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(auction.bidIncrement || 0)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center p-8">
                  <EmptyState
                    title="No active player"
                    message="Start the next player when the auction is ready."
                    icon={<FiUser className="h-8 w-8" />}
                  />
                </div>
              )}
            </div>
          </div>

          {/* =========================================
                        QUICK SUMMARY
                    ========================================= */}

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FiDollarSign />
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Starting Budget
                  </p>

                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(auction.startingBudget || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <FiUsers />
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Maximum Teams
                  </p>

                  <p className="font-bold text-gray-900 dark:text-white">
                    {auction.maxTeams || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <FiFlag />
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum Bid
                  </p>

                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(auction.minimumBid || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================
                    CONTROL CENTER
                ============================================= */}

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Auction Controls
            </p>

            <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white">
              Manage Live Auction
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Control the auction lifecycle and manage the current player.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* START AUCTION */}

            {!auctionStarted && status !== "completed" && (
              <button
                type="button"
                onClick={handleStartAuction}
                disabled={processing}
                className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-2xl
                                        bg-emerald-600
                                        px-5
                                        py-3
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-emerald-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
              >
                <FiPlay />
                Start Auction
              </button>
            )}

            {/* PAUSE */}

            {canPause && (
              <button
                type="button"
                onClick={handlePauseAuction}
                disabled={processing}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-amber-500
                                    px-5
                                    py-3
                                    font-bold
                                    text-white
                                    hover:bg-amber-600
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <FiPause />
                Pause Auction
              </button>
            )}

            {/* RESUME */}

            {canResume && (
              <button
                type="button"
                onClick={handleResumeAuction}
                disabled={processing}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-emerald-600
                                    px-5
                                    py-3
                                    font-bold
                                    text-white
                                    hover:bg-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <FiPlay />
                Resume Auction
              </button>
            )}

            {/* NEXT PLAYER */}

            {auctionStarted && status !== "completed" && (
              <button
                type="button"
                onClick={handleStartNextPlayer}
                disabled={processing || Boolean(currentPlayer)}
                className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-2xl
                                        bg-indigo-600
                                        px-5
                                        py-3
                                        font-bold
                                        text-white
                                        hover:bg-indigo-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
              >
                <FiSkipForward />
                Next Player
              </button>
            )}

            {/* START BIDDING */}

            {currentPlayer && (
              <button
                type="button"
                onClick={handleStartBidding}
                disabled={processing || !canStartBidding}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-blue-600
                                    px-5
                                    py-3
                                    font-bold
                                    text-white
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <FiFlag />
                Start Bidding
              </button>
            )}

            {/* SELL */}

            {currentPlayer && (
              <button
                type="button"
                onClick={handleSellPlayer}
                disabled={processing || !canSell}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-emerald-600
                                    px-5
                                    py-3
                                    font-bold
                                    text-white
                                    hover:bg-emerald-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <FiCheckCircle />
                Sell Player
              </button>
            )}

            {/* UNSOLD */}

            {currentPlayer && (
              <button
                type="button"
                onClick={handleUnsoldPlayer}
                disabled={processing || !canUnsold}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-red-600
                                    px-5
                                    py-3
                                    font-bold
                                    text-white
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
              >
                <FiXCircle />
                Mark Unsold
              </button>
            )}

            {/* COMPLETE PLAYER */}

            {currentPlayer && (
              <button
                type="button"
                onClick={handleCompletePlayer}
                disabled={processing}
                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-gray-300
                                    bg-white
                                    px-5
                                    py-3
                                    font-bold
                                    text-gray-700
                                    hover:bg-gray-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    dark:border-gray-700
                                    dark:bg-gray-900
                                    dark:text-gray-200
                                    dark:hover:bg-gray-800
                                "
              >
                <FiCheckCircle />
                Complete Player
              </button>
            )}

            {/* COMPLETE AUCTION */}

            {auctionStarted && status !== "completed" && (
              <button
                type="button"
                onClick={handleCompleteAuction}
                disabled={processing}
                className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-2xl
                                        border
                                        border-red-300
                                        bg-red-50
                                        px-5
                                        py-3
                                        font-bold
                                        text-red-700
                                        hover:bg-red-100
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        dark:border-red-900/50
                                        dark:bg-red-500/10
                                        dark:text-red-400
                                    "
              >
                <FiCheckCircle />
                Complete Auction
              </button>
            )}
          </div>
        </section>

        {/* =============================================
                    PROCESSING INDICATOR
                ============================================= */}

        {processing && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FiRefreshCw className="animate-spin" />
            Processing auction action...
          </div>
        )}

        {/* =============================================
                    SOCKET WARNING
                ============================================= */}

        {!connected && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-500/10">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Socket disconnected
              </p>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                Real-time auction events will not update until the Socket.IO
                connection is restored.
              </p>
            </div>
          </div>
        )}

        {/* =============================================
                    SESSION INFORMATION
                ============================================= */}

        {session && (
          <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <FiClock />
              </div>

              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Auction Session
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current live auction session information
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Session Status
                </p>

                <p className="mt-1 font-semibold capitalize text-gray-900 dark:text-white">
                  {session.status || status}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Player
                </p>

                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {currentPlayer?.name || currentPlayer?.fullName || "None"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Bid
                </p>

                <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(currentBid)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auction ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                  {auctionId}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminAuctionControl;
