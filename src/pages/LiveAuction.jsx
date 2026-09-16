import { useCallback, useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { FiArrowLeft, FiWifi, FiWifiOff } from "react-icons/fi";

import toast from "react-hot-toast";

import { getAuctionSession } from "../api/auctionControlApi";

import { getCurrentBid, getBidHistory } from "../api/biddingApi";

import LivePlayerCard from "../components/LivePlayerCard";
import BidPanel from "../components/BidPanel";
import BidHistory from "../components/BidHistory";

import useSocket from "../hooks/useSocket";
import useAuctionEvents from "../hooks/useAuctionEvents";

import { useAuth } from "../context/AuthContext";

const getId = (value) => {
  if (!value) {
    return "";
  }

  return String(value._id || value.id || "");
};

const getPlayer = (data) => {
  if (!data) {
    return null;
  }

  return (
    data.player ||
    data.currentPlayer ||
    data.data?.player ||
    data.data?.currentPlayer ||
    null
  );
};

const getBidAmount = (data) => {
  if (!data) {
    return 0;
  }

  return Number(
    data.amount ||
      data.bid?.amount ||
      data.currentBid ||
      data.player?.currentBid ||
      data.data?.amount ||
      data.data?.currentBid ||
      0,
  );
};

const getBids = (data) => {
  if (!data) {
    return [];
  }

  return (
    data.bids ||
    data.bidHistory ||
    data.history ||
    data.data?.bids ||
    data.data?.bidHistory ||
    []
  );
};

const LiveAuction = () => {
  const { auctionId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { connected } = useSocket();

  const [session, setSession] = useState(null);

  const [currentPlayer, setCurrentPlayer] = useState(null);

  const [currentBid, setCurrentBid] = useState(0);

  const [bidHistory, setBidHistory] = useState([]);

  const [status, setStatus] = useState("loading");

  const [loading, setLoading] = useState(true);

  /*
   * Team information.
   *
   * Different auth implementations may store
   * team information under different properties.
   */
  const team = user?.team || user?.currentTeam || user?.teamDetails || null;

  /*
   * -------------------------------------------------
   * Load current auction state
   * -------------------------------------------------
   */
  const loadAuction = useCallback(async () => {
    if (!auctionId) {
      toast.error("Auction ID is missing.");

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const sessionResponse = await getAuctionSession(auctionId);

      const sessionData = sessionResponse?.data || sessionResponse;

      setSession(sessionData);

      setStatus(sessionData?.status || "waiting");

      const currentResponse = await getCurrentBid(auctionId).catch(() => null);

      if (currentResponse) {
        const player = getPlayer(currentResponse);

        setCurrentPlayer(player);

        setCurrentBid(getBidAmount(currentResponse));

        if (player) {
          const playerId = getId(player);

          if (playerId) {
            const historyResponse = await getBidHistory(playerId).catch(
              () => null,
            );

            if (historyResponse) {
              setBidHistory(getBids(historyResponse));
            }
          }
        }
      }
    } catch (error) {
      console.error("Load live auction error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load auction.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  /*
   * Initial load.
   */
  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  /*
   * -------------------------------------------------
   * Auction started
   * -------------------------------------------------
   */
  const handleAuctionStarted = useCallback((data) => {
    setStatus(data?.status || data?.session?.status || "live");

    if (data?.session) {
      setSession((previous) => ({
        ...previous,
        ...data.session,
      }));
    }
  }, []);

  /*
   * -------------------------------------------------
   * Pause
   * -------------------------------------------------
   */
  const handleAuctionPaused = useCallback((data) => {
    setStatus("paused");

    if (data?.session) {
      setSession((previous) => ({
        ...previous,
        ...data.session,
      }));
    }
  }, []);

  /*
   * -------------------------------------------------
   * Resume
   * -------------------------------------------------
   */
  const handleAuctionResumed = useCallback((data) => {
    setStatus(data?.status || "player_auction");
  }, []);

  /*
   * -------------------------------------------------
   * Player started
   * -------------------------------------------------
   */
  const handlePlayerStarted = useCallback((data) => {
    const player = getPlayer(data);

    if (!player) {
      return;
    }

    setCurrentPlayer(player);

    setCurrentBid(getBidAmount(data));

    setBidHistory([]);

    setStatus(data?.status || "player_auction");

    const playerId = getId(player);

    if (playerId) {
      getBidHistory(playerId)
        .then((response) => {
          setBidHistory(getBids(response));
        })
        .catch(() => {
          setBidHistory([]);
        });
    }
  }, []);

  /*
   * -------------------------------------------------
   * New bid
   * -------------------------------------------------
   */
  const handleBidNew = useCallback((data) => {
    const amount = getBidAmount(data);

    if (amount > 0) {
      setCurrentBid(amount);
    }

    const incomingBids = getBids(data);

    if (incomingBids.length > 0) {
      setBidHistory(incomingBids);

      return;
    }

    /*
     * If backend sends only the
     * new bid, append it.
     */
    if (data?.bid) {
      setBidHistory((previous) => [data.bid, ...previous]);
    } else if (data) {
      setBidHistory((previous) => [data, ...previous]);
    }
  }, []);

  /*
   * -------------------------------------------------
   * Next player
   * -------------------------------------------------
   */
  const handleNextPlayer = useCallback((data) => {
    const player = getPlayer(data);

    if (player) {
      setCurrentPlayer(player);

      setCurrentBid(getBidAmount(data));
    }

    setBidHistory([]);

    setStatus(data?.status || data?.auctionSession?.status || "player_auction");

    if (data?.auctionSession) {
      setSession((previous) => ({
        ...previous,
        ...data.auctionSession,
      }));
    }

    const playerId = getId(player);

    if (playerId) {
      getBidHistory(playerId)
        .then((response) => {
          setBidHistory(getBids(response));
        })
        .catch(() => {
          setBidHistory([]);
        });
    }
  }, []);

  /*
   * -------------------------------------------------
   * Sold
   * -------------------------------------------------
   */
  const handlePlayerSold = useCallback((data) => {
    const amount = getBidAmount(data);

    if (amount > 0) {
      setCurrentBid(amount);
    }

    setStatus("player-sold");
  }, []);

  /*
   * -------------------------------------------------
   * Unsold
   * -------------------------------------------------
   */
  const handlePlayerUnsold = useCallback(() => {
    setStatus("player-unsold");
  }, []);

  /*
   * -------------------------------------------------
   * Completed
   * -------------------------------------------------
   */
  const handleAuctionCompleted = useCallback(() => {
    setStatus("completed");

    toast.success("Auction completed.");
  }, []);

  /*
   * Register all socket events.
   */
  useAuctionEvents({
    auctionId,

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

  /*
   * -------------------------------------------------
   * Loading
   * -------------------------------------------------
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">Loading live auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <FiArrowLeft />
            Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Live Auction
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Watch the auction and place your bids in real time.
          </p>
        </div>

        {/* Connection */}
        <div
          className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            connected
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {connected ? <FiWifi /> : <FiWifiOff />}

          {connected ? "Live Connected" : "Disconnected"}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Auction Status
            </p>

            <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-white">
              {String(status).replace(/-/g, " ")}
            </p>
          </div>

          {session?.currentPlayer && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Player currently selected
            </p>
          )}
        </div>
      </div>

      {/* Completed */}
      {status === "completed" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Auction Completed
          </h2>

          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500">
            This auction has been completed by the administrator.
          </p>
        </div>
      )}

      {/* Player */}
      {status !== "completed" && (
        <LivePlayerCard
          player={currentPlayer}
          currentBid={currentBid}
          status={status}
        />
      )}

      {/* Bidding */}
      {status !== "completed" && currentPlayer && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <BidHistory bids={bidHistory} currentBid={currentBid} />

          <BidPanel
            auctionId={auctionId}
            player={currentPlayer}
            team={team}
            currentBid={currentBid}
            bidIncrement={
              session?.bidIncrement || session?.auction?.bidIncrement || 10000
            }
            auctionStatus={status}
          />
        </div>
      )}

      {/* Waiting */}
      {!currentPlayer && status !== "completed" && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Waiting for the administrator to start the next player.
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Keep this page open. The player will appear automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveAuction;
