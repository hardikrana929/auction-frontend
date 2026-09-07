import { useState } from "react";
import { FiSearch, FiUsers, FiRefreshCw, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

import { getPlayersByAuction } from "../../api/playerApi";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminPlayers() {
  const [auctionId, setAuctionId] = useState("");
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPlayers = async () => {
    const id = auctionId.trim();

    if (!id) {
      toast.error("Please enter Auction ID");
      return;
    }

    try {
      setLoading(true);

      console.log("Loading players for auction:", id);

      const response = await getPlayersByAuction(id);

      console.log("Players API response:", response);

      /*
       * Handle different possible response structures.
       *
       * Example:
       * []
       *
       * or
       * { players: [] }
       *
       * or
       * { data: [] }
       *
       * or
       * { data: { players: [] } }
       */

      let playerList = [];

      if (Array.isArray(response)) {
        playerList = response;
      } else if (Array.isArray(response?.players)) {
        playerList = response.players;
      } else if (Array.isArray(response?.data)) {
        playerList = response.data;
      } else if (Array.isArray(response?.data?.players)) {
        playerList = response.data.players;
      } else if (Array.isArray(response?.results)) {
        playerList = response.results;
      }

      console.log("Final player list:", playerList);

      setPlayers(playerList);

      if (playerList.length === 0) {
        toast("No players found for this auction");
      } else {
        toast.success(`${playerList.length} players loaded`);
      }
    } catch (error) {
      console.error("Players loading error:", error);

      setPlayers([]);

      toast.error(error?.response?.data?.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const name = player?.name || player?.playerName || player?.fullName || "";

    const role = player?.role || player?.playerRole || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ================= HEADER ================= */}

      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <FiUsers size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-navy-950 dark:text-white">
              Player Management
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View players registered for an auction.
            </p>
          </div>
        </div>
      </div>

      {/* ================= AUCTION SEARCH ================= */}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
        <div className="mb-4">
          <h2 className="font-semibold text-navy-950 dark:text-white">
            Select Auction
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter the Auction ID to load its players.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadPlayers();
              }
            }}
            placeholder="Enter Auction ID"
            className="
              flex-1
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-cyan-500
              focus:ring-2
              focus:ring-cyan-500/20
              dark:border-navy-700
              dark:bg-navy-950
              dark:text-white
            "
          />

          <button
            type="button"
            onClick={loadPlayers}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-cyan-500
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-cyan-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <FiRefreshCw size={17} className={loading ? "animate-spin" : ""} />

            {loading ? "Loading..." : "Load Players"}
          </button>
        </div>
      </div>

      {/* ================= PLAYER SECTION ================= */}

      {players.length > 0 && (
        <>
          {/* Search */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-950 dark:text-white">
                Players
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {players.length} player
                {players.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <FiSearch
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  py-2.5
                  pl-10
                  pr-4
                  text-sm
                  outline-none
                  focus:border-cyan-500
                  dark:border-navy-700
                  dark:bg-navy-900
                  dark:text-white
                "
              />
            </div>
          </div>

          {/* ================= PLAYER CARDS ================= */}

          {filteredPlayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-navy-700 dark:bg-navy-900">
              <FiSearch className="mx-auto mb-3 text-gray-400" size={35} />

              <h3 className="font-semibold text-navy-950 dark:text-white">
                No matching players
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try a different search.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlayers.map((player, index) => {
                const playerId = player?._id || player?.id || `player-${index}`;

                const name =
                  player?.name ||
                  player?.playerName ||
                  player?.fullName ||
                  "Unknown Player";

                const role = player?.role || player?.playerRole || "Player";

                const basePrice =
                  player?.basePrice ??
                  player?.startingPrice ??
                  player?.minimumBid ??
                  0;

                const status = player?.status || "Available";

                const image =
                  player?.image ||
                  player?.imageUrl ||
                  player?.photo ||
                  player?.profileImage ||
                  null;

                return (
                  <div
                    key={playerId}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                      transition
                      duration-200
                      hover:-translate-y-1
                      hover:shadow-lg
                      dark:border-navy-700
                      dark:bg-navy-900
                    "
                  >
                    {/* Player Image */}

                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-100 dark:bg-navy-800">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                            <FiUser size={40} />
                          </div>
                        </div>
                      )}

                      {/* Status */}

                      <span
                        className="
                        absolute
                        right-3
                        top-3
                        rounded-full
                        bg-white/90
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-gray-700
                        shadow
                        dark:bg-navy-950/90
                        dark:text-gray-200
                      "
                      >
                        {status}
                      </span>
                    </div>

                    {/* Player Information */}

                    <div className="p-5">
                      <h3 className="truncate text-lg font-bold text-navy-950 dark:text-white">
                        {name}
                      </h3>

                      <p className="mt-1 text-sm text-cyan-500">{role}</p>

                      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-navy-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Base Price
                          </span>

                          <span className="font-bold text-navy-950 dark:text-white">
                            {formatCurrency(basePrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ================= EMPTY STATE ================= */}

      {!loading && players.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-navy-700 dark:bg-navy-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
            <FiUsers size={30} />
          </div>

          <h2 className="text-lg font-bold text-navy-950 dark:text-white">
            No Players Loaded
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Enter an Auction ID above and click
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {" "}
              Load Players
            </span>{" "}
            to view players.
          </p>
        </div>
      )}
    </div>
  );
}
