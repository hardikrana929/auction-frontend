import React, { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  deleteTeam,
  getTeamsByAuction,
  updateTeamStatus,
} from "../../api/teamApi";

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const unwrapTeams = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.teams)) {
    return response.teams;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.teams)) {
    return response.data.teams;
  }

  return [];
};

const getTeamId = (team) => team?._id || team?.id || team?.teamId || "";

const getTeamName = (team) => team?.name || team?.teamName || "Unnamed Team";

const getTeamLogo = (team) =>
  team?.logo || team?.logoUrl || team?.image || team?.teamLogo || "";

const normalizeStatus = (status) => {
  if (!status) return "active";

  return String(status).toLowerCase().trim();
};

const getOwnerName = (team) =>
  team?.ownerName || team?.owner?.name || team?.owner?.fullName || "—";

const getOwnerEmail = (team) => team?.ownerEmail || team?.owner?.email || "";

const getOwnerPhone = (team) => team?.ownerPhone || team?.owner?.phone || "";

const getAuctionId = (team) =>
  team?.auction?._id || team?.auction?.id || team?.auctionId || "";

const getResponseMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  const config = {
    active: {
      label: "Active",
      icon: FiCheckCircle,
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    },
    inactive: {
      label: "Inactive",
      icon: FiXCircle,
      className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    },
    pending: {
      label: "Pending",
      icon: FiAlertCircle,
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    },
  };

  const current = config[normalized] || {
    label: status || "Unknown",
    icon: FiAlertCircle,
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      <Icon size={13} />
      {current.label}
    </span>
  );
}

