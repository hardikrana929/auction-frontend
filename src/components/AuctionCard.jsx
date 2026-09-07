import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";

import { formatCurrency } from "../utils/formatCurrency";

export default function AuctionCard({ auction }) {
  const auctionId = auction?._id || auction?.id;

  const name =
    auction?.name || auction?.title || auction?.auctionName || "Auction";

  const status = String(auction?.status || "upcoming").toLowerCase();

  const description =
    auction?.description ||
    "Cricket player auction managed through AuctionPro.";

  const startDate = auction?.startDate || auction?.startTime || auction?.date;

  const budget =
    auction?.basePrice || auction?.budget || auction?.startingPrice;

  const statusClasses = {
    upcoming: "bg-blue-500/10 text-blue-600 dark:text-blue-400",

    live: "bg-success-500/10 text-success-500",

    paused: "bg-warning-500/10 text-warning-500",

    completed: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  return (
    <article
      className="
        flex
        h-full
        flex-col
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
        dark:border-navy-700
        dark:bg-navy-900
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
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
          <FiCalendar size={20} />
        </div>

        <span
          className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-bold
            capitalize
            ${
              statusClasses[status] ||
              "bg-gray-500/10 text-gray-600 dark:text-gray-400"
            }
          `}
        >
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="mt-6 flex-1">
        <h2
          className="
            font-display
            text-xl
            font-bold
            text-navy-950
            dark:text-white
          "
        >
          {name}
        </h2>

        <p
          className="
            mt-2
            line-clamp-2
            text-sm
            leading-6
            text-gray-500
            dark:text-gray-400
          "
        >
          {description}
        </p>

        {/* Date */}
        {startDate && (
          <div
            className="
              mt-5
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            <FiClock size={16} />

            <span>
              {new Date(startDate).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        )}

        {/* Price */}
        {budget !== undefined && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Starting Value
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              {formatCurrency(budget)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-navy-700">
        {auctionId ? (
          <Link
            to={`/auctions/${auctionId}`}
            className="
              flex
              items-center
              justify-between
              rounded-xl
              bg-cyan-500
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-cyan-400
            "
          >
            <span>View Auction</span>

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
              font-medium
              text-gray-400
              dark:bg-navy-800
            "
          >
            Auction unavailable
          </span>
        )}
      </div>
    </article>
  );
}
