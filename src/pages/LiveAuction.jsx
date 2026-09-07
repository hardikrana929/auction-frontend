import { useCallback, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { toast } from "react-hot-toast";

import AuctionConnectionStatus from "../components/AuctionConnectionStatus";
import LivePlayerCard from "../components/LivePlayerCard";
import BidPanel from "../components/BidPanel";
import BidHistory from "../components/BidHistory";

import useSocket from "../hooks/useSocket";
import useAuctionSocket from "../hooks/useAuctionSocket";

import { getCurrentBid, getBidHistory } from "../api/biddingApi";

export default function LiveAuction() {
  const { id } = useParams();

  const { connected } = useSocket();

  const [currentBid, setCurrentBid] = useState(null);

  const [bidHistory, setBidHistory] = useState([]);

  const [loadingBids, setLoadingBids] = useState(true);

  const [auctionStatus, setAuctionStatus] = useState("waiting");

  /*
   * Load initial auction bidding information
   */
  useEffect(() => {
    const loadBiddingData = async () => {
      if (!id) {
        setLoadingBids(false);
        return;
      }

      setLoadingBids(true);

      try {
        const [currentResponse, historyResponse] = await Promise.all([
          getCurrentBid(id),
          getBidHistory(id),
        ]);

        const currentData =
          currentResponse?.data || currentResponse?.bid || currentResponse;

        const historyData =
          historyResponse?.data || historyResponse?.bids || historyResponse;

        setCurrentBid(currentData);

        if (Array.isArray(historyData)) {
          setBidHistory(historyData);
        } else {
          setBidHistory(historyData?.history || []);
        }
      } catch (error) {
        console.error("Unable to load bidding data:", error);

        setCurrentBid(null);
        setBidHistory([]);
      } finally {
        setLoadingBids(false);
      }
    };

    loadBiddingData();
  }, [id]);

  /*
   * Auction started
   */
  const handleAuctionStarted = useCallback((data) => {
    console.log("Auction started:", data);

    setAuctionStatus("live");

    toast.success("Auction started");
  }, []);

  /*
   * Auction paused
   */
  const handleAuctionPaused = useCallback((data) => {
    console.log("Auction paused:", data);

    setAuctionStatus("paused");

    toast("Auction paused");
  }, []);

  /*
   * Auction resumed
   */
  const handleAuctionResumed = useCallback((data) => {
    console.log("Auction resumed:", data);

    setAuctionStatus("live");

    toast.success("Auction resumed");
  }, []);

  /*
   * Player started
   */
  const handlePlayerStarted = useCallback((data) => {
    console.log("Player started:", data);

    /*
     * Do not assume backend payload structure.
     *
     * Store the event only when it clearly
     * represents a new current object.
     */
    const player = data?.player || data?.currentPlayer || null;

    if (player) {
      setCurrentBid((previous) => ({
        ...(previous || {}),
        player,
      }));
    }

    toast("New player is now available");
  }, []);

  /*
   * New bid
   */
  const handleBid = useCallback((data) => {
    console.log("New auction bid:", data);

    /*
     * Backend may send the complete bid object
     * or an envelope.
     */
    const newBid = data?.bid || data?.data || data;

    if (!newBid) {
      return;
    }

    setBidHistory((previous) => [newBid, ...previous]);

    setCurrentBid((previous) => ({
      ...(previous || {}),
      ...newBid,
    }));
  }, []);

  /*
   * Player sold
   */
  const handlePlayerSold = useCallback((data) => {
    console.log("Player sold:", data);

    setAuctionStatus("player_sold");

    toast.success("Player sold successfully");
  }, []);

  /*
   * Player unsold
   */
  const handlePlayerUnsold = useCallback((data) => {
    console.log("Player unsold:", data);

    setAuctionStatus("player_unsold");

    toast("Player marked as unsold");
  }, []);

  /*
   * Next player
   */
  const handleNextPlayer = useCallback((data) => {
    console.log("Next player:", data);

    /*
     * If backend provides the next player's
     * information, update the current player.
     */
    const player = data?.player || data?.currentPlayer || null;

    if (player) {
      setCurrentBid({
        player,
      });
    }

    setAuctionStatus("live");

    toast("Next player is ready");
  }, []);

  /*
   * Auction completed
   */
  const handleAuctionCompleted = useCallback((data) => {
    console.log("Auction completed:", data);

    setAuctionStatus("completed");

    toast.success("Auction completed");
  }, []);

  /*
   * Notification
   */
  const handleNotification = useCallback((data) => {
    console.log("Auction notification:", data);

    const message = data?.message || data?.text || "Auction update received";

    toast(message);
  }, []);

  /*
   * Connect Socket.IO and subscribe to
   * this auction's real-time events.
   */
  useAuctionSocket({
    auctionId: id,

    onAuctionStarted: handleAuctionStarted,

    onAuctionPaused: handleAuctionPaused,

    onAuctionResumed: handleAuctionResumed,

    onPlayerStarted: handlePlayerStarted,

    onBid: handleBid,

    onPlayerSold: handlePlayerSold,

    onPlayerUnsold: handlePlayerUnsold,

    onNextPlayer: handleNextPlayer,

    onAuctionCompleted: handleAuctionCompleted,

    onNotification: handleNotification,
  });

  /*
   * Extract current player information
   */
  const playerId =
    currentBid?.playerId ||
    currentBid?.player?._id ||
    currentBid?.player?.id ||
    "";

  const currentBidAmount =
    currentBid?.amount || currentBid?.currentBid || currentBid?.bidAmount || 0;

  const minimumBid = currentBid?.minimumBid || currentBid?.nextBid || 0;

  const bidIncrement = currentBid?.bidIncrement || currentBid?.increment || 0;

  const currentPlayer = currentBid?.player || currentBid?.currentPlayer || null;

  /*
   * Update local state after successful REST bid
   */
  const handleBidPlaced = useCallback((response) => {
    console.log("Bid placed:", response);

    const data = response?.data || response?.bid || response;

    setCurrentBid(data);

    toast.success("Bid placed successfully");
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-500">AuctionPro Live</p>

          <h1 className="mt-1 text-3xl font-bold text-navy-950 dark:text-white">
            Live Auction
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Auction ID: {id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auction status */}
          <AuctionStatus status={auctionStatus} />

          {/* Socket status */}
          <AuctionConnectionStatus connected={connected} />
        </div>
      </div>

      {/* Live auction */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <LivePlayerCard player={currentPlayer} />

        <BidPanel
          auctionId={id}
          playerId={playerId}
          currentBid={currentBidAmount}
          minimumBid={minimumBid}
          bidIncrement={bidIncrement}
          disabled={loadingBids || !playerId || !connected}
          disabledReason={
            loadingBids
              ? "Loading current auction information..."
              : !connected
                ? "Waiting for live auction connection..."
                : !playerId
                  ? "There is currently no active player."
                  : ""
          }
          onBidPlaced={handleBidPlaced}
        />
      </div>

      {/* Bid history */}
      <div className="mt-6">
        <BidHistory bids={bidHistory} />
      </div>
    </div>
  );
}

/*
 * Auction status badge
 */
function AuctionStatus({ status }) {
  const statusMap = {
    waiting: {
      label: "WAITING",
      className:
        "bg-gray-100 text-gray-700 dark:bg-navy-800 dark:text-gray-300",
    },

    live: {
      label: "LIVE",
      className:
        "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    },

    paused: {
      label: "PAUSED",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    },

    player_sold: {
      label: "PLAYER SOLD",
      className:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
    },

    player_unsold: {
      label: "UNSOLD",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    },

    completed: {
      label: "COMPLETED",
      className:
        "bg-gray-100 text-gray-700 dark:bg-navy-800 dark:text-gray-300",
    },
  };

  const current = statusMap[status] || statusMap.waiting;

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