function TeamAvatar({ team, size = "md" }) {
  const [imageError, setImageError] = useState(false);

  const logo = getTeamLogo(team);
  const name = getTeamName(team);

  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : "h-11 w-11 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 font-black text-slate-500 ${sizeClass}`}
    >
      {logo && !imageError ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-full w-full object-contain p-1.5"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

function EmptyState({ searchActive, onClear }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FiUsers size={28} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {searchActive ? "No teams found" : "No teams available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searchActive
          ? "Try changing your search text or status filter."
          : "Create your first team to start managing auction participants."}
      </p>

      {searchActive ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <FiX size={16} />
          Clear Filters
        </button>
      ) : (
        <Link
          to="/admin/teams/create"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <FiPlus size={17} />
          Create Team
        </Link>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 px-5 py-5"
        >
          <div className="h-11 w-11 rounded-xl bg-slate-100" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-3 w-28 rounded bg-slate-100" />
          </div>

          <div className="hidden h-4 w-28 rounded bg-slate-100 md:block" />
          <div className="hidden h-6 w-20 rounded-full bg-slate-100 sm:block" />
          <div className="h-8 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);

  const [menuOpen, setMenuOpen] = useState(null);

  /*
   * Team API in the provided API reference is auction-scoped:
   * GET /api/teams/auction/:auctionId
   *
   * If your backend also provides GET /api/teams, this page can
   * be simplified to use that endpoint.
   *
   * For now, this page first attempts the generic team loader if
   * available and falls back gracefully.
   */

  const loadTeams = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Some projects expose getTeams() while the provided API
       * reference exposes getTeamsByAuction().
       *
       * We intentionally avoid inventing an auction ID here.
       * If your teamApi.js has getTeams(), use it.
       */

      let response;

      const teamApiModule = await import("../../api/teamApi");

      if (typeof teamApiModule.getTeams === "function") {
        response = await teamApiModule.getTeams();
      } else {
        /*
         * Without an auction ID, the backend reference does not
         * provide a global GET /api/teams endpoint.
         */
        response = { teams: [] };
      }

      const nextTeams = unwrapTeams(response);

      setTeams(nextTeams);
    } catch (err) {
      console.error("Failed to load teams:", err);

      const message = getResponseMessage(err, "Unable to load teams.");

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setMenuOpen(null);
    };

    if (menuOpen) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const name = getTeamName(team).toLowerCase();
      const owner = getOwnerName(team).toLowerCase();
      const email = getOwnerEmail(team).toLowerCase();
      const status = normalizeStatus(team?.status);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        owner.includes(query) ||
        email.includes(query);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teams, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));

  const paginatedTeams = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredTeams.slice(start, start + PAGE_SIZE);
  }, [filteredTeams, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const statistics = useMemo(() => {
    const active = teams.filter(
      (team) => normalizeStatus(team?.status) === "active",
    ).length;

    const inactive = teams.filter(
      (team) => normalizeStatus(team?.status) === "inactive",
    ).length;

    const pending = teams.filter(
      (team) => normalizeStatus(team?.status) === "pending",
    ).length;

    return {
      total: teams.length,
      active,
      inactive,
      pending,
    };
  }, [teams]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const teamId = getTeamId(deleteTarget);

    if (!teamId) {
      toast.error("Team ID is missing.");
      return;
    }

    try {
      setDeleting(true);

      await deleteTeam(teamId);

      setTeams((prev) => prev.filter((team) => getTeamId(team) !== teamId));

      toast.success("Team deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete team error:", err);

      toast.error(getResponseMessage(err, "Unable to delete team."));
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;

    const teamId = getTeamId(statusTarget);

    if (!teamId) {
      toast.error("Team ID is missing.");
      return;
    }

    const currentStatus = normalizeStatus(statusTarget.status);

    const nextStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      setChangingStatus(true);

      const response = await updateTeamStatus(teamId, {
        status: nextStatus,
      });

      const updatedTeam =
        response?.team || response?.data?.team || response?.data || {};

      setTeams((prev) =>
        prev.map((team) => {
          if (getTeamId(team) !== teamId) {
            return team;
          }

          return {
            ...team,
            ...updatedTeam,
            status: updatedTeam.status || nextStatus,
          };
        }),
      );

      toast.success(
        `Team ${
          nextStatus === "active" ? "activated" : "deactivated"
        } successfully.`,
      );

      setStatusTarget(null);
    } catch (err) {
      console.error("Update team status error:", err);

      toast.error(getResponseMessage(err, "Unable to update team status."));
    } finally {
      setChangingStatus(false);
    }
  };

  const renderMobileCard = (team) => {
    const teamId = getTeamId(team);
    const status = normalizeStatus(team?.status);
    const auctionId = getAuctionId(team);

    return (
      <div
        key={teamId}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <TeamAvatar team={team} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900">
                  {getTeamName(team)}
                </h3>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {getOwnerName(team)}
                </p>
              </div>

              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
          {getOwnerEmail(team) && (
            <p className="truncate text-xs text-slate-600">
              {getOwnerEmail(team)}
            </p>
          )}

          {getOwnerPhone(team) && (
            <p className="text-xs text-slate-600">{getOwnerPhone(team)}</p>
          )}

          {auctionId && (
            <p className="truncate text-xs text-slate-500">
              Auction: {auctionId}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {teamId && (
            <Link
              to={`/admin/teams/${teamId}/edit`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <FiEdit2 size={14} />
              Edit
            </Link>
          )}

          <button
            type="button"
            onClick={() => setStatusTarget(team)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {status === "active" ? (
              <>
                <FiXCircle size={14} />
                Disable
              </>
            ) : (
              <>
                <FiCheckCircle size={14} />
                Activate
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDeleteTarget(team)}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            <FiTrash2 size={14} />
            Delete Team
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              <FiShield size={13} />
              Admin Management
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Teams
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create, manage, activate, deactivate, and remove teams
              participating in AuctionPro auctions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadTeams(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/admin/teams/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <FiPlus size={17} />
              Create Team
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Teams
            </p>

            <p className="mt-2 text-2xl font-black text-slate-900">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Active
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-700">
              {statistics.active}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-black text-amber-700">
              {statistics.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Inactive
            </p>

            <p className="mt-2 text-2xl font-black text-slate-700">
              {statistics.inactive}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team, owner or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>

            <div className="relative lg:w-52">
              <FiFilter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FiX size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" size={19} />

            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">
                Unable to load teams
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadTeams()}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm ring-1 ring-red-100 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Mobile */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-36 rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          ) : paginatedTeams.length > 0 ? (
            paginatedTeams.map(renderMobileCard)
          ) : (
            <EmptyState
              searchActive={Boolean(search) || statusFilter !== "all"}
              onClear={clearFilters}
            />
          )}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Team
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Owner
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  <tr>
                    <td colSpan={5}>
                      <SkeletonRows />
                    </td>
                  </tr>
                </tbody>
              ) : paginatedTeams.length > 0 ? (
                <tbody className="divide-y divide-slate-100">
                  {paginatedTeams.map((team) => {
                    const teamId = getTeamId(team);
                    const status = normalizeStatus(team?.status);

                    return (
                      <tr
                        key={teamId}
                        className="group transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <TeamAvatar team={team} />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {getTeamName(team)}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                ID: {teamId ? teamId.slice(-8) : "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {getOwnerName(team)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {getOwnerEmail(team) ? (
                            <p className="max-w-[220px] truncate text-xs text-slate-500">
                              {getOwnerEmail(team)}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No email
                            </span>
                          )}

                          {getOwnerPhone(team) && (
                            <p className="mt-1 text-xs text-slate-400">
                              {getOwnerPhone(team)}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {teamId && (
                              <Link
                                to={`/admin/teams/${teamId}/edit`}
                                title="Edit team"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <FiEdit2 size={16} />
                              </Link>
                            )}

                            {teamId && (
                              <Link
                                to={`/teams/${teamId}`}
                                title="View team"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                <FiEye size={16} />
                              </Link>
                            )}

                            <div
                              className="relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuOpen(
                                    menuOpen === teamId ? null : teamId,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                <FiMoreVertical size={17} />
                              </button>

                              {menuOpen === teamId && (
                                <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStatusTarget(team);
                                      setMenuOpen(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                  >
                                    {status === "active" ? (
                                      <FiXCircle size={15} />
                                    ) : (
                                      <FiCheckCircle size={15} />
                                    )}

                                    {status === "active"
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteTarget(team);
                                      setMenuOpen(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    <FiTrash2 size={15} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={5} className="p-5">
                      <EmptyState
                        searchActive={Boolean(search) || statusFilter !== "all"}
                        onClear={clearFilters}
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredTeams.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-700">
                  {(page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-700">
                  {Math.min(page * PAGE_SIZE, filteredTeams.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {filteredTeams.length}
                </span>{" "}
                teams
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft size={17} />
                </button>

                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const pageNumber = index + 1;

                  if (
                    totalPages > 7 &&
                    pageNumber > 3 &&
                    pageNumber < totalPages - 2 &&
                    Math.abs(pageNumber - page) > 1
                  ) {
                    if (pageNumber === 4 || pageNumber === totalPages - 3) {
                      return (
                        <span
                          key={pageNumber}
                          className="flex h-9 w-9 items-center justify-center text-xs text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition ${
                        page === pageNumber
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FiTrash2 size={20} />
                </div>

                <button
                  type="button"
                  onClick={() => !deleting && setDeleteTarget(null)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-900">
                Delete Team?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to delete{" "}
                <strong className="text-slate-700">
                  {getTeamName(deleteTarget)}
                </strong>
                . This action may remove the team from related auction
                workflows.
              </p>

              <div className="mt-5 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
                <strong>Warning:</strong> Make sure this team is not required by
                an active auction before continuing.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      Delete Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {statusTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {normalizeStatus(statusTarget.status) === "active" ? (
                    <FiXCircle size={20} />
                  ) : (
                    <FiCheckCircle size={20} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => !changingStatus && setStatusTarget(null)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiX size={18} />
                </button>
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-900">
                {normalizeStatus(statusTarget.status) === "active"
                  ? "Deactivate Team?"
                  : "Activate Team?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Change the status of{" "}
                <strong className="text-slate-700">
                  {getTeamName(statusTarget)}
                </strong>
                ?
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={changingStatus}
                  onClick={() => setStatusTarget(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={changingStatus}
                  onClick={handleStatusChange}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingStatus ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      {normalizeStatus(statusTarget.status) === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
