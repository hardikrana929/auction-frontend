import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  deleteAuction,
  getAuctions,
  updateAuctionStatus,
} from "../../api/auctionApi";

import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import StatusBadge from "../../components/StatusBadge";

import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export default function AdminAuctions() {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(null);

  /*
   * =========================================================
   * LOAD AUCTIONS
   * =========================================================
   */

  const loadAuctions = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getAuctions();

      /*
       * Support common backend response structures:
       *
       * []
       * { data: [] }
       * { auctions: [] }
       */

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.auctions)
            ? response.auctions
            : [];

      setAuctions(list);
    } catch (err) {
      const message =
        err?.normalizedMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load auctions.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  /*
   * =========================================================
   * NORMALIZE STATUS
   * =========================================================
   */

  const getStatus = (auction) => {
    return String(auction?.status || "upcoming").toLowerCase();
  };

  /*
   * =========================================================
   * FILTERED AUCTIONS
   * =========================================================
   */

  const filteredAuctions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return auctions.filter((auction) => {
      const name = String(auction?.name || "").toLowerCase();
      const description = String(auction?.description || "").toLowerCase();

      const status = getStatus(auction);

      const matchesSearch =
        !query || name.includes(query) || description.includes(query);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [auctions, search, statusFilter]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const statistics = useMemo(() => {
    return {
      total: auctions.length,

      upcoming: auctions.filter((auction) => getStatus(auction) === "upcoming")
        .length,

      live: auctions.filter((auction) => getStatus(auction) === "live").length,

      paused: auctions.filter((auction) => getStatus(auction) === "paused")
        .length,

      completed: auctions.filter(
        (auction) => getStatus(auction) === "completed",
      ).length,
    };
  }, [auctions]);

  /*
   * =========================================================
   * CHANGE AUCTION STATUS
   * =========================================================
   */

  const handleStatusChange = async (auction, newStatus) => {
    if (!auction?._id && !auction?.id) {
      toast.error("Auction ID is missing.");
      return;
    }

    const auctionId = auction._id || auction.id;

    setChangingStatus(auctionId);
    setOpenMenu(null);

    try {
      const response = await updateAuctionStatus(auctionId, {
        status: newStatus,
      });

      /*
       * Update locally when backend returns the updated auction.
       * Otherwise reload the list.
       */

      const updatedAuction = response?.data || response?.auction || response;

      if (updatedAuction && (updatedAuction?._id || updatedAuction?.id)) {
        setAuctions((current) =>
          current.map((item) =>
            String(item._id || item.id) === String(auctionId)
              ? updatedAuction
              : item,
          ),
        );
      } else {
        await loadAuctions(true);
      }

      toast.success(`Auction ${newStatus} successfully.`);
    } catch (err) {
      const message =
        err?.normalizedMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update auction status.";

      toast.error(message);
    } finally {
      setChangingStatus(null);
    }
  };

  /*
   * =========================================================
   * DELETE AUCTION
   * =========================================================
   */

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const auctionId = deleteTarget._id || deleteTarget.id;

    if (!auctionId) {
      toast.error("Auction ID is missing.");
      return;
    }

    setDeleting(true);

    try {
      await deleteAuction(auctionId);

      setAuctions((current) =>
        current.filter(
          (auction) => String(auction._id || auction.id) !== String(auctionId),
        ),
      );

      setDeleteTarget(null);

      toast.success("Auction deleted successfully.");
    } catch (err) {
      const message =
        err?.normalizedMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to delete auction.";

      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  /*
   * =========================================================
   * STATUS OPTIONS
   * =========================================================
   */

  const statusOptions = [
    {
      value: "upcoming",
      label: "Upcoming",
    },
    {
      value: "live",
      label: "Live",
    },
    {
      value: "paused",
      label: "Paused",
    },
    {
      value: "completed",
      label: "Completed",
    },
  ];

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return <PageLoader />;
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-500">
            <FiActivity size={16} />

            <span>Admin Panel</span>
          </div>

          <h1
            className="
              font-display
              text-3xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Auction Management
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create, manage and control your AuctionPro auctions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadAuctions(true)}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-navy-700
              dark:bg-navy-900
              dark:text-gray-200
              dark:hover:bg-navy-800
            "
          >
            <FiRefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/admin/auctions/create"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-cyan-400
            "
          >
            <FiPlus size={18} />
            Create Auction
          </Link>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStat
          label="Total"
          value={statistics.total}
          icon={<FiCalendar size={20} />}
        />

        <AdminStat
          label="Upcoming"
          value={statistics.upcoming}
          icon={<FiCalendar size={20} />}
        />

        <AdminStat
          label="Live"
          value={statistics.live}
          icon={<FiActivity size={20} />}
        />

        <AdminStat
          label="Paused"
          value={statistics.paused}
          icon={<FiActivity size={20} />}
        />

        <AdminStat
          label="Completed"
          value={statistics.completed}
          icon={<FiUsers size={20} />}
        />
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-8">
          <ErrorState
            title="Unable to load auctions"
            description={error}
            onRetry={() => loadAuctions()}
          />
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      {!error && (
        <div
          className="
            mb-6
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-4
            shadow-sm
            dark:border-navy-700
            dark:bg-navy-900
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <FiSearch
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search auctions..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  py-3
                  pl-10
                  pr-10
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  focus:border-cyan-500
                  focus:ring-2
                  focus:ring-cyan-500/10
                  dark:border-navy-700
                  dark:bg-navy-800
                  dark:text-white
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-gray-700
                    dark:hover:text-white
                  "
                >
                  <FiX size={17} />
                </button>
              )}
            </div>

            {/* STATUS FILTER */}

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </FilterButton>

              {statusOptions.map((status) => (
                <FilterButton
                  key={status.value}
                  active={statusFilter === status.value}
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          AUCTIONS
      ===================================================== */}

      {!error && filteredAuctions.length === 0 ? (
        <EmptyState
          title={
            auctions.length === 0 ? "No auctions found" : "No matching auctions"
          }
          description={
            auctions.length === 0
              ? "Create your first auction to get started."
              : "Try changing your search or status filter."
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAuctions.map((auction) => {
            const auctionId = auction?._id || auction?.id;

            const status = getStatus(auction);

            const isMenuOpen = openMenu === auctionId;

            const isChanging = changingStatus === auctionId;

            return (
              <div
                key={auctionId}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  dark:border-navy-700
                  dark:bg-navy-900
                "
              >
                {/* =================================================
                    IMAGE / HEADER
                ================================================= */}

                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-navy-900 to-navy-700">
                  {auction?.image ? (
                    <img
                      src={auction.image}
                      alt={auction?.name || "Auction"}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FiActivity size={48} className="text-cyan-400/60" />
                    </div>
                  )}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-black/20
                      to-transparent
                    "
                  />

                  {/* STATUS */}

                  <div className="absolute left-4 top-4">
                    <StatusBadge status={status} />
                  </div>

                  {/* MENU */}

                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(isMenuOpen ? null : auctionId)}
                      className="
                        rounded-lg
                        bg-black/30
                        p-2
                        text-white
                        backdrop-blur
                        transition
                        hover:bg-black/50
                      "
                    >
                      <FiMoreVertical size={18} />
                    </button>

                    {isMenuOpen && (
                      <div
                        className="
                          absolute
                          right-0
                          z-30
                          mt-2
                          w-48
                          overflow-hidden
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          py-1
                          shadow-xl
                          dark:border-navy-700
                          dark:bg-navy-800
                        "
                      >
                        <MenuButton
                          icon={<FiEye size={16} />}
                          onClick={() => {
                            setOpenMenu(null);

                            navigate(`/auctions/${auctionId}`);
                          }}
                        >
                          View Auction
                        </MenuButton>

                        <MenuButton
                          icon={<FiEdit2 size={16} />}
                          onClick={() => {
                            setOpenMenu(null);

                            navigate(`/admin/auctions/${auctionId}/edit`);
                          }}
                        >
                          Edit Auction
                        </MenuButton>

                        {status !== "live" && (
                          <MenuButton
                            icon={<FiActivity size={16} />}
                            disabled={isChanging}
                            onClick={() => handleStatusChange(auction, "live")}
                          >
                            Set Live
                          </MenuButton>
                        )}

                        {status === "live" && (
                          <MenuButton
                            icon={<FiActivity size={16} />}
                            disabled={isChanging}
                            onClick={() =>
                              handleStatusChange(auction, "paused")
                            }
                          >
                            Pause Auction
                          </MenuButton>
                        )}

                        {status === "paused" && (
                          <MenuButton
                            icon={<FiActivity size={16} />}
                            disabled={isChanging}
                            onClick={() => handleStatusChange(auction, "live")}
                          >
                            Resume Auction
                          </MenuButton>
                        )}

                        {status !== "completed" && (
                          <MenuButton
                            icon={<FiActivity size={16} />}
                            disabled={isChanging}
                            onClick={() =>
                              handleStatusChange(auction, "completed")
                            }
                          >
                            Complete Auction
                          </MenuButton>
                        )}

                        <div className="my-1 border-t border-gray-100 dark:border-navy-700" />

                        <MenuButton
                          danger
                          icon={<FiTrash2 size={16} />}
                          onClick={() => {
                            setOpenMenu(null);
                            setDeleteTarget(auction);
                          }}
                        >
                          Delete Auction
                        </MenuButton>
                      </div>
                    )}
                  </div>

                  {/* TITLE */}

                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="truncate text-xl font-bold text-white">
                      {auction?.name || "Untitled Auction"}
                    </h2>
                  </div>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-5">
                  {auction?.description && (
                    <p
                      className="
                        mb-4
                        line-clamp-2
                        text-sm
                        leading-6
                        text-gray-600
                        dark:text-gray-400
                      "
                    >
                      {auction.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem
                      label="Auction Date"
                      value={
                        auction?.date ? formatDate(auction.date) : "Not set"
                      }
                    />

                    <InfoItem
                      label="Starting Budget"
                      value={
                        auction?.startingBudget != null
                          ? formatCurrency(auction.startingBudget)
                          : "—"
                      }
                    />

                    <InfoItem
                      label="Minimum Bid"
                      value={
                        auction?.minimumBid != null
                          ? formatCurrency(auction.minimumBid)
                          : "—"
                      }
                    />

                    <InfoItem
                      label="Bid Increment"
                      value={
                        auction?.bidIncrement != null
                          ? formatCurrency(auction.bidIncrement)
                          : "—"
                      }
                    />
                  </div>

                  {/* LIMITS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-gray-50
                        px-3
                        py-2.5
                        dark:bg-navy-800
                      "
                    >
                      <FiUsers size={16} className="text-cyan-500" />

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Max Teams
                        </p>

                        <p className="text-sm font-semibold text-navy-950 dark:text-white">
                          {auction?.maxTeams ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-gray-50
                        px-3
                        py-2.5
                        dark:bg-navy-800
                      "
                    >
                      <FiUsers size={16} className="text-cyan-500" />

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Players / Team
                        </p>

                        <p className="text-sm font-semibold text-navy-950 dark:text-white">
                          {auction?.maxPlayersPerTeam ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to={`/auctions/${auctionId}`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-200
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-gray-700
                        transition
                        hover:bg-gray-50
                        dark:border-navy-700
                        dark:text-gray-200
                        dark:hover:bg-navy-800
                      "
                    >
                      <FiEye size={16} />
                      View
                    </Link>

                    <Link
                      to={`/admin/auctions/${auctionId}/control`}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-cyan-500
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-cyan-400
                      "
                    >
                      <FiActivity size={16} />
                      Control
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            px-4
            backdrop-blur-sm
          "
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-6
              shadow-2xl
              dark:border-navy-700
              dark:bg-navy-900
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3
                  className="
                    text-xl
                    font-bold
                    text-navy-950
                    dark:text-white
                  "
                >
                  Delete Auction?
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  dark:hover:bg-navy-800
                  dark:hover:text-white
                "
              >
                <FiX size={18} />
              </button>
            </div>

            <div
              className="
                rounded-xl
                bg-red-50
                p-4
                dark:bg-red-500/10
              "
            >
              <p className="text-sm text-red-700 dark:text-red-300">
                You are about to permanently delete{" "}
                <span className="font-bold">
                  {deleteTarget?.name || "this auction"}
                </span>
                .
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:opacity-50
                  dark:border-navy-700
                  dark:text-gray-200
                  dark:hover:bg-navy-800
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="
                  flex-1
                  rounded-xl
                  bg-red-500
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {deleting ? "Deleting..." : "Delete Auction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN STAT
============================================================ */

function AdminStat({ label, value, icon }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        shadow-sm
        dark:border-navy-700
        dark:bg-navy-900
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            {value}
          </p>
        </div>

        <div
          className="
            rounded-xl
            bg-cyan-500/10
            p-3
            text-cyan-500
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        px-3
        py-2
        text-sm
        font-semibold
        transition
        ${
          active
            ? `
              bg-cyan-500
              text-white
            `
            : `
              bg-gray-100
              text-gray-600
              hover:bg-gray-200
              dark:bg-navy-800
              dark:text-gray-300
              dark:hover:bg-navy-700
            `
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   MENU BUTTON
============================================================ */

function MenuButton({
  icon,
  children,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-3
        px-4
        py-2.5
        text-left
        text-sm
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          danger
            ? `
              text-red-600
              hover:bg-red-50
              dark:text-red-400
              dark:hover:bg-red-500/10
            `
            : `
              text-gray-700
              hover:bg-gray-50
              dark:text-gray-200
              dark:hover:bg-navy-700
            `
        }
      `}
    >
      {icon}

      <span>{children}</span>
    </button>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>

      <p
        className="
          mt-1
          truncate
          text-sm
          font-semibold
          text-navy-950
          dark:text-white
        "
      >
        {value}
      </p>
    </div>
  );
}