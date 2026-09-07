import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

import TeamCard from "./TeamCard";
import { getTeamsByAuction } from "../api/teamApi";

export default function TeamsSection({ auctionId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = useCallback(async () => {
    if (!auctionId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getTeamsByAuction(auctionId);

      /*
       * Support common API response envelopes
       * without changing the backend contract.
       */
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.teams)
            ? response.teams
            : [];

      setTeams(list);
    } catch (err) {
      const message =
        err.normalizedMessage || err.message || "Unable to load teams.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return (
    <section className="mt-10">
      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-cyan-500
            "
          >
            <FiUsers size={18} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Participating Teams
            </span>
          </div>

          <h2
            className="
              mt-2
              font-display
              text-2xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Teams
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Teams participating in this AuctionPro auction.
          </p>
        </div>

        {!loading && teams.length > 0 && (
          <span
            className="
              w-fit
              rounded-full
              bg-cyan-500/10
              px-3
              py-1.5
              text-xs
              font-bold
              text-cyan-600
              dark:text-cyan-400
            "
          >
            {teams.length} {teams.length === 1 ? "Team" : "Teams"}
          </span>
        )}
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div
          className="
            mt-6
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-72
                animate-pulse
                rounded-2xl
                bg-gray-200
                dark:bg-navy-850
              "
            />
          ))}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-200
            bg-white
            p-8
            text-center
            dark:border-red-900/50
            dark:bg-navy-900
          "
        >
          <h3
            className="
              text-lg
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Unable to load teams
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={loadTeams}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-cyan-400
            "
          >
            <FiRefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading && !error && teams.length === 0 && (
        <div
          className="
              mt-6
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-10
              text-center
              dark:border-navy-700
              dark:bg-navy-900
            "
        >
          <div
            className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-cyan-500/10
                text-cyan-500
              "
          >
            <FiUsers size={24} />
          </div>

          <h3
            className="
                mt-5
                text-lg
                font-bold
                text-navy-950
                dark:text-white
              "
          >
            No teams yet
          </h3>

          <p
            className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-gray-500
                dark:text-gray-400
              "
          >
            No teams are currently associated with this auction.
          </p>
        </div>
      )}

      {/* =================================================
          TEAM CARDS
      ================================================= */}

      {!loading && !error && teams.length > 0 && (
        <div
          className="
              mt-6
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
            "
        >
          {teams.map((team, index) => (
            <TeamCard
              key={team?._id || team?.id || `team-${index}`}
              team={team}
            />
          ))}
        </div>
      )}
    </section>
  );
}
