import { useCallback, useEffect, useState } from "react";

import { FiCheck, FiRefreshCw, FiUsers, FiX } from "react-icons/fi";

import toast from "react-hot-toast";

import {
  approveRegistration,
  getAuctionRegistrations,
  rejectRegistration,
} from "../../api/auctionRegistrationApi";

import RegistrationStatusBadge from "../../components/RegistrationStatusBadge";

export default function AdminRegistrations({ auctionId }) {
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionId, setActionId] = useState("");

  const [error, setError] = useState("");

  const loadRegistrations = useCallback(async () => {
    if (!auctionId) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAuctionRegistrations(auctionId);

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.registrations)
            ? response.registrations
            : [];

      setRegistrations(list);
    } catch (err) {
      const message =
        err.normalizedMessage || err.message || "Unable to load registrations.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleApprove = async (registrationId) => {
    setActionId(registrationId);

    try {
      await approveRegistration(registrationId);

      toast.success("Registration approved.");

      await loadRegistrations();
    } catch (err) {
      toast.error(
        err.normalizedMessage ||
          err.message ||
          "Unable to approve registration.",
      );
    } finally {
      setActionId("");
    }
  };

  const handleReject = async (registrationId) => {
    setActionId(registrationId);

    try {
      await rejectRegistration(registrationId);

      toast.success("Registration rejected.");

      await loadRegistrations();
    } catch (err) {
      toast.error(
        err.normalizedMessage ||
          err.message ||
          "Unable to reject registration.",
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        dark:border-navy-700
        dark:bg-navy-900
      "
    >
      {/* Header */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-gray-200
          p-6
          sm:flex-row
          sm:items-center
          sm:justify-between
          dark:border-navy-700
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/10
              text-cyan-500
            "
          >
            <FiUsers size={21} />
          </div>

          <div>
            <h2
              className="
                font-display
                text-xl
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              Auction Registrations
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Review teams requesting access.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadRegistrations}
          disabled={loading}
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
            disabled:opacity-50
            dark:border-navy-700
            dark:text-gray-300
            dark:hover:bg-navy-800
          "
        >
          <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}

      {loading && (
        <div className="space-y-3 p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-20
                animate-pulse
                rounded-xl
                bg-gray-100
                dark:bg-navy-850
              "
            />
          ))}
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="p-8 text-center">
          <p
            className="
              text-sm
              text-danger-500
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={loadRegistrations}
            className="
              mt-4
              rounded-xl
              bg-cyan-500
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}

      {!loading && !error && registrations.length === 0 && (
        <div
          className="
              p-10
              text-center
            "
        >
          <FiUsers
            size={28}
            className="
                mx-auto
                text-gray-400
              "
          />

          <h3
            className="
                mt-4
                font-semibold
                text-navy-950
                dark:text-white
              "
          >
            No registrations
          </h3>

          <p
            className="
                mt-2
                text-sm
                text-gray-500
                dark:text-gray-400
              "
          >
            No teams have registered for this auction yet.
          </p>
        </div>
      )}

      {/* Registrations */}

      {!loading && !error && registrations.length > 0 && (
        <div className="divide-y divide-gray-200 dark:divide-navy-700">
          {registrations.map((registration) => {
            const registrationId = registration?._id || registration?.id;

            const team = registration?.team || {};

            const teamName =
              team?.name || team?.teamName || registration?.teamName || "Team";

            const status = String(
              registration?.status || "pending",
            ).toLowerCase();

            const processing = actionId === registrationId;

            return (
              <div
                key={registrationId}
                className="
                      flex
                      flex-col
                      gap-4
                      p-5
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
              >
                <div
                  className="
                        flex
                        min-w-0
                        items-center
                        gap-4
                      "
                >
                  <div
                    className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-navy-900
                          text-sm
                          font-bold
                          text-cyan-400
                          dark:bg-navy-800
                        "
                  >
                    {teamName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                            truncate
                            font-semibold
                            text-navy-950
                            dark:text-white
                          "
                    >
                      {teamName}
                    </h3>

                    <div className="mt-1">
                      <RegistrationStatusBadge status={status} />
                    </div>
                  </div>
                </div>

                {/* Actions */}

                {status === "pending" && (
                  <div
                    className="
                          flex
                          gap-2
                        "
                  >
                    <button
                      type="button"
                      onClick={() => handleApprove(registrationId)}
                      disabled={processing}
                      className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-success-500
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:opacity-90
                            disabled:opacity-50
                          "
                    >
                      <FiCheck size={16} />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(registrationId)}
                      disabled={processing}
                      className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-danger-500
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:opacity-90
                            disabled:opacity-50
                          "
                    >
                      <FiX size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
