import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
} from "react-icons/fi";

const TeamManagementTable = ({
  teams = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  const getTeamId = (team) => team?._id || team?.id;

  const getTeamName = (team) => team?.name || "Unnamed Team";

  const getOwnerName = (team) =>
    team?.ownerName || team?.owner?.name || team?.owner?.fullName || "N/A";

  const getOwnerEmail = (team) =>
    team?.ownerEmail || team?.owner?.email || "N/A";

  const getStatus = (team) => {
    const status = team?.status;

    if (!status) return "active";

    return String(status).toLowerCase();
  };

  const getLogo = (team) => team?.logo || team?.logoUrl || team?.image || null;

  const normalizeStatus = (status) => {
    if (status === "active" || status === "approved") {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    }

    ```
if (status === "inactive" || status === "rejected") {
  return {
    label: "Inactive",
    className:
      "bg-red-50 text-red-700 ring-red-600/20",
  };
}

if (status === "pending") {
  return {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
}

return {
  label: status.charAt(0).toUpperCase() + status.slice(1),
  className:
    "bg-slate-50 text-slate-700 ring-slate-600/20",
};
```;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {" "}
        <div className="hidden overflow-x-auto lg:block">
          {" "}
          <table className="min-w-full">
            {" "}
            <thead className="border-b border-slate-200 bg-slate-50">
              {" "}
              <tr>
                {[
                  "Team",
                  "Owner",
                  "Auction",
                  "Players",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {heading}{" "}
                  </th>
                ))}{" "}
              </tr>{" "}
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((item) => (
                <tr
                  key={item}
                  className="border-b border-slate-100 last:border-0"
                >
                  {[1, 2, 3, 4, 5, 6].map((column) => (
                    <td key={column} className="px-6 py-5">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4 p-4 lg:hidden">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>

              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
        {" "}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          {" "}
          <FiUsers className="h-7 w-7 text-slate-400" />{" "}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No teams found</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          There are no teams matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}{" "}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        {" "}
        <div className="overflow-x-auto">
          {" "}
          <table className="min-w-full">
            {" "}
            <thead className="border-b border-slate-200 bg-slate-50">
              {" "}
              <tr>
                {" "}
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Team{" "}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Auction
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Players
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teams.map((team) => {
                const teamId = getTeamId(team);
                const status = getStatus(team);
                const statusInfo = normalizeStatus(status);
                const logo = getLogo(team);

                return (
                  <tr
                    key={teamId || `team-${Math.random()}`}
                    className="transition hover:bg-slate-50/70"
                  >
                    {/* Team */}
                    <td className="whitespace-nowrap px-6 py-5">
                      <div className="flex items-center gap-3">
                        {logo ? (
                          <img
                            src={logo}
                            alt={getTeamName(team)}
                            className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextElementSibling?.classList.remove(
                                "hidden",
                              );
                            }}
                          />
                        ) : null}

                        <div
                          className={`${
                            logo ? "hidden" : ""
                          } flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white`}
                        >
                          <FiUsers className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate font-semibold text-slate-900">
                            {getTeamName(team)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            ID: {teamId ? String(teamId).slice(-8) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-medium text-slate-800">
                          {getOwnerName(team)}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {getOwnerEmail(team)}
                        </p>
                      </div>
                    </td>

                    {/* Auction */}
                    <td className="px-6 py-5">
                      <p className="max-w-[180px] truncate text-sm font-medium text-slate-800">
                        {team?.auction?.name ||
                          team?.auctionName ||
                          "Not assigned"}
                      </p>
                    </td>

                    {/* Players */}
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                        <FiUsers className="h-4 w-4" />
                        {Array.isArray(team?.players)
                          ? team.players.length
                          : (team?.playerCount ?? 0)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => teamId && onStatusChange?.(team)}
                        disabled={!teamId}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 ${statusInfo.className}`}
                        title="Change team status"
                      >
                        {status === "active" || status === "approved" ? (
                          <FiCheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <FiXCircle className="h-3.5 w-3.5" />
                        )}

                        {statusInfo.label}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => teamId && onView?.(team)}
                          disabled={!teamId}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                          title="View team"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => teamId && onEdit?.(team)}
                          disabled={!teamId}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Edit team"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => teamId && onDelete?.(team)}
                          disabled={!teamId}
                          className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete team"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {teams.map((team) => {
          const teamId = getTeamId(team);
          const status = getStatus(team);
          const statusInfo = normalizeStatus(status);
          const logo = getLogo(team);

          return (
            <div
              key={teamId || `mobile-team-${Math.random()}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt={getTeamName(team)}
                      className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white">
                      <FiUsers className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {getTeamName(team)}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {getOwnerName(team)}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Auction
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {team?.auction?.name || team?.auctionName || "Not assigned"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Players
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {Array.isArray(team?.players)
                      ? team.players.length
                      : (team?.playerCount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!teamId) return;
                    onView?.(team);
                    navigate(`/admin/teams/view/${teamId}`);
                  }}
                  disabled={!teamId}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <FiEye className="h-4 w-4" />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => teamId && onEdit?.(team)}
                  disabled={!teamId}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <FiEdit2 className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => teamId && onDelete?.(team)}
                  disabled={!teamId}
                  className="flex items-center justify-center rounded-xl border border-red-100 px-3 py-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TeamManagementTable;
