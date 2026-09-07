import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

import { getAuctionById } from "../api/auctionApi";
import { formatCurrency } from "../utils/formatCurrency";
import TeamsSection from "../components/TeamsSection";
import useAuctionAccess from "../hooks/useAuctionAccess";
import AuctionAccessStatus from "../components/AuctionAccessStatus";

export default function AuctionDetails() {
  const { id } = useParams();
  const { access, loading: accessLoading, checkAccess } = useAuctionAccess(id);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuction = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAuctionById(id);

      const data = response?.data || response?.auction || response;

      setAuction(data);
    } catch (err) {
      const message =
        err.normalizedMessage ||
        err.message ||
        "Unable to load auction details.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadAuction();
      checkAccess();
    }
  }, [id, loadAuction, checkAccess]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-16">
        <div className="animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-navy-800" />

          <div className="mt-6 h-10 w-80 rounded bg-gray-200 dark:bg-navy-800" />

          <div className="mt-4 h-5 w-full max-w-xl rounded bg-gray-200 dark:bg-navy-800" />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-navy-800" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-navy-800" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-navy-800" />
          </div>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error || !auction) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-16">
        <Link
          to="/auctions"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-cyan-500
            hover:text-cyan-400
          "
        >
          <FiArrowLeft size={17} />
          Back to Auctions
        </Link>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-red-200
            bg-white
            p-10
            text-center
            dark:border-red-900/50
            dark:bg-navy-900
          "
        >
          <h1
            className="
              text-2xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Auction not found
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-lg
              text-sm
              leading-6
              text-gray-500
              dark:text-gray-400
            "
          >
            {error || "The requested auction could not be found."}
          </p>

          <button
            type="button"
            onClick={loadAuction}
            className="
              mt-6
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
              hover:bg-cyan-400
            "
          >
            <FiRefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ================= AUCTION DATA ================= */

  const name =
    auction?.name || auction?.title || auction?.auctionName || "Auction";

  const description =
    auction?.description ||
    "Cricket player auction managed through AuctionPro.";

  const status = String(auction?.status || "upcoming").toLowerCase();

  const startDate = auction?.startDate || auction?.startTime || auction?.date;

  const endDate = auction?.endDate || auction?.endTime;

  const basePrice = auction?.basePrice ?? auction?.startingPrice;

  const createdAt = auction?.createdAt;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-16">
      {/* ================= BACK ================= */}

      <Link
        to="/auctions"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-gray-600
          transition
          hover:text-cyan-500
          dark:text-gray-400
          dark:hover:text-cyan-400
        "
      >
        <FiArrowLeft size={17} />
        Back to Auctions
      </Link>

      {/* ================= HEADER ================= */}

      <section
        className="
          mt-8
          rounded-3xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-sm
          sm:p-8
          lg:p-10
          dark:border-navy-700
          dark:bg-navy-900
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-500
                "
              >
                <FiCalendar size={22} />
              </span>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  ${
                    status === "live"
                      ? "bg-success-500/10 text-success-500"
                      : status === "paused"
                        ? "bg-warning-500/10 text-warning-500"
                        : status === "completed"
                          ? "bg-gray-500/10 text-gray-500"
                          : "bg-blue-500/10 text-blue-500"
                  }
                `}
              >
                {status}
              </span>
            </div>

            <h1
              className="
                mt-6
                font-display
                text-3xl
                font-bold
                text-navy-950
                sm:text-4xl
                dark:text-white
              "
            >
              {name}
            </h1>

            <p
              className="
                mt-4
                text-base
                leading-7
                text-gray-600
                dark:text-gray-400
              "
            >
              {description}
            </p>
            <div className="mt-6">
              {!access?.allowed && (
                <Link
                  to={`/auctions/${id}/register`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-500
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-cyan-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-cyan-400
                    focus:ring-offset-2
                    dark:focus:ring-offset-navy-900
                  "
                >
                  Register for Auction
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ================= INFORMATION ================= */}

        <div
          className="
            mt-10
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* Start */}
          <InfoCard
            icon={<FiCalendar size={19} />}
            label="Start Date"
            value={startDate ? formatDate(startDate) : "Not specified"}
          />

          {/* End */}
          <InfoCard
            icon={<FiClock size={19} />}
            label="End Date"
            value={endDate ? formatDate(endDate) : "Not specified"}
          />

          {/* Base price */}
          <InfoCard
            icon="₹"
            label="Starting Value"
            value={
              basePrice !== undefined
                ? formatCurrency(basePrice)
                : "Not specified"
            }
          />

          {/* Created */}
          <InfoCard
            icon={<FiCalendar size={19} />}
            label="Created"
            value={createdAt ? formatDate(createdAt) : "Not specified"}
          />
        </div>
      </section>

      {/* ================= AUCTION ACCESS ================= */}

      <section className="mt-8">
        <AuctionAccessStatus
          loading={accessLoading}
          allowed={
            access?.allowed === true ||
            access?.hasAccess === true ||
            access?.authorized === true
          }
          status={access?.status || access?.registrationStatus || ""}
          message={access?.message || access?.reason || ""}
        />
      </section>

      {/* ================= NEXT SECTION ================= */}

      <section className="mt-8">
        <TeamsSection auctionId={id} />

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-gray-500
            dark:text-gray-400
          "
        >
          Teams, players, registration and live auction information will be
          available from this auction.
        </p>

        <div
          className="
            mt-5
            grid
            gap-5
            md:grid-cols-3
          "
        >
          <OverviewCard
            title="Teams"
            description="View teams participating in this auction."
          />

          <OverviewCard
            title="Players"
            description="View players available for this auction."
          />

          <OverviewCard
            title="Live Auction"
            description="Enter the live bidding session when available."
          />
        </div>
      </section>
    </div>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({ icon, label, value }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-pitch-50
        p-5
        dark:border-navy-700
        dark:bg-navy-850
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          bg-cyan-500/10
          text-cyan-500
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-4
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-gray-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-sm
          font-semibold
          text-navy-950
          dark:text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   OVERVIEW CARD
===================================================== */

function OverviewCard({ title, description }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-navy-700
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
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
          dark:text-gray-400
        "
      >
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   DATE FORMATTER
===================================================== */

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
