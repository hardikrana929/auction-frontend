import { Link } from "react-router-dom";
import { FiArrowRight, FiDollarSign, FiUser } from "react-icons/fi";

import { formatCurrency } from "../utils/formatCurrency";

export default function PlayerCard({ player }) {
  const playerId = player?._id || player?.id;

  const name =
    player?.name || player?.playerName || player?.fullName || "Player";

  const role =
    player?.role || player?.playerRole || player?.category || "Player";

  const image =
    player?.photo ||
    player?.photoUrl ||
    player?.image ||
    player?.imageUrl ||
    player?.profileImage;

  const basePrice = player?.basePrice ?? player?.startingPrice;

  const status = String(player?.status || "available").toLowerCase();

  const statusStyles = {
    available: "bg-blue-500/10 text-blue-600 dark:text-blue-400",

    live: "bg-success-500/10 text-success-500",

    sold: "bg-success-500/10 text-success-500",

    unsold: "bg-red-500/10 text-red-500",

    inactive: "bg-gray-500/10 text-gray-500",

    active: "bg-success-500/10 text-success-500",
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
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
      {/* ================================================
          PLAYER IMAGE
      ================================================= */}

      <div
        className="
          relative
          h-52
          overflow-hidden
          bg-navy-900
          dark:bg-navy-850
        "
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-300
              group-hover:scale-105
            "
            onError={(event) => {
              event.currentTarget.style.display = "none";

              event.currentTarget.parentElement
                .querySelector("[data-player-fallback]")
                ?.classList.remove("hidden");
            }}
          />
        ) : null}

        <div
          data-player-fallback
          className={`
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-navy-900
            text-4xl
            font-bold
            text-cyan-400
            ${image ? "hidden" : ""}
          `}
        >
          {initials || "P"}
        </div>

        {/* Status */}
        <span
          className={`
            absolute
            right-4
            top-4
            rounded-full
            px-3
            py-1.5
            text-xs
            font-bold
            capitalize
            backdrop-blur
            ${statusStyles[status] || "bg-white/10 text-white"}
          `}
        >
          {status}
        </span>
      </div>

      {/* ================================================
          PLAYER INFORMATION
      ================================================= */}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/10
              text-cyan-500
            "
          >
            <FiUser size={18} />
          </div>

          <div className="min-w-0">
            <h3
              className="
                truncate
                font-display
                text-lg
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              {name}
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              {role}
            </p>
          </div>
        </div>

        {/* Base price */}

        <div
          className="
            mt-6
            rounded-xl
            bg-pitch-50
            p-4
            dark:bg-navy-850
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-gray-400
            "
          >
            <FiDollarSign size={15} />

            <span
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
              "
            >
              Base Price
            </span>
          </div>

          <p
            className="
              mt-2
              text-base
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            {basePrice !== undefined ? formatCurrency(basePrice) : "—"}
          </p>
        </div>

        {/* View player */}

        <div className="mt-5">
          {playerId ? (
            <Link
              to={`/players/${playerId}`}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-gray-200
                px-4
                py-3
                text-sm
                font-semibold
                text-navy-950
                transition
                hover:border-cyan-500
                hover:text-cyan-500
                dark:border-navy-700
                dark:text-white
                dark:hover:border-cyan-500
                dark:hover:text-cyan-400
              "
            >
              <span>View Player</span>

              <FiArrowRight size={17} />
            </Link>
          ) : (
            <span
              className="
                block
                rounded-xl
                bg-gray-100
                px-4
                py-3
                text-center
                text-sm
                text-gray-400
                dark:bg-navy-800
              "
            >
              Player unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
