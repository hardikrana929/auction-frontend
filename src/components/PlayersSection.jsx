import { useCallback, useEffect, useState } from "react";

import { FiRefreshCw, FiSearch, FiUsers } from "react-icons/fi";

import toast from "react-hot-toast";

import PlayerCard from "./PlayerCard";
import { getPlayersByAuction } from "../api/playerApi";

export default function PlayersSection({ auctionId }) {
  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadPlayers = useCallback(async () => {
    if (!auctionId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getPlayersByAuction(auctionId);

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.players)
            ? response.players
            : [];

      setPlayers(list);
    } catch (err) {
      const message =
        err.normalizedMessage || err.message || "Unable to load players.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const filteredPlayers = players.filter((player) => {
    const name = player?.name || player?.playerName || player?.fullName || "";

    const role = player?.role || player?.playerRole || player?.category || "";

    const searchText = `${name} ${role}`.toLowerCase();

    return searchText.includes(search.trim().toLowerCase());
  });

  return (
    <section className="mt-12">
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
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
              Auction Players
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
            Players
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Players available for this auction.
          </p>
        </div>

        {!loading && players.length > 0 && (
          <div
            className="
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
            {players.length} {players.length === 1 ? "Player" : "Players"}
          </div>
        )}
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      {!loading && !error && players.length > 0 && (
        <div className="mt-6">
          <div className="relative max-w-md">
            <FiSearch
              size={18}
              className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players..."
              aria-label="Search players"
              className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  outline-none
                  transition
                  focus:border-cyan-500
                  focus:ring-2
                  focus:ring-cyan-500/20
                  dark:border-navy-700
                  dark:bg-navy-900
                  dark:text-white
                "
            />
          </div>
        </div>
      )}

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
                h-96
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
            Unable to load players
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
            onClick={loadPlayers}
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

      {!loading && !error && players.length === 0 && (
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
            No players yet
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
            No players are currently associated with this auction.
          </p>
        </div>
      )}

      {/* =================================================
          SEARCH EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        players.length > 0 &&
        filteredPlayers.length === 0 && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-8
              text-center
              dark:border-navy-700
              dark:bg-navy-900
            "
          >
            <FiSearch
              size={24}
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
              No players found
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Try a different player name or role.
            </p>
          </div>
        )}

      {/* =================================================
          PLAYER CARDS
      ================================================= */}

      {!loading && !error && filteredPlayers.length > 0 && (
        <div
          className="
              mt-6
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
            "
        >
          {filteredPlayers.map((player, index) => (
            <PlayerCard
              key={player?._id || player?.id || `player-${index}`}
              player={player}
            />
          ))}
        </div>
      )}
    </section>
  );
}
