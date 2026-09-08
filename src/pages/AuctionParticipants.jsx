import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { getAuctionById } from "../api/auctionApi";
import { getAuctionParticipants } from "../api/auctionAccessApi";
import PageLoader from "../components/PageLoader";

const AuctionParticipants = () => {
  const { auctionId, id } = useParams();

  const currentAuctionId = auctionId || id;

  const [auction, setAuction] = useState(null);
  const [participants, setParticipants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadData = async (isRefresh = false) => {
    if (!currentAuctionId) {
      setError("Auction ID is missing.");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [auctionResponse, participantsResponse] = await Promise.all([
        getAuctionById(currentAuctionId),
        getAuctionParticipants(currentAuctionId),
      ]);

      const auctionData =
        auctionResponse?.auction || auctionResponse?.data || auctionResponse;

      const participantData =
        participantsResponse?.participants ||
        participantsResponse?.teams ||
        participantsResponse?.data ||
        participantsResponse;

      setAuction(
        auctionData && typeof auctionData === "object" ? auctionData : null,
      );

      if (Array.isArray(participantData)) {
        setParticipants(participantData);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      console.error("Failed to load auction participants:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load auction participants.";

      setError(message);

      if (isRefresh) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await loadData(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [currentAuctionId]);

  const getTeamId = (team) => {
    return (
      team?._id ||
      team?.id ||
      team?.teamId ||
      team?.team?._id ||
      team?.team?.id ||
      null
    );
  };

  const getTeamName = (team) => {
    return team?.name || team?.teamName || team?.team?.name || "Unnamed Team";
  };

  const getOwnerName = (team) => {
    return (
      team?.ownerName || team?.owner?.name || team?.team?.ownerName || "N/A"
    );
  };

  const getOwnerEmail = (team) => {
    return (
      team?.ownerEmail ||
      team?.owner?.email ||
      team?.team?.ownerEmail ||
      team?.team?.owner?.email ||
      null
    );
  };

  const getOwnerPhone = (team) => {
    return (
      team?.ownerPhone ||
      team?.owner?.phone ||
      team?.team?.ownerPhone ||
      team?.team?.owner?.phone ||
      null
    );
  };

  const getLogo = (team) => {
    return (
      team?.logo ||
      team?.logoUrl ||
      team?.image ||
      team?.team?.logo ||
      team?.team?.logoUrl ||
      null
    );
  };

  const getRegistrationStatus = (team) => {
    const status =
      team?.registrationStatus ||
      team?.status ||
      team?.registration?.status ||
      "approved";

    return String(status).toLowerCase();
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

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return participants;
    }

    return participants.filter((participant) => {
      const teamName = getTeamName(participant).toLowerCase();

      const ownerName = getOwnerName(participant).toLowerCase();

      const email = getOwnerEmail(participant)?.toLowerCase() || "";

      return (
        teamName.includes(query) ||
        ownerName.includes(query) ||
        email.includes(query)
      );
    });
  }, [participants, search]);

  const approvedCount = participants.filter(
    (participant) =>
      getRegistrationStatus(participant) === "approved" ||
      getRegistrationStatus(participant) === "active",
  ).length;

  if (loading) {
    return <PageLoader />;
  }

  if (!currentAuctionId) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        {" "}
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          {" "}
          <FiAlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Auction ID is missing
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A valid auction ID is required to view participants.
          </p>
          <Link
            to="/auctions"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        {" "}
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          {" "}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            {" "}
            <FiAlertCircle className="h-7 w-7 text-red-500" />{" "}
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load participants
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FiRefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to={`/auctions/${currentAuctionId}`}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Auction
            </Link>

            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <FiUsers className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Auction Participants
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {auction?.name || "Registered auction teams"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Auction Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Participants
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {participants.length}
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
                  Approved
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {approvedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Auction Date
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatDate(auction?.date)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team, owner or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Error while data exists */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <FiAlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Participants */}
        {filteredParticipants.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FiUsers className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              {search ? "No participants found" : "No participants yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try changing your search criteria."
                : "No approved teams are currently available for this auction."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredParticipants.map((participant, index) => {
              const participantId = getTeamId(participant);

              const teamName = getTeamName(participant);

              const ownerName = getOwnerName(participant);

              const ownerEmail = getOwnerEmail(participant);

              const ownerPhone = getOwnerPhone(participant);

              const logo = getLogo(participant);

              const status = getRegistrationStatus(participant);

              const isApproved = status === "approved" || status === "active";

              return (
                <div
                  key={participantId || `participant-${index}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Card Top */}
                  <div className="h-20 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700" />

                  <div className="px-5 pb-5">
                    {/* Logo */}
                    <div className="-mt-10 flex items-end justify-between">
                      {logo ? (
                        <img
                          src={logo}
                          alt={teamName}
                          className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-white shadow-md">
                          <FiUsers className="h-8 w-8" />
                        </div>
                      )}

                      <span
                        className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-amber-50 text-amber-700 ring-amber-600/20"
                        }`}
                      >
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        {isApproved ? "Approved" : status}
                      </span>
                    </div>

                    {/* Team */}
                    <div className="mt-4">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {teamName}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Team participant
                      </p>
                    </div>

                    {/* Owner */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FiShield className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Owner
                          </p>

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {ownerName}
                          </p>
                        </div>
                      </div>

                      {ownerEmail && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <FiMail className="h-4 w-4 text-slate-600" />
                          </div>

                          <a
                            href={`mailto:${ownerEmail}`}
                            className="min-w-0 truncate pt-1 text-sm text-slate-600 hover:text-slate-900"
                          >
                            {ownerEmail}
                          </a>
                        </div>
                      )}

                      {ownerPhone && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <FiPhone className="h-4 w-4 text-slate-600" />
                          </div>

                          <a
                            href={`tel:${ownerPhone}`}
                            className="pt-1 text-sm text-slate-600 hover:text-slate-900"
                          >
                            {ownerPhone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      {participantId ? (
                        <Link
                          to={`/admin/teams/view/${participantId}`}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Team
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <div className="flex w-full items-center justify-center rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-400">
                          Team details unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <FiShield className="h-4 w-4 text-slate-700" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Protected Auction Information
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Participant information is displayed through the protected
              AuctionPro interface. Access should be restricted according to the
              user's auction permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionParticipants;
