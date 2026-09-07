import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiActivity, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

import AuctionControls from "../components/AuctionControls";

import {
  startAuction,
  pauseAuction,
  resumeAuction,
  getAuctionSession,
  nextPlayer,
  completePlayer,
  completeAuction,
} from "../api/auctionControlApi";

import { getAuctionById } from "../api/auctionApi";

export default function AdminAuctionControl() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [session, setSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD AUCTION
  // --------------------------------------------------

  const loadAuction = useCallback(async () => {
    if (!id) return;

    try {
      const response = await getAuctionById(id);

      const auctionData = response?.data || response?.auction || response;

      setAuction(auctionData);
    } catch (err) {
      console.error("Load Auction Error:", err);

      throw err;
    }
  }, [id]);

  // --------------------------------------------------
  // LOAD SESSION
  // --------------------------------------------------

  const loadSession = useCallback(async () => {
    if (!id) return;

    try {
      const response = await getAuctionSession(id);

      const sessionData = response?.data || response?.session || response;

      setSession(sessionData);

      return sessionData;
    } catch (err) {
      /*
       * Before Start Auction, the backend can legitimately
       * return 404 because AuctionSession doesn't exist yet.
       */

      if (err?.response?.status === 404) {
        setSession(null);
        return null;
      }

      console.error("Load Auction Session Error:", err);

      throw err;
    }
  }, [id]);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  const loadData = useCallback(async () => {
    if (!id) {
      setError("Auction ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAuction(), loadSession()]);
    } catch (err) {
      console.error("Load Admin Auction Data Error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load auction.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, loadAuction, loadSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --------------------------------------------------
  // RUN CONTROL ACTION
  // --------------------------------------------------

  const runAction = async (action, successMessage) => {
    if (actionLoading) return;

    setActionLoading(true);

    try {
      const response = await action();

      console.log("Auction control response:", response);

      toast.success(response?.message || successMessage);

      // Refresh both auction and session
      await Promise.all([loadAuction(), loadSession()]);
    } catch (err) {
      console.error("Auction Control Action Error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Auction control action failed.";

      toast.error(message);

      /*
       * Also show error in console for debugging.
       */
      console.error("Backend response:", err?.response?.data);
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // START
  // --------------------------------------------------

  const handleStart = () => {
    runAction(() => startAuction(id), "Auction started successfully.");
  };

  // --------------------------------------------------
  // PAUSE
  // --------------------------------------------------

  const handlePause = () => {
    runAction(() => pauseAuction(id), "Auction paused successfully.");
  };

  // --------------------------------------------------
  // RESUME
  // --------------------------------------------------

  const handleResume = () => {
    runAction(() => resumeAuction(id), "Auction resumed successfully.");
  };

  // --------------------------------------------------
  // NEXT PLAYER
  // --------------------------------------------------

  const handleNextPlayer = () => {
    runAction(() => nextPlayer(id), "Next player started successfully.");
  };

  // --------------------------------------------------
  // COMPLETE PLAYER
  // --------------------------------------------------

  const handleCompletePlayer = () => {
    runAction(
      () => completePlayer(id),
      "Current player completed successfully.",
    );
  };

  // --------------------------------------------------
  // COMPLETE AUCTION
  // --------------------------------------------------

  const handleCompleteAuction = () => {
    const confirmed = window.confirm(
      "Are you sure you want to complete the entire auction?",
    );

    if (!confirmed) return;

    runAction(() => completeAuction(id), "Auction completed successfully.");
  };

  // --------------------------------------------------
  // DERIVE STATUS
  // --------------------------------------------------

  const status = session?.status || auction?.status || "upcoming";

  const currentPlayer = session?.currentPlayer || null;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded-lg bg-gray-200 dark:bg-navy-800" />

          <div className="h-32 rounded-2xl bg-gray-200 dark:bg-navy-800" />

          <div className="h-48 rounded-2xl bg-gray-200 dark:bg-navy-800" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={22} className="mt-0.5 shrink-0 text-red-500" />

            <div className="flex-1">
              <h1 className="font-bold text-red-700 dark:text-red-400">
                Unable to load auction
              </h1>

              <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={loadData}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <FiRefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-500">
            <FiActivity size={17} />
            AuctionPro Admin
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Auction Control
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage the live auction session and player progression.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={actionLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-850 disabled:opacity-50"
        >
          <FiRefreshCw size={17} />
          Refresh Session
        </button>
      </div>

      {/* AUCTION INFORMATION */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Auction"
          value={auction?.name || auction?.title || "Auction"}
        />

        <InfoCard label="Auction Status" value={status} highlight />

        <InfoCard
          label="Current Player"
          value={
            currentPlayer?.fullName || currentPlayer?.name || "No active player"
          }
        />
      </div>

      {/* CONTROLS */}
      <AuctionControls
        status={status}
        loading={actionLoading}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onNextPlayer={handleNextPlayer}
        onCompletePlayer={handleCompletePlayer}
        onCompleteAuction={handleCompleteAuction}
      />

      {/* SESSION */}
      <div className="mt-6 rounded-2xl border border-navy-700 bg-navy-900 p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-500">
            Session
          </p>

          <h2 className="mt-1 text-xl font-bold text-white">
            Current Auction State
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SessionValue label="Auction ID" value={id} />

          <SessionValue label="Status" value={status} />

          <SessionValue
            label="Current Player"
            value={currentPlayer?.fullName || currentPlayer?.name || "—"}
          />

          <SessionValue
            label="Current Bid"
            value={currentPlayer?.currentBid ?? "—"}
          />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// INFO CARD
// --------------------------------------------------

function InfoCard({ label, value, highlight = false }) {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-900 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-lg font-bold ${
          highlight ? "text-cyan-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// --------------------------------------------------
// SESSION VALUE
// --------------------------------------------------

function SessionValue({ label, value }) {
  return (
    <div className="rounded-xl bg-navy-850 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-white">
        {value || "—"}
      </p>
    </div>
  );
}
