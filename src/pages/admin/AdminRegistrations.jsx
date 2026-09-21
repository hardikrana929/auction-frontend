import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { toImageUrl } from "../../utils/imageUrl";

import { getAuctions } from "../../api/auctionApi";
import {
  approveRegistration,
  getAuctionRegistrations,
  rejectRegistration,
} from "../../api/auctionRegistrationApi";

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};

const getAuctionName = (auction) => {
  return (
    auction?.name || auction?.auctionName || auction?.title || "Unnamed Auction"
  );
};

const getTeamName = (team) => {
  return team?.name || team?.teamName || team?.title || "Unnamed Team";
};

const getTeamLogo = (team) => {
  return (
    toImageUrl(team?.logo) ||
    toImageUrl(team?.logoUrl) ||
    toImageUrl(team?.image) ||
    toImageUrl(team?.imageUrl) ||
    ""
  );
};

const getUserName = (user) => {
  return user?.name || user?.fullName || user?.username || "Unknown User";
};

const getUserEmail = (user) => {
  return user?.email || "";
};

const getInitials = (name) => {
  if (!name) return "TM";

  return String(name)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status) => {
  return String(status || "pending").toLowerCase();
};

/*
 * ==========================================
 * STATUS BADGE
 * ==========================================
 */

function RegistrationStatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  const config = {
    pending: {
      label: "Pending",
      icon: FiClock,
      classes: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    approved: {
      label: "Approved",
      icon: FiCheckCircle,
      classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    rejected: {
      label: "Rejected",
      icon: FiXCircle,
      classes: "border-red-500/20 bg-red-500/10 text-red-400",
    },
    cancelled: {
      label: "Cancelled",
      icon: FiX,
      classes: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    },
  };

  const current = config[normalized] || {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    icon: FiAlertCircle,
    classes: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  const Icon = current.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${current.classes}
      `}
    >
      <Icon size={13} />
      {current.label}
    </span>
  );
}

/*
 * ==========================================
 * TEAM AVATAR
 * ==========================================
 */

function TeamAvatar({ team, size = "normal" }) {
  const name = getTeamName(team);
  const logo = getTeamLogo(team);

  // Remember a logo that failed to load and show the initials instead.
  // (The old code replaced the <img> with parent.innerHTML, which made React
  // crash with "The node to be removed is not a child of this node" on the
  // next update, e.g. right after clicking Approve.)
  const [failedLogo, setFailedLogo] = useState("");

  const sizeClass = size === "small" ? "h-9 w-9" : "h-11 w-11";

  return (
    <div
      className={`
        ${sizeClass}
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-cyan-500/20
        bg-[#0a1d36]
      `}
    >
      {logo && logo !== failedLogo ? (
        <img
          src={logo}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedLogo(logo)}
        />
      ) : (
        <span className="text-xs font-bold text-cyan-400">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

/*
 * ==========================================
 * REJECT MODAL
 * ==========================================
 */

function RejectModal({
  registration,
  reason,
  setReason,
  loading,
  onClose,
  onConfirm,
}) {
  const teamName = getTeamName(registration?.team);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-slate-700
          bg-[#07172c]
          shadow-[0_30px_100px_rgba(0,0,0,0.75)]
        "
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <FiXCircle size={21} />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Reject Registration
              </h2>

              <p className="text-xs text-slate-500">{teamName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              disabled:opacity-40
            "
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-5">
          <label
            htmlFor="rejectionReason"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            Rejection reason
          </label>

          <textarea
            id="rejectionReason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={loading}
            rows={4}
            maxLength={500}
            placeholder="Enter the reason for rejecting this registration..."
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-slate-700
              bg-[#0a1d36]
              px-4
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-slate-500
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/10
              disabled:opacity-50
            "
          />

          <div className="mt-2 text-right text-xs text-slate-500">
            {reason.length}/500
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-700 bg-[#06152a] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              h-11
              rounded-xl
              border
              border-slate-700
              px-6
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:bg-slate-800
              hover:text-white
              disabled:opacity-40
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-500
              px-6
              text-sm
              font-bold
              text-white
              transition
              hover:bg-red-400
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Rejecting...
              </>
            ) : (
              <>
                <FiXCircle size={17} />
                Reject Registration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * MAIN PAGE
 * ==========================================
 */

export default function AdminRegistrations({ auctionId: routeAuctionId = "" }) {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState("");

  const [registrations, setRegistrations] = useState([]);

  const [statusFilter, setStatusFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [loadingAuctions, setLoadingAuctions] = useState(true);

  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [actionId, setActionId] = useState(null);

  const [rejectingRegistration, setRejectingRegistration] = useState(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [rejectLoading, setRejectLoading] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [pages, setPages] = useState(1);

  const [total, setTotal] = useState(0);

  const LIMIT = 10;

  /*
   * ==========================================
   * LOAD AUCTIONS
   * ==========================================
   */

  const loadAuctions = useCallback(async () => {
    try {
      setLoadingAuctions(true);
      setError("");

      const response = await getAuctions();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.auctions)
            ? response.auctions
            : Array.isArray(response?.data?.auctions)
              ? response.data.auctions
              : [];

      const validAuctions = data.filter((auction) => auction && getId(auction));

      setAuctions(validAuctions);

      if (validAuctions.length > 0 && !selectedAuctionId) {
        // Open the auction named in the URL (/admin/registrations/:auctionId);
        // fall back to the first one when the URL has none or it is unknown.
        const fromUrl = validAuctions.find(
          (auction) => getId(auction) === routeAuctionId,
        );

        setSelectedAuctionId(getId(fromUrl || validAuctions[0]));
      }
    } catch (err) {
      console.error("Load admin auctions error:", err);

      setAuctions([]);

      setError(
        err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load auctions.",
      );
    } finally {
      setLoadingAuctions(false);
    }
  }, [selectedAuctionId]);

  /*
   * ==========================================
   * LOAD REGISTRATIONS
   * ==========================================
   */

  const loadRegistrations = useCallback(
    async (isRefresh = false) => {
      if (!selectedAuctionId) {
        setRegistrations([]);
        setTotal(0);
        setPages(1);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingRegistrations(true);
        }

        setError("");

        const response = await getAuctionRegistrations(selectedAuctionId, {
          page,
          limit: LIMIT,
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        });

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.registrations)
            ? response.registrations
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.registrations)
                ? response.data.registrations
                : [];

        setRegistrations(list);

        setTotal(Number(response?.total ?? list.length));

        setPages(Math.max(Number(response?.pages ?? 1), 1));
      } catch (err) {
        console.error("Load registrations error:", err);

        setRegistrations([]);
        setTotal(0);
        setPages(1);

        setError(
          err?.normalizedMessage ||
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load registrations.",
        );
      } finally {
        setLoadingRegistrations(false);
        setRefreshing(false);
      }
    },
    [selectedAuctionId, page, statusFilter],
  );

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  /*
   * ==========================================
   * LOAD REGISTRATIONS WHEN FILTER/AUCTION CHANGES
   * ==========================================
   */

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  /*
   * ==========================================
   * RESET PAGE WHEN AUCTION CHANGES
   * ==========================================
   */

  useEffect(() => {
    setPage(1);
  }, [selectedAuctionId]);

  /*
   * ==========================================
   * RESET PAGE WHEN STATUS CHANGES
   * ==========================================
   */

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  /*
   * ==========================================
   * APPROVE REGISTRATION
   * ==========================================
   */

  const handleApprove = async (registration) => {
    const registrationId = getId(registration);

    if (!registrationId) {
      toast.error("Registration ID is missing.");
      return;
    }

    if (normalizeStatus(registration?.status) !== "pending") {
      toast.error("Only pending registrations can be approved.");
      return;
    }

    const teamName = getTeamName(registration?.team);

    const confirmed = window.confirm(`Approve "${teamName}" for this auction?`);

    if (!confirmed) {
      return;
    }

    try {
      setActionId(registrationId);

      const response = await approveRegistration(registrationId);

      const updatedRegistration =
        response?.registration ||
        response?.data?.registration ||
        response?.data ||
        null;

      setRegistrations((previous) =>
        previous.map((item) =>
          getId(item) === registrationId
            ? {
                ...item,
                ...(updatedRegistration || {}),
                status: updatedRegistration?.status || "approved",
                // The approve reply only contains ids for these, so keep the
                // populated objects (name, logo, e-mail...) already on screen.
                team: item.team,
                registeredBy: item.registeredBy,
                auction: item.auction,
              }
            : item,
        ),
      );

      toast.success(
        response?.message || "Team registration approved successfully.",
      );
    } catch (err) {
      console.error("Approve registration error:", err);

      toast.error(
        err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to approve registration.",
      );
    } finally {
      setActionId(null);
    }
  };

  /*
   * ==========================================
   * OPEN REJECT MODAL
   * ==========================================
   */

  const openRejectModal = (registration) => {
    if (normalizeStatus(registration?.status) !== "pending") {
      toast.error("Only pending registrations can be rejected.");
      return;
    }

    setRejectingRegistration(registration);

    setRejectionReason("");
  };

  /*
   * ==========================================
   * CLOSE REJECT MODAL
   * ==========================================
   */

  const closeRejectModal = () => {
    if (rejectLoading) {
      return;
    }

    setRejectingRegistration(null);
    setRejectionReason("");
  };

  /*
   * ==========================================
   * REJECT REGISTRATION
   * ==========================================
   */

  const handleReject = async () => {
    const registrationId = getId(rejectingRegistration);

    if (!registrationId) {
      toast.error("Registration ID is missing.");
      return;
    }

    try {
      setRejectLoading(true);

      const response = await rejectRegistration(
        registrationId,
        rejectionReason,
      );

      const updatedRegistration =
        response?.registration ||
        response?.data?.registration ||
        response?.data ||
        null;

      setRegistrations((previous) =>
        previous.map((item) =>
          getId(item) === registrationId
            ? {
                ...item,
                ...(updatedRegistration || {}),
                status: updatedRegistration?.status || "rejected",
                rejectionReason:
                  updatedRegistration?.rejectionReason ??
                  rejectionReason.trim(),
                team: item.team,
                registeredBy: item.registeredBy,
                auction: item.auction,
              }
            : item,
        ),
      );

      setRejectingRegistration(null);
      setRejectionReason("");

      toast.success(response?.message || "Team registration rejected.");
    } catch (err) {
      console.error("Reject registration error:", err);

      toast.error(
        err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to reject registration.",
      );
    } finally {
      setRejectLoading(false);
    }
  };

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return registrations;
    }

    return registrations.filter((registration) => {
      const teamName = getTeamName(registration?.team).toLowerCase();

      const userName = getUserName(registration?.registeredBy).toLowerCase();

      const email = getUserEmail(registration?.registeredBy).toLowerCase();

      const status = normalizeStatus(registration?.status);

      return (
        teamName.includes(query) ||
        userName.includes(query) ||
        email.includes(query) ||
        status.includes(query)
      );
    });
  }, [registrations, searchTerm]);

  /*
   * ==========================================
   * PENDING COUNT
   * ==========================================
   */

  const pendingCount = useMemo(() => {
    return registrations.filter(
      (registration) => normalizeStatus(registration?.status) === "pending",
    ).length;
  }, [registrations]);

  /*
   * ==========================================
   * SELECTED AUCTION
   * ==========================================
   */

  const selectedAuction = useMemo(() => {
    return auctions.find(
      (auction) => getId(auction) === String(selectedAuctionId),
    );
  }, [auctions, selectedAuctionId]);

  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  const handleRefresh = async () => {
    await loadRegistrations(true);
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-[#06152a] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                <FiShield size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Registration Approval
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review and manage team registrations for your auctions.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingRegistrations || refreshing || !selectedAuctionId}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-cyan-300
              hover:text-cyan-600
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-[#0a1d36]
              dark:text-slate-200
              dark:hover:border-cyan-500
              dark:hover:text-cyan-400
            "
          >
            <FiRefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Auction selector */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#07172c] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="auctionSelect"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Select Auction
              </label>

              <div className="relative">
                <FiUsers
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <select
                  id="auctionSelect"
                  value={selectedAuctionId}
                  onChange={(event) => setSelectedAuctionId(event.target.value)}
                  disabled={loadingAuctions || auctions.length === 0}
                  className="
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    text-slate-800
                    outline-none
                    transition
                    focus:border-cyan-400
                    focus:ring-2
                    focus:ring-cyan-400/10
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-slate-700
                    dark:bg-[#0a1d36]
                    dark:text-white
                  "
                >
                  {loadingAuctions ? (
                    <option value="">Loading auctions...</option>
                  ) : auctions.length === 0 ? (
                    <option value="">No auctions available</option>
                  ) : (
                    <>
                      <option value="">Choose an auction</option>

                      {auctions.map((auction) => {
                        const auctionId = getId(auction);

                        return (
                          <option key={auctionId} value={auctionId}>
                            {getAuctionName(auction)}
                          </option>
                        );
                      })}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
                <FiClock size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pending
                </p>

                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {pendingCount}
                </p>
              </div>
            </div>
          </div>

          {selectedAuction && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {getAuctionName(selectedAuction)}
              </span>

              {selectedAuction?.status && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {String(selectedAuction.status).replace(/_/g, " ")}
                </span>
              )}

              {selectedAuction?.maxTeams && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Max teams: {selectedAuction.maxTeams}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Unable to load registrations
              </p>

              <p className="mt-1 text-xs opacity-80">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadRegistrations()}
              className="text-xs font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main content */}
        {!selectedAuctionId ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-[#07172c]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <FiUsers size={29} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-white">
              Select an auction
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Choose an auction above to view team registration requests.
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#07172c]">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="relative">
                  <FiSearch
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search team, user, email or status..."
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-11
                      pr-4
                      text-sm
                      text-slate-800
                      outline-none
                      transition
                      focus:border-cyan-400
                      focus:ring-2
                      focus:ring-cyan-400/10
                      dark:border-slate-700
                      dark:bg-[#0a1d36]
                      dark:text-white
                    "
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FiFilter size={17} className="text-slate-400" />

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="
                      h-11
                      min-w-[150px]
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-3
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      focus:border-cyan-400
                      dark:border-slate-700
                      dark:bg-[#0a1d36]
                      dark:text-slate-200
                    "
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Registration list */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#07172c]">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-[#0a1d36]">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Team
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Registered By
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Registered At
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingRegistrations ? (
                      Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <tr
                          key={`skeleton-${index}`}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                              <div className="space-y-2">
                                <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="space-y-2">
                              <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                              <div className="h-2.5 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </td>

                          <td className="px-5 py-5">
                            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                          </td>

                          <td className="px-5 py-5">
                            <div className="ml-auto h-9 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                          </td>
                        </tr>
                      ))
                    ) : filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                            <FiUsers size={26} />
                          </div>

                          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
                            No registrations found
                          </h3>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {searchTerm
                              ? "Try a different search term."
                              : "There are no registrations matching this filter."}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((registration) => {
                        const registrationId = getId(registration);

                        const team = registration?.team;

                        const user = registration?.registeredBy;

                        const status = normalizeStatus(registration?.status);

                        const isActionLoading = actionId === registrationId;

                        return (
                          <tr
                            key={registrationId}
                            className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-[#0a1d36]/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <TeamAvatar team={team} />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                                    {getTeamName(team)}
                                  </p>

                                  {team?.ownerName && (
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                      Owner: {team.ownerName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  <FiUser size={16} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {getUserName(user)}
                                  </p>

                                  {getUserEmail(user) && (
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                      {getUserEmail(user)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {formatDate(
                                  registration?.registeredAt ||
                                    registration?.createdAt,
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {formatDateTime(
                                  registration?.registeredAt ||
                                    registration?.createdAt,
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <RegistrationStatusBadge status={status} />
                            </td>

                            <td className="px-5 py-4">
                              {status === "pending" ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(registration)}
                                    disabled={isActionLoading}
                                    className="
                                        inline-flex
                                        h-9
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        bg-emerald-500
                                        px-3
                                        text-xs
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-emerald-400
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                      "
                                  >
                                    {isActionLoading ? (
                                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    ) : (
                                      <FiCheck size={15} />
                                    )}
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openRejectModal(registration)
                                    }
                                    disabled={isActionLoading}
                                    className="
                                        inline-flex
                                        h-9
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        bg-red-500
                                        px-3
                                        text-xs
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-red-400
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                      "
                                  >
                                    <FiX size={15} />
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <div className="text-right text-xs font-medium text-slate-400">
                                  No action
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile/tablet cards */}
              <div className="lg:hidden">
                {loadingRegistrations ? (
                  <div className="space-y-3 p-4">
                    {Array.from({
                      length: 4,
                    }).map((_, index) => (
                      <div
                        key={`mobile-skeleton-${index}`}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="flex gap-3">
                          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <FiUsers size={26} />
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
                      No registrations found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {searchTerm
                        ? "Try a different search term."
                        : "There are no registrations matching this filter."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 sm:p-4">
                    {filteredRegistrations.map((registration) => {
                      const registrationId = getId(registration);

                      const team = registration?.team;

                      const user = registration?.registeredBy;

                      const status = normalizeStatus(registration?.status);

                      const isActionLoading = actionId === registrationId;

                      return (
                        <article
                          key={registrationId}
                          className="
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              p-4
                              dark:border-slate-700
                              dark:bg-[#0a1d36]
                            "
                        >
                          <div className="flex items-start gap-3">
                            <TeamAvatar team={team} />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                                    {getTeamName(team)}
                                  </h3>

                                  {team?.ownerName && (
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                      Owner: {team.ownerName}
                                    </p>
                                  )}
                                </div>

                                <RegistrationStatusBadge status={status} />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 dark:border-slate-700 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Registered By
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                <FiUser size={14} className="text-slate-400" />

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    {getUserName(user)}
                                  </p>

                                  {getUserEmail(user) && (
                                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                                      {getUserEmail(user)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Registration Date
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {formatDate(
                                  registration?.registeredAt ||
                                    registration?.createdAt,
                                )}
                              </p>
                            </div>
                          </div>

                          {registration?.rejectionReason &&
                            status === "rejected" && (
                              <div className="mt-3 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-red-400">
                                  Rejection Reason
                                </p>

                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                  {registration.rejectionReason}
                                </p>
                              </div>
                            )}

                          {status === "pending" && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(registration)}
                                disabled={isActionLoading}
                                className="
                                    flex
                                    h-10
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-lg
                                    bg-emerald-500
                                    text-xs
                                    font-bold
                                    text-white
                                    hover:bg-emerald-400
                                    disabled:opacity-50
                                  "
                              >
                                {isActionLoading ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                  <FiCheck size={15} />
                                )}
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => openRejectModal(registration)}
                                disabled={isActionLoading}
                                className="
                                    flex
                                    h-10
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-lg
                                    bg-red-500
                                    text-xs
                                    font-bold
                                    text-white
                                    hover:bg-red-400
                                    disabled:opacity-50
                                  "
                              >
                                <FiX size={15} />
                                Reject
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loadingRegistrations && filteredRegistrations.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {filteredRegistrations.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {total}
                    </span>{" "}
                    registrations
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((previous) => Math.max(previous - 1, 1))
                      }
                      disabled={page <= 1 || loadingRegistrations}
                      className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-slate-200
                          text-slate-500
                          transition
                          hover:bg-slate-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          dark:border-slate-700
                          dark:hover:bg-slate-800
                        "
                      aria-label="Previous page"
                    >
                      <FiChevronLeft size={17} />
                    </button>

                    <span className="min-w-[70px] text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Page {page} / {pages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((previous) => Math.min(previous + 1, pages))
                      }
                      disabled={page >= pages || loadingRegistrations}
                      className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-slate-200
                          text-slate-500
                          transition
                          hover:bg-slate-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          dark:border-slate-700
                          dark:hover:bg-slate-800
                        "
                      aria-label="Next page"
                    >
                      <FiChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Reject modal */}
      {rejectingRegistration && (
        <RejectModal
          registration={rejectingRegistration}
          reason={rejectionReason}
          setReason={setRejectionReason}
          loading={rejectLoading}
          onClose={closeRejectModal}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}
