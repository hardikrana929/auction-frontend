import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { getAuctionParticipants } from "../api/auctionAccessApi";
import { toImageUrl } from "../utils/imageUrl";

const AuctionParticipants = () => {
  const { id } = useParams();

  const [participants, setParticipants] = useState([]);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const normalizeParticipants = useCallback((response) => {
    if (!response) return [];

    let data = response;

    if (response?.data) {
      data = response.data;
    }

    if (response?.participants) {
      data = response.participants;
    } else if (response?.data?.participants) {
      data = response.data.participants;
    } else if (response?.teams) {
      data = response.teams;
    } else if (response?.data?.teams) {
      data = response.data.teams;
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  }, []);

  const loadParticipants = useCallback(
    async (showRefresh = false) => {
      if (!id) {
        setError("Auction ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAuctionParticipants(id);

        const list = normalizeParticipants(response);

        setParticipants(list);

        const responseAuction =
          response?.auction ||
          response?.data?.auction ||
          response?.auctionData ||
          null;

        if (responseAuction) {
          setAuction(responseAuction);
        }
      } catch (err) {
        console.error("Failed to load auction participants:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load auction participants.";

        setError(message);

        if (showRefresh) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, normalizeParticipants],
  );

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const approvedParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const status = String(
        participant?.status ||
          participant?.registrationStatus ||
          participant?.registration?.status ||
          "approved",
      ).toLowerCase();

      return status === "approved";
    });
  }, [participants]);

  const displayParticipants = useMemo(() => {
    /*
     * If the backend already returns only approved participants,
     * preserve the returned list even when a status field is absent.
     */
    const hasStatusInformation = participants.some(
      (participant) =>
        participant?.status ||
        participant?.registrationStatus ||
        participant?.registration?.status,
    );

    return hasStatusInformation ? approvedParticipants : participants;
  }, [participants, approvedParticipants]);

  const getTeamId = (participant) => {
    return (
      participant?.team?._id ||
      participant?.team?.id ||
      participant?.teamId ||
      participant?._id ||
      participant?.id ||
      ""
    );
  };

  const getTeamName = (participant) => {
    return (
      participant?.team?.name ||
      participant?.teamName ||
      participant?.name ||
      participant?.team?.teamName ||
      "Unnamed Team"
    );
  };

  const getTeamLogo = (participant) => {
    return (
      toImageUrl(participant?.team?.logo) ||
      toImageUrl(participant?.team?.image) ||
      toImageUrl(participant?.teamLogo) ||
      toImageUrl(participant?.logo) ||
      toImageUrl(participant?.image) ||
      ""
    );
  };

  const getOwnerName = (participant) => {
    const owner =
      participant?.team?.owner ||
      participant?.owner ||
      participant?.user ||
      participant?.registeredBy ||
      participant?.registration?.user ||
      null;

    if (typeof owner === "string") {
      return owner;
    }

    return (
      owner?.name ||
      owner?.fullName ||
      owner?.username ||
      owner?.email ||
      "Team Owner"
    );
  };

  const getStatus = (participant) => {
    const status =
      participant?.status ||
      participant?.registrationStatus ||
      participant?.registration?.status ||
      "approved";

    return String(status).toLowerCase();
  };

  const getInitial = (name) => {
    if (!name) return "T";

    return name.trim().charAt(0).toUpperCase();
  };

  const pageTitle =
    auction?.name ||
    auction?.title ||
    auction?.auctionName ||
    "Auction Participants";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />

          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Loading auction participants...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/auctions/${id}`}
            className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
          >
            <FiArrowLeft />
            Back to Auction
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FiUsers className="text-xl" />
                </div>

                <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Participants
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {pageTitle}
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Teams approved to participate in this auction.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadParticipants(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="mt-0.5 shrink-0 text-lg text-red-600 dark:text-red-400" />

              <div className="min-w-0">
                <h2 className="font-semibold text-red-800 dark:text-red-300">
                  Unable to load participants
                </h2>

                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadParticipants(true)}
                  className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2 hover:no-underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Approved Teams
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {displayParticipants.length}
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <FiCheckCircle className="text-xl" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Auction Status
                </p>

                <p className="mt-1 text-lg font-bold capitalize text-gray-900 dark:text-white">
                  {auction?.status || "Available"}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FiShield className="text-xl" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Access
                </p>

                <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                  Approved
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <FiCheckCircle className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty */}
        {!error && displayParticipants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <FiUsers className="text-2xl" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              No approved teams yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              There are currently no approved participants for this auction.
            </p>
          </div>
        )}

        {/* Participants */}
        {displayParticipants.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayParticipants.map((participant, index) => {
              const teamId = getTeamId(participant);
              const teamName = getTeamName(participant);
              const teamLogo = getTeamLogo(participant);
              const ownerName = getOwnerName(participant);
              const status = getStatus(participant);

              return (
                <div
                  key={teamId || `participant-${index}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Card top */}
                  <div className="h-2 bg-indigo-600" />

                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-xl font-bold text-indigo-600 dark:bg-gray-800 dark:text-indigo-400">
                        {teamLogo ? (
                          <img
                            src={teamLogo}
                            alt={`${teamName} logo`}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}

                        <span
                          className={
                            teamLogo
                              ? "hidden h-full w-full items-center justify-center"
                              : ""
                          }
                        >
                          {getInitial(teamName)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2
                          className="truncate text-base font-bold text-gray-900 dark:text-white"
                          title={teamName}
                        >
                          {teamName}
                        </h2>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <FiUsers className="shrink-0" />
                          <span className="truncate">{ownerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Registration
                      </span>

                      {status === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                          <FiCheckCircle />
                          Approved
                        </span>
                      ) : status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                          <FiClock />
                          Pending
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionParticipants;
