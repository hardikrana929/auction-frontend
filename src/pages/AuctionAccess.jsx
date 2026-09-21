import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiUsers,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  checkAuctionAccess,
  getAuctionAccess,
  checkTeamAuctionAccess,
  verifyTeamAuctionAccess,
} from "../api/auctionAccessApi";
import { toImageUrl } from "../utils/imageUrl";

const AuctionAccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const loadAccess = useCallback(
    async (showToast = false) => {
      if (!id) {
        setError("Auction ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (showToast) {
          setChecking(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await checkAuctionAccess(id);

        setAccess(response);

        if (showToast) {
          toast.success("Auction access checked successfully.");
        }
      } catch (err) {
        console.error("Auction access check failed:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to check auction access.";

        /*
         * Some backend implementations return 403 when access
         * is denied. Keep the response available so the UI can
         * show a useful access-denied screen.
         */
        if (err?.response?.data) {
          setAccess(err.response.data);
        }

        setError(message);

        if (showToast) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadAccess();
  }, [loadAccess]);

  const getBooleanValue = (...values) => {
    for (const value of values) {
      if (typeof value === "boolean") {
        return value;
      }
    }

    return false;
  };

  const hasAccess = getBooleanValue(
    access?.hasAccess,
    access?.access,
    access?.allowed,
    access?.authorized,
    access?.canAccess,
    access?.data?.hasAccess,
    access?.data?.access,
    access?.data?.allowed,
    access?.data?.authorized,
    access?.data?.canAccess,
  );

  const isApproved = getBooleanValue(
    access?.approved,
    access?.isApproved,
    access?.data?.approved,
    access?.data?.isApproved,
  );

  const isPending = getBooleanValue(
    access?.pending,
    access?.isPending,
    access?.data?.pending,
    access?.data?.isPending,
  );

  /*
   * Real backend shape (auctionAccessController.checkAuctionAccess):
   * { success, data: { auction, user, access: { isAdmin, canManageAuction,
   *   canParticipate }, registrations: [{ status, team }] } }
   */
  const accessFlags = access?.data?.access || {};
  const registrations = Array.isArray(access?.data?.registrations)
    ? access.data.registrations
    : [];

  const approvedRegistration = registrations.find(
    (item) => String(item?.status).toLowerCase() === "approved",
  );
  const pendingRegistration = registrations.find(
    (item) => String(item?.status).toLowerCase() === "pending",
  );

  const team =
    access?.team ||
    access?.data?.team ||
    access?.participant?.team ||
    approvedRegistration?.team ||
    pendingRegistration?.team ||
    null;

  const auction = access?.auction || access?.data?.auction || null;

  const teamName =
    team?.name || access?.teamName || access?.data?.teamName || "Your Team";

  const auctionName =
    auction?.name ||
    auction?.title ||
    access?.auctionName ||
    access?.data?.auctionName ||
    "Auction";

  const status =
    access?.status || access?.registrationStatus || access?.data?.status || "";

  const normalizedStatus = String(status).toLowerCase();

  /*
   * Some backend responses may not provide an explicit boolean.
   * An approved registration is also treated as an approved state.
   */
  const approvedState =
    hasAccess ||
    isApproved ||
    normalizedStatus === "approved" ||
    accessFlags.canParticipate === true ||
    accessFlags.canManageAuction === true ||
    Boolean(approvedRegistration);

  const pendingState =
    isPending ||
    normalizedStatus === "pending" ||
    (!approvedState && Boolean(pendingRegistration));

  const deniedState =
    !approvedState && !pendingState && Boolean(access || error);

  const enterLiveAuction = () => {
    if (!id) {
      toast.error("Auction ID is missing.");
      return;
    }

    if (!approvedState) {
      toast.error("You do not have access to this auction.");
      return;
    }

    const isManager = accessFlags.canManageAuction === true;
    const auctionStatus = String(auction?.status || "").toLowerCase();

    if (!isManager && auctionStatus && auctionStatus !== "live") {
      toast.error("This auction is not live yet. Please come back when it starts.");
      return;
    }

    /*
     * Keep this route aligned with the LiveAuction route
     * used by the AuctionPro frontend.
     */
    navigate(`/auction/${id}/live`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />

            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Checking auction access...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          to={`/auctions/${id}`}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
        >
          <FiArrowLeft />
          Back to Auction
        </Link>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-7 dark:border-gray-800 dark:bg-gray-900 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiShield className="text-3xl" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Auction Access
                </p>

                <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {auctionName}
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Verify your registration before entering the live auction.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && !access && (
            <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="mt-0.5 shrink-0 text-xl text-red-600 dark:text-red-400" />

                <div>
                  <h2 className="font-semibold text-red-800 dark:text-red-300">
                    Access check failed
                  </h2>

                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadAccess(true)}
                    disabled={checking}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <FiRefreshCw className={checking ? "animate-spin" : ""} />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-8 sm:px-8">
            {/* Approved */}
            {approvedState && (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <FiCheckCircle className="text-4xl" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                  Access Approved
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Your team has been approved to participate in this auction.
                  You can now enter the live auction.
                </p>

                {/* Team Information */}
                <div className="mx-auto mt-7 max-w-md rounded-2xl border border-green-200 bg-green-50 p-5 text-left dark:border-green-900/40 dark:bg-green-950/20">
                  <div className="flex items-center gap-4">
                    {toImageUrl(team?.logo) || toImageUrl(team?.image) ? (
                      <img
                        src={toImageUrl(team.logo) || toImageUrl(team.image)}
                        alt={`${teamName} logo`}
                        className="h-14 w-14 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-200 text-lg font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        {teamName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-400">
                        Approved Team
                      </p>

                      <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                        {teamName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enter */}
                <button
                  type="button"
                  onClick={enterLiveAuction}
                  className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-xl"
                >
                  Enter Live Auction
                  <FiArrowRight className="text-lg" />
                </button>

                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Your auction access will be checked again by the live auction
                  page.
                </p>
              </div>
            )}

            {/* Pending */}
            {!approvedState && pendingState && (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                  <FiClock className="text-4xl" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                  Approval Pending
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Your team registration has been submitted, but an
                  administrator has not approved it yet.
                </p>

                <div className="mx-auto mt-7 max-w-md rounded-2xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900/40 dark:bg-yellow-950/20">
                  <div className="flex items-center justify-center gap-3">
                    <FiClock className="text-xl text-yellow-600 dark:text-yellow-400" />

                    <span className="font-semibold text-yellow-800 dark:text-yellow-300">
                      Waiting for administrator approval
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadAccess(true)}
                  disabled={checking}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiRefreshCw className={checking ? "animate-spin" : ""} />
                  {checking ? "Checking..." : "Check Approval Again"}
                </button>
              </div>
            )}

            {/* Denied */}
            {!approvedState && !pendingState && deniedState && (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <FiXCircle className="text-4xl" />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                  Auction Access Not Available
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Your account or team does not currently have permission to
                  enter this auction.
                </p>

                {error && (
                  <div className="mx-auto mt-5 max-w-lg rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {error}
                  </div>
                )}

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => loadAccess(true)}
                    disabled={checking}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <FiRefreshCw className={checking ? "animate-spin" : ""} />
                    Check Again
                  </button>

                  <Link
                    to={`/auctions/${id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <FiArrowLeft />
                    Back to Auction
                  </Link>
                </div>
              </div>
            )}

            {/* No response */}
            {!approvedState && !pendingState && !deniedState && !error && (
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <FiLock className="text-3xl" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                  Access information unavailable
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Please refresh and try again.
                </p>

                <button
                  type="button"
                  onClick={() => loadAccess(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <FiRefreshCw />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400 sm:flex-row">
              <FiShield />
              <span>Auction access is verified by the AuctionPro backend.</span>
            </div>
          </div>
        </div>

        {/* Participants link */}
        <div className="mt-5 text-center">
          <Link
            to={`/auctions/${id}/participants`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <FiUsers />
            View Auction Participants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionAccess;
