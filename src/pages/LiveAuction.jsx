import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSkipForward,
  FiStopCircle,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";

import {
  getCurrentBid,
  getBidHistory,
  placeBid,
  sellPlayer,
  markPlayerUnsold,
} from "../api/biddingApi";

import {
  getAuctionSession,
  pauseAuction,
  resumeAuction,
  startNextPlayer,
  completeAuction,
} from "../api/auctionControlApi";

import { getAuction } from "../api/auctionApi";

import { checkAuctionAccess } from "../api/auctionAccessApi";

import AuctionConnectionStatus from "../components/auction/AuctionConnectionStatus";
import LivePlayerCard from "../components/auction/LivePlayerCard";
import BidPanel from "../components/auction/BidPanel";
import BidHistory from "../components/auction/BidHistory";

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
};

const extractData = (response) => {
  if (!response) return null;

  if (response.data) {
    return response.data;
  }

  return response;
};

const extractPlayer = (response) => {
  const data = extractData(response);

  return (
    data?.player ||
    data?.currentPlayer ||
    data?.data?.player ||
    data?.data?.currentPlayer ||
    null
  );
};

const extractSession = (response) => {
  const data = extractData(response);

  return (
    data?.auctionSession ||
    data?.session ||
    data?.data?.auctionSession ||
    data?.data?.session ||
    null
  );
};

const extractBids = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) {
    return data;
  }

  return data?.bids || data?.data?.bids || [];
};

