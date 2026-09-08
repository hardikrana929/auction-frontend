import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiShield,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import { getTeamById } from "../../api/teamApi";
import PageLoader from "../../components/PageLoader";

const TeamDetails = () => {
  const { teamId, id } = useParams();
  const currentTeamId = teamId || id;

  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadTeam = async () => {
      if (!currentTeamId) {
        setError("Team ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getTeamById(currentTeamId);

        if (!mounted) return;

        const teamData = response?.team || response?.data || response;

        if (!teamData || typeof teamData !== "object") {
          throw new Error("Team information was not found.");
        }

        setTeam(teamData);
      } catch (err) {
        if (!mounted) return;

        console.error("Failed to load team:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load team details.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      mounted = false;
    };
  }, [currentTeamId]);

  const getTeamId = () => {
    return team?._id || team?.id || currentTeamId || null;
  };

  const getTeamName = () => {
    return team?.name || "Unnamed Team";
  };

  const getOwnerName = () => {
    return (
      team?.ownerName || team?.owner?.name || team?.owner?.fullName || "N/A"
    );
  };

  const getOwnerEmail = () => {
    return team?.ownerEmail || team?.owner?.email || "N/A";
  };

  const getOwnerPhone = () => {
    return team?.ownerPhone || team?.owner?.phone || "N/A";
  };

  const getTeamLogo = () => {
    return team?.logo || team?.logoUrl || team?.image || null;
  };

  const getAuctionName = () => {
    return team?.auction?.name || team?.auctionName || "Not assigned";
  };

  const getAuctionId = () => {
    return team?.auction?._id || team?.auction?.id || team?.auctionId || null;
  };

  const getPlayers = () => {
    if (Array.isArray(team?.players)) {
      return team.players;
    }

    return [];
  };

  const getPlayerCount = () => {
    if (Array.isArray(team?.players)) {
      return team.players.length;
    }

    return team?.playerCount ?? 0;
  };

  const getStatus = () => {
    const status = team?.status;

    if (!status) {
      return "active";
    }

    return String(status).toLowerCase();
  };

  const getStatusInfo = () => {
    const status = getStatus();

    if (status === "active" || status === "approved") {
      return {
        label: "Active",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    }

    if (status === "inactive" || status === "rejected") {
      return {
        label: "Inactive",
        className: "bg-red-50 text-red-700 ring-red-600/20",
      };
    }

    if (status === "pending") {
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 ring-amber-600/20",
      };
    }

    return {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: "bg-slate-50 text-slate-700 ring-slate-600/20",
    };
  };

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "₹0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        {" "}
        <div className="mx-auto max-w-3xl">
          {" "}
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            {" "}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              {" "}
              <FiAlertCircle className="h-7 w-7 text-red-500" />{" "}
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load team
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              {error || "Team information could not be found."}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiRefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/teams")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Teams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const logo = getTeamLogo();
  const players = getPlayers();

  // IMPORTANT:
  // Do not declare `teamId` again here.
  const resolvedTeamId = getTeamId();

  const auctionId = getAuctionId();

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/teams")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Teams
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Team Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View complete information about this team.
            </p>
          </div>

          {resolvedTeamId && (
            <Link
              to={`/admin/teams/edit/${resolvedTeamId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Team
            </Link>
          )}
        </div>

        {/* Main Team Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 sm:h-40" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                {logo ? (
                  <img
                    src={logo}
                    alt={getTeamName()}
                    className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg sm:h-32 sm:w-32"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-white shadow-lg sm:h-32 sm:w-32">
                    <FiUsers className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                )}

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {getTeamName()}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Team ID: {resolvedTeamId ? String(resolvedTeamId) : "N/A"}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Players
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {getPlayerCount()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiUsers className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Auction
                </p>

                <p className="mt-2 max-w-[170px] truncate text-lg font-bold text-slate-900">
                  {getAuctionName()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Budget
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatCurrency(
                    team?.budget ?? team?.remainingBudget ?? team?.purse,
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Created
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatDate(team?.createdAt)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Owner Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <FiShield className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Owner Information
                </h3>

                <p className="text-xs text-slate-500">
                  Team owner contact details
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {getOwnerName()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                {getOwnerEmail() !== "N/A" ? (
                  <a
                    href={`mailto:${getOwnerEmail()}`}
                    className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    <FiMail className="h-4 w-4 shrink-0" />
                    {getOwnerEmail()}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">N/A</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                {getOwnerPhone() !== "N/A" ? (
                  <a
                    href={`tel:${getOwnerPhone()}`}
                    className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    <FiPhone className="h-4 w-4 shrink-0" />
                    {getOwnerPhone()}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">N/A</p>
                )}
              </div>
            </div>
          </div>

          {/* Auction Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                <FiCalendar className="h-5 w-5 text-violet-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Auction Information
                </h3>

                <p className="text-xs text-slate-500">
                  Auction assigned to this team
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Auction Name
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {getAuctionName()}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Auction ID
                </p>

                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                  {auctionId || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Team Status
                </p>

                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Last Updated
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {formatDate(team?.updatedAt)}
                </p>
              </div>
            </div>

            {auctionId && (
              <div className="mt-5">
                <Link
                  to={`/auctions/${auctionId}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  View Auction
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Team Players</h3>

              <p className="mt-1 text-sm text-slate-500">
                Players currently associated with this team.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {players.length} Players
            </span>
          </div>

          {players.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {players.map((player, index) => {
                const playerId = player?._id || player?.id;

                const playerName =
                  player?.name || player?.playerName || `Player ${index + 1}`;

                const playerRole = player?.role || player?.type || "Player";

                const playerImage =
                  player?.image || player?.imageUrl || player?.photo || null;

                return (
                  <div
                    key={playerId || `player-${index}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {playerImage ? (
                        <img
                          src={playerImage}
                          alt={playerName}
                          className="h-11 w-11 rounded-xl border border-slate-200 object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <FiUsers className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {playerName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {playerRole}
                        </p>
                      </div>
                    </div>

                    {playerId && (
                      <Link
                        to={`/players/${playerId}`}
                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        View
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <FiUsers className="h-5 w-5 text-slate-400" />
              </div>

              <h4 className="mt-4 font-semibold text-slate-800">
                No players assigned
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                This team currently has no players.
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <FiShield className="h-4 w-4 text-slate-700" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Protected Admin View
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Team information is displayed through the protected admin
              interface. Sensitive owner information should only be exposed to
              authorized users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
