import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiPause,
  FiRefreshCw,
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
import CurrentBidCard from "../components/auction/CurrentBidCard";
import MyTeamCard from "../components/auction/MyTeamCard";
import AuctionInfoCard from "../components/auction/AuctionInfoCard";
import AdminControlBar from "../components/auction/AdminControlBar";

import { getTeamsByAuction } from "../api/teamApi";
import { formatCurrency } from "../utils/formatCurrency";
import { resolveTeam } from "../utils/teamInfo";

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

  // Backend returns { success, data: <the session document itself> }.
  return (
    data?.auctionSession ||
    data?.session ||
    data?.data?.auctionSession ||
    data?.data?.session ||
    (data && (data.status || data.currentPlayerIndex !== undefined)
      ? data
      : null)
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

    // Real backend shape: { auction, user, access: { canParticipate, ... }, registrations }
    if (access?.access?.canParticipate === true) return true;
    if (access?.access?.canManageAuction === true) return true;

    return status === "approved";
  }, [access, isAdmin]);

  /*
   * Teams this user can bid for: approved registrations with an active team.
   * If an account owns more than one, the user must choose which team bids.
   */
  const myTeams = useMemo(() => {
    const registrations = Array.isArray(access?.registrations)
      ? [...access.registrations].sort(
          (a, b) =>
            new Date(a?.approvedAt || a?.registeredAt || 0) -
            new Date(b?.approvedAt || b?.registeredAt || 0),
        )
      : [];

    const seen = new Set();

    return registrations
      .filter((item) => String(item?.status || "").toLowerCase() === "approved")
      .map((item) => item?.team)
      .filter(
        (team) =>
          team &&
          typeof team === "object" &&
          String(team.status || "active").toLowerCase() === "active",
      )
      .filter((team) => {
        const id = getId(team);

        if (!id || seen.has(id)) {
          return false;
        }

        seen.add(id);

        return true;
      });
  }, [access]);

  // The logged-in owner's team is chosen automatically: their first approved
  // team in this auction. There is no team dropdown any more.
  const myTeamId = getId(myTeams[0]) || "";

  // teamId -> team (name, logo, purse, squad) for every team in this auction.
  const [teamDirectory, setTeamDirectory] = useState({});

  const loadTeamDirectory = useCallback(async () => {
    if (!auctionId) {
      return;
    }

    try {
      const response = await getTeamsByAuction(auctionId);

      const list = Array.isArray(response?.teams)
        ? response.teams
        : Array.isArray(response?.data?.teams)
          ? response.data.teams
          : Array.isArray(response)
            ? response
            : [];

      const directory = {};

      list.forEach((team) => {
        const id = getId(team);

        if (id) {
          directory[id] = team;
        }
      });

      setTeamDirectory(directory);
    } catch (teamError) {
      console.warn("Team list could not be loaded:", teamError);
    }
  }, [auctionId]);

  useEffect(() => {
    loadTeamDirectory();
  }, [loadTeamDirectory]);

  // A sale changes team purses and squads, so reload them.
  useEffect(() => {
    if (resultMessage?.type === "sold") {
      loadTeamDirectory();
    }
  }, [resultMessage, loadTeamDirectory]);

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
          // A 404 here just means the admin has not started the session yet.
          getAuctionSession(auctionId).catch(() => null),
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
      await Promise.all([loadAuctionData(false), loadTeamDirectory()]);
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
        // The backend checks that this team really belongs to the logged-in user.
        ...(myTeamId ? { teamId: myTeamId } : {}),
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

  const increment = Number(auction?.bidIncrement || 0);
  const basePrice = Number(player?.basePrice ?? auction?.minimumBid ?? 0);

  const nextBid =
    Number(currentBid || 0) > 0
      ? Number(currentBid) + (increment || 1)
      : Number(auction?.minimumBid || basePrice || increment || 0);

  const leader = resolveTeam(leadingTeam, teamDirectory);
  const isLeading = Boolean(myTeamId) && leader.id === myTeamId;

  const myTeamData = myTeamId ? teamDirectory[myTeamId] || myTeams[0] : null;

  const purseValue = myTeamData?.remainingBudget;
  const purse =
    purseValue !== undefined &&
    purseValue !== null &&
    Number.isFinite(Number(purseValue))
      ? Number(purseValue)
      : null;

  const soldTeam = resolveTeam(resultMessage?.team, teamDirectory);
  const statusText = (auctionStatus || "waiting").replace(/_/g, " ");

  const chip =
    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300";

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 dark:bg-slate-950 sm:px-5">
      <div className="mx-auto max-w-[1600px] rounded-[2rem] bg-slate-950 p-3 text-white ring-1 ring-slate-800 sm:p-5">
        {/* Header */}
        <header className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-700 p-2.5 text-slate-300 transition hover:bg-slate-800"
              aria-label="Go back"
            >
              <FiArrowLeft />
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black text-white">
                  {auction?.name || "Live Auction"}
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-black uppercase text-red-300 ring-1 ring-red-500/40">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Live
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={chip}>
                  Auction ID
                  <b className="break-all font-mono text-white">{auctionId}</b>
                </span>

                {!isAdmin && myTeamId && (
                  <span className={chip}>
                    Team ID
                    <b className="break-all font-mono text-white">{myTeamId}</b>
                  </span>
                )}

                <span className={`${chip} capitalize`}>
                  Status
                  <b className="text-white">{statusText}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AuctionConnectionStatus
              connected={connected}
              connecting={connecting}
            />

            <button
              type="button"
              onClick={refreshLiveData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Pause banner */}
        {auctionPaused && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
            <FiPause className="h-6 w-6 shrink-0" />

            <div>
              <p className="font-black">Auction paused</p>

              <p className="text-sm text-amber-200/80">
                Bidding is temporarily unavailable until the auction resumes.
              </p>
            </div>
          </div>
        )}

        {/* Sold / unsold result */}
        {resultMessage?.type === "sold" && (
          <div className="mb-5 flex flex-col items-center gap-3 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <FiCheckCircle className="h-12 w-12 shrink-0 text-emerald-400" />

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                  Player sold
                </p>

                <h2 className="text-2xl font-black text-white">
                  {getPlayerName(resultMessage.player)}
                </h2>

                <p className="text-sm text-slate-300">
                  Sold to{" "}
                  <strong className="text-white">
                    {soldTeam.name || "the winning team"}
                  </strong>
                  {soldTeam.id && (
                    <span className="ml-2 break-all font-mono text-xs text-slate-400">
                      Team ID: {soldTeam.id}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-4xl font-black tabular-nums text-emerald-300">
              {formatCurrency(resultMessage.price || 0)}
            </p>
          </div>
        )}

        {resultMessage?.type === "unsold" && (
          <div className="mb-5 flex items-center gap-4 rounded-3xl border border-slate-700 bg-slate-900 p-5">
            <FiXCircle className="h-12 w-12 shrink-0 text-slate-500" />

            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Player unsold
              </p>

              <h2 className="text-2xl font-black text-white">
                {getPlayerName(resultMessage.player)}
              </h2>

              <p className="text-sm text-slate-400">
                No team placed a winning bid.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard: player card on the left, bidding on the right */}
        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <LivePlayerCard
              player={player}
              fallbackBasePrice={auction?.minimumBid || 0}
            />
          </aside>

          <div className="min-w-0 space-y-5">
            <CurrentBidCard
              currentBid={currentBid}
              nextBid={nextBid}
              basePrice={basePrice}
              team={leader}
              isMine={isLeading}
              active={playerActive && !auctionPaused}
            />

            {isAdmin ? (
              <AdminControlBar
                paused={auctionPaused}
                playerActive={playerActive}
                controlLoading={controlLoading}
                onPauseResume={handlePauseResume}
                onSell={handleSell}
                onUnsold={handleUnsold}
                onNext={handleNextPlayer}
                onComplete={handleCompleteAuction}
              />
            ) : (
              <BidPanel
                currentBid={currentBid}
                minimumBid={auction?.minimumBid || player?.basePrice || 0}
                bidIncrement={auction?.bidIncrement || 0}
                playerActive={playerActive}
                auctionPaused={auctionPaused}
                accessApproved={accessApproved}
                canBid={!isAdmin}
                submitting={bidSubmitting}
                teamName={myTeamData?.name || ""}
                teamId={myTeamId}
                purse={purse}
                onPlaceBid={handlePlaceBid}
              />
            )}

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <BidHistory
                bids={bids}
                directory={teamDirectory}
                myTeamId={myTeamId}
              />

              <div className="space-y-5">
                {!isAdmin && (
                  <MyTeamCard
                    team={myTeamData}
                    maxPlayers={Number(auction?.maxPlayersPerTeam || 0)}
                    otherTeamsCount={Math.max(0, myTeams.length - 1)}
                  />
                )}

                <AuctionInfoCard
                  auction={auction}
                  auctionId={auctionId}
                  status={statusText}
                  nextBid={nextBid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
