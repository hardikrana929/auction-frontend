import { FiDollarSign, FiUser, FiUsers } from "react-icons/fi";

import { formatCurrency } from "../utils/formatCurrency";

export default function TeamCard({ team }) {
  const teamName = team?.teamName || team?.name || team?.title || "Team";

  const owner =
    typeof team?.owner === "object"
      ? team.owner?.name || team.owner?.email
      : team?.owner;

  const logo = team?.logo || team?.logoUrl || team?.image || team?.imageUrl;

  const budget =
    team?.budget ??
    team?.remainingBudget ??
    team?.purse ??
    team?.remainingPurse;

  const playersBought =
    team?.playersBought ??
    team?.playersCount ??
    team?.playerCount ??
    (Array.isArray(team?.players) ? team.players.length : undefined);

  const status = String(team?.status || "active").toLowerCase();

  const statusStyles = {
    active: "bg-success-500/10 text-success-500",

    inactive: "bg-gray-500/10 text-gray-500",

    approved: "bg-success-500/10 text-success-500",

    pending: "bg-warning-500/10 text-warning-500",

    disabled: "bg-red-500/10 text-red-500",
  };

  const initials = teamName
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
      {/* =================================================
          TEAM HEADER
      ================================================= */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          bg-navy-900
          px-6
          py-6
          dark:bg-navy-850
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-24
            w-24
            rounded-full
            bg-cyan-500/10
            blur-2xl
          "
        />

        {/* Logo */}
        <div
          className="
            relative
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-white
            text-xl
            font-bold
            text-navy-900
            shadow-lg
          "
        >
          {logo ? (
            <img
              src={logo}
              alt={`${teamName} logo`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.parentElement
                  .querySelector("[data-fallback]")
                  ?.classList.remove("hidden");
              }}
            />
          ) : null}

          <span data-fallback className={logo ? "hidden" : ""}>
            {initials || "T"}
          </span>
        </div>

        {/* Status */}
        <span
          className={`
            relative
            rounded-full
            px-3
            py-1.5
            text-xs
            font-bold
            capitalize
            ${statusStyles[status] || "bg-gray-500/10 text-gray-300"}
          `}
        >
          {status}
        </span>
      </div>

      {/* =================================================
          TEAM INFORMATION
      ================================================= */}

      <div className="flex flex-1 flex-col p-6">
        <h3
          className="
            font-display
            text-xl
            font-bold
            text-navy-950
            dark:text-white
          "
        >
          {teamName}
        </h3>

        {/* Owner */}
        {owner && (
          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            <FiUser size={16} className="text-cyan-500" />

            <span className="truncate">{owner}</span>
          </div>
        )}

        {/* =================================================
            TEAM STATS
        ================================================= */}

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-3
          "
        >
          {/* Budget */}
          <div
            className="
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
                Budget
              </span>
            </div>

            <p
              className="
                mt-2
                truncate
                text-sm
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              {budget !== undefined ? formatCurrency(budget) : "—"}
            </p>
          </div>

          {/* Players */}
          <div
            className="
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
              <FiUsers size={15} />

              <span
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                "
              >
                Players
              </span>
            </div>

            <p
              className="
                mt-2
                text-sm
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              {playersBought !== undefined ? playersBought : "—"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