const getPlayerName = (player) => {
  if (!player) return "Current Player";

  if (player.fullName) {
    return player.fullName;
  }

  return (
    `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
    player.name ||
    "Current Player"
  );
};

const getAuctionStatus = (session, auction) => {
  return String(session?.status || auction?.status || "").toLowerCase();
};

const getUserRole = (user) => {
  return String(user?.role || user?.userRole || "").toLowerCase();
};

const LiveAuction = () => {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { socket, connected, connecting } = useSocket();

  const [auction, setAuction] = useState(null);
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [bids, setBids] = useState([]);

  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState(null);

  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [controlLoading, setControlLoading] = useState("");

  const [resultMessage, setResultMessage] = useState(null);

  const isAdmin = useMemo(() => {
    return getUserRole(user) === "admin";
  }, [user]);

  const auctionStatus = useMemo(
    () => getAuctionStatus(session, auction),
    [session, auction],
  );

  const auctionPaused = Boolean(
    session?.isPaused || auctionStatus === "paused",
  );

  const playerActive = Boolean(
    player && String(player.status || "").toLowerCase() === "auctioning",
  );

  const accessApproved = useMemo(() => {
    if (isAdmin) {
      return true;
    }

    if (!access) {
      return false;
    }

    const status = String(
      access?.status || access?.registrationStatus || "",
    ).toLowerCase();

    if (access?.hasAccess === true) return true;
    if (access?.approved === true) return true;
    if (access?.allowed === true) return true;

    return status === "approved";
  }, [access, isAdmin]);

  const loadAuctionData = useCallback(
    async (showLoading = true) => {
      if (!auctionId) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        const [
          auctionResponse,
          sessionResponse,
          currentResponse,
          accessResponse,
        ] = await Promise.all([
          getAuction(auctionId),
          getAuctionSession(auctionId),
          getCurrentBid(auctionId),
          isAdmin ? Promise.resolve(null) : checkAuctionAccess(auctionId),
        ]);

        const auctionData =
          extractData(auctionResponse)?.auction || extractData(auctionResponse);

        const sessionData = extractSession(sessionResponse);

        const currentPlayer = extractPlayer(currentResponse);

        setAuction(auctionData || null);
        setSession(sessionData || null);
        setPlayer(currentPlayer || null);

        if (accessResponse) {
          setAccess(extractData(accessResponse) || accessResponse);
        }

        if (currentPlayer) {
          setCurrentBid(
            Number(currentPlayer.currentBid ?? currentPlayer.basePrice ?? 0),
          );

          setLeadingTeam(currentPlayer.currentBidder || null);

          const playerId = getId(currentPlayer);

          if (playerId) {
            try {
              const historyResponse = await getBidHistory(playerId);

              setBids(extractBids(historyResponse));
            } catch (historyError) {
              console.warn("Bid history could not be loaded:", historyError);
            }
          }
        } else {
          setCurrentBid(0);
          setLeadingTeam(null);
          setBids([]);
        }
      } catch (error) {
        console.error("Live auction loading error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load live auction.",
        );
      } finally {
        setLoading(false);
      }
    },
    [auctionId, isAdmin],
  );

  const refreshLiveData = async () => {
    setRefreshing(true);

    try {
      await loadAuctionData(false);
      toast.success("Auction data refreshed.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuctionData();
  }, [loadAuctionData]);

  /*
   * Join auction Socket.IO room.
   */
  useEffect(() => {
    if (!socket || !auctionId || !connected) {
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
  }, [socket, auctionId, connected]);

  /*
   * Socket.IO live events.
   */
  useEffect(() => {
    if (!socket || !auctionId) {
      return;
    }

    const handleAuctionStarted = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      setSession((previous) => ({
        ...(previous || {}),
        status: "live",
        isPaused: false,
      }));

      toast.success("Auction has started.");
    };

    const handleAuctionPaused = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      setSession((previous) => ({
        ...(previous || {}),
        status: "paused",
        isPaused: true,
      }));

      toast("Auction paused.", {
        icon: "⏸️",
      });
    };

    const handleAuctionResumed = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      setSession((previous) => ({
        ...(previous || {}),
        status: "live",
        isPaused: false,
      }));

      toast.success("Auction resumed.");
    };

    const handlePlayerStarted = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      const nextPlayer =
        payload?.player ||
        payload?.currentPlayer ||
        payload?.data?.player ||
        null;

      if (!nextPlayer) {
        return;
      }

      setPlayer(nextPlayer);

      const bid = Number(nextPlayer.currentBid ?? nextPlayer.basePrice ?? 0);

      setCurrentBid(bid);

      setLeadingTeam(nextPlayer.currentBidder || null);

      setBids([]);

      setResultMessage(null);

      toast.success(`${getPlayerName(nextPlayer)} is now live.`);
    };

    const handleNewBid = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      const incomingBid = payload?.bid || payload?.data?.bid || payload;

      const incomingPlayer = payload?.player || payload?.data?.player || null;

      if (incomingPlayer && getId(incomingPlayer)) {
        setPlayer((previous) => ({
          ...(previous || {}),
          ...incomingPlayer,
        }));
      }

      const amount = Number(
        incomingBid?.amount ??
          incomingBid?.bidAmount ??
          incomingBid?.price ??
          incomingBid?.value ??
          incomingPlayer?.currentBid ??
          payload?.amount ??
          0,
      );

      if (amount > 0) {
        setCurrentBid(amount);
      }

      const team =
        incomingBid?.team ||
        incomingBid?.teamId ||
        incomingBid?.bidder ||
        incomingPlayer?.currentBidder ||
        payload?.team ||
        null;

      if (team) {
        setLeadingTeam(team);
      }

      setBids((previous) => {
        const bidId = incomingBid?._id || incomingBid?.id;

        const alreadyExists = bidId
          ? previous.some(
              (item) => String(item?._id || item?.id) === String(bidId),
            )
          : false;

        if (alreadyExists) {
          return previous;
        }

        return [incomingBid, ...previous];
      });
    };

    const handlePlayerSold = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      const soldPlayer = payload?.player || payload?.data?.player || player;

      const winningTeam =
        payload?.team ||
        payload?.soldTo ||
        payload?.data?.team ||
        soldPlayer?.soldTo ||
        leadingTeam;

      const finalPrice = Number(
        payload?.soldPrice ??
          payload?.price ??
          payload?.amount ??
          payload?.data?.soldPrice ??
          soldPlayer?.soldPrice ??
          currentBid,
      );

      setResultMessage({
        type: "sold",
        player: soldPlayer,
        team: winningTeam,
        price: finalPrice,
      });

      toast.success(`${getPlayerName(soldPlayer)} sold successfully.`);

      setPlayer((previous) => ({
        ...(previous || {}),
        status: "sold",
        soldPrice: finalPrice,
        soldTo: winningTeam,
      }));
    };

    const handlePlayerUnsold = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      const unsoldPlayer = payload?.player || payload?.data?.player || player;

      setResultMessage({
        type: "unsold",
        player: unsoldPlayer,
      });

      toast("Player marked unsold.", {
        icon: "⚪",
      });

      setPlayer((previous) => ({
        ...(previous || {}),
        status: "unsold",
      }));
    };

    const handleNextPlayer = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      const nextPlayer =
        payload?.player ||
        payload?.currentPlayer ||
        payload?.data?.player ||
        null;

      if (!nextPlayer) {
        return;
      }

      setResultMessage(null);
      setPlayer(nextPlayer);

      const bid = Number(nextPlayer.currentBid ?? nextPlayer.basePrice ?? 0);

      setCurrentBid(bid);

      setLeadingTeam(nextPlayer.currentBidder || null);

      setBids([]);

      toast.success(`Next player: ${getPlayerName(nextPlayer)}`);
    };

    const handleAuctionCompleted = (payload) => {
      if (
        payload?.auctionId &&
        String(payload.auctionId) !== String(auctionId)
      ) {
        return;
      }

      setSession((previous) => ({
        ...(previous || {}),
        status: "completed",
        isPaused: false,
      }));

      setResultMessage({
        type: "completed",
      });

      toast.success("Auction completed.");
    };

    socket.on("auction:started", handleAuctionStarted);

    socket.on("auction:paused", handleAuctionPaused);

    socket.on("auction:resumed", handleAuctionResumed);

    socket.on("player:started", handlePlayerStarted);

    socket.on("bid:new", handleNewBid);

    socket.on("player:sold", handlePlayerSold);

    socket.on("player:unsold", handlePlayerUnsold);

    socket.on("auction:next-player", handleNextPlayer);

    socket.on("auction:completed", handleAuctionCompleted);

    return () => {
      socket.off("auction:started", handleAuctionStarted);

      socket.off("auction:paused", handleAuctionPaused);

      socket.off("auction:resumed", handleAuctionResumed);

      socket.off("player:started", handlePlayerStarted);

      socket.off("bid:new", handleNewBid);

      socket.off("player:sold", handlePlayerSold);

      socket.off("player:unsold", handlePlayerUnsold);

      socket.off("auction:next-player", handleNextPlayer);

      socket.off("auction:completed", handleAuctionCompleted);
    };
  }, [socket, auctionId, player, leadingTeam, currentBid]);

  const handlePlaceBid = async (amount) => {
    if (!auctionId || !player) {
      return;
    }

    setBidSubmitting(true);

    try {
      /*
       * The backend validates the real bid.
       * Do not trust frontend validation for security.
       */
      const response = await placeBid({
        auctionId,
        playerId: getId(player),
        amount,
      });

      const data = extractData(response);

      const returnedBid = data?.bid || data?.data?.bid || null;

      const returnedPlayer = data?.player || data?.data?.player || null;

      if (returnedBid) {
        const returnedAmount = Number(
          returnedBid.amount ?? returnedBid.bidAmount ?? amount,
        );

        setCurrentBid(returnedAmount);

        setLeadingTeam(
          returnedBid.team || returnedBid.teamId || returnedBid.bidder || null,
        );
      }

      if (returnedPlayer) {
        setPlayer((previous) => ({
          ...(previous || {}),
          ...returnedPlayer,
        }));
      }

      toast.success("Bid placed successfully.");
    } catch (error) {
      console.error("Place bid error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to place bid.",
      );
    } finally {
      setBidSubmitting(false);
    }
  };

  const handlePauseResume = async () => {
    if (!auctionId) return;

    const action = auctionPaused ? "resume" : "pause";

    setControlLoading(action);

    try {
      const actionFn = auctionPaused ? resumeAuction : pauseAuction;

      await actionFn({
        auctionId,
      });

      toast.success(auctionPaused ? "Auction resumed." : "Auction paused.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Unable to ${action} auction.`,
      );
    } finally {
      setControlLoading("");
    }
  };

  const handleSell = async () => {
    if (!auctionId || !player) {
      return;
    }

    if (
      !window.confirm(
        `Sell ${getPlayerName(player)} to the current highest bidder?`,
      )
    ) {
      return;
    }

    setControlLoading("sell");

    try {
      await sellPlayer({
        auctionId,
        playerId: getId(player),
      });

      toast.success("Player sold.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sell player.",
      );
    } finally {
      setControlLoading("");
    }
  };

  const handleUnsold = async () => {
    if (!auctionId || !player) {
      return;
    }

    if (!window.confirm(`Mark ${getPlayerName(player)} as unsold?`)) {
      return;
    }

    setControlLoading("unsold");

    try {
      await markPlayerUnsold({
        auctionId,
        playerId: getId(player),
      });

      toast.success("Player marked unsold.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to mark player unsold.",
      );
    } finally {
      setControlLoading("");
    }
  };

  const handleNextPlayer = async () => {
    if (!auctionId) {
      return;
    }

    setControlLoading("next");

    try {
      await startNextPlayer({
        auctionId,
      });

      toast.success("Starting next player.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start next player.",
      );
    } finally {
      setControlLoading("");
    }
  };

  const handleCompleteAuction = async () => {
    if (!auctionId) {
      return;
    }

    if (!window.confirm("Are you sure you want to complete this auction?")) {
      return;
    }

    setControlLoading("complete");

    try {
      await completeAuction({
        auctionId,
      });

      toast.success("Auction completed.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete auction.",
      );
    } finally {
      setControlLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[50vh] flex-col items-center justify-center">
            <FiRefreshCw className="h-10 w-10 animate-spin text-indigo-600" />

            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">
              Loading live auction...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Auction ID is missing.</h2>
      </div>
    );
  }

  if (!isAdmin && !accessApproved) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
            <FiXCircle className="mx-auto h-14 w-14 text-red-500" />

            <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
              Auction Access Denied
            </h1>

            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Your team does not currently have approved access to this live
              auction.
            </p>

            <Link
              to={`/auctions/${auctionId}/access`}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              Check Auction Access
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nextBid = Number(currentBid || 0) + Number(auction?.bidIncrement || 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Go back"
              >
                <FiArrowLeft />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                    {auction?.name || "Live Auction"}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    Live
                  </span>
                </div>

                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <FiClock />
                  Real-time auction room
                </p>
              </div>
            </div>

            <AuctionConnectionStatus
              connected={connected}
              connecting={connecting}
            />
          </div>
        </header>

        {/* Pause overlay */}
        {auctionPaused && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <FiPause className="h-6 w-6 shrink-0" />

            <div>
              <p className="font-bold">Auction Paused</p>

              <p className="text-sm">
                Bidding is temporarily unavailable until the auction resumes.
              </p>
            </div>
          </div>
        )}

        {/* Sold / Unsold result */}
        {resultMessage?.type === "sold" && (
          <div className="mb-5 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex flex-col items-center justify-center text-center">
              <FiCheckCircle className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />

              <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                Player Sold!
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {getPlayerName(resultMessage.player)}
              </h2>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Sold to{" "}
                <strong>
                  {resultMessage.team?.name ||
                    resultMessage.team ||
                    "Winning Team"}
                </strong>
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(resultMessage.price || 0)}
              </p>
            </div>
          </div>
        )}

        {resultMessage?.type === "unsold" && (
          <div className="mb-5 rounded-3xl border border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
            <FiXCircle className="mx-auto h-12 w-12 text-slate-500" />

            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Player Unsold
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {getPlayerName(resultMessage.player)}
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No team placed a winning bid.
            </p>
          </div>
        )}

        {/* Main */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <div className="space-y-5">
            <LivePlayerCard
              player={player}
              currentBid={currentBid}
              leadingTeam={leadingTeam}
            />

            <BidHistory bids={bids} />
          </div>

          <aside className="space-y-5">
            <BidPanel
              currentBid={currentBid}
              minimumBid={auction?.minimumBid || player?.basePrice || 0}
              bidIncrement={auction?.bidIncrement || 0}
              playerActive={playerActive}
              auctionPaused={auctionPaused}
              accessApproved={accessApproved}
              canBid={!isAdmin}
              submitting={bidSubmitting}
              onPlaceBid={handlePlaceBid}
            />

            {/* Auction information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Auction Status
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </span>

                  <span className="font-bold capitalize text-slate-900 dark:text-white">
                    {auctionStatus || "Waiting"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Current Bid
                  </span>

                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{Number(currentBid || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Next Suggested Bid
                  </span>

                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{Number(nextBid || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </section>

            {/* Admin controls */}
            {isAdmin && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Admin Controls
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Manage the live auction.
                    </p>
                  </div>

                  <FiUsers className="text-indigo-500" />
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={handlePauseResume}
                    disabled={Boolean(controlLoading)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {controlLoading === "pause" ||
                    controlLoading === "resume" ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : auctionPaused ? (
                      <FiPlay />
                    ) : (
                      <FiPause />
                    )}

                    {auctionPaused ? "Resume Auction" : "Pause Auction"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSell}
                    disabled={Boolean(controlLoading) || !playerActive}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {controlLoading === "sell" ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiCheckCircle />
                    )}
                    Sell Player
                  </button>

                  <button
                    type="button"
                    onClick={handleUnsold}
                    disabled={Boolean(controlLoading) || !playerActive}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                  >
                    {controlLoading === "unsold" ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiXCircle />
                    )}
                    Mark Unsold
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPlayer}
                    disabled={Boolean(controlLoading)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {controlLoading === "next" ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiSkipForward />
                    )}
                    Next Player
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteAuction}
                    disabled={Boolean(controlLoading)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    {controlLoading === "complete" ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiStopCircle />
                    )}
                    Complete Auction
                  </button>
                </div>
              </section>
            )}

            <button
              type="button"
              onClick={refreshLiveData}
              disabled={refreshing}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh Auction Data
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
