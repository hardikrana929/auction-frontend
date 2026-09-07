import { useCallback, useEffect, useState } from "react";

import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import { Link, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import { getPlayerById } from "../api/playerApi";
import { formatCurrency } from "../utils/formatCurrency";

export default function PlayerDetails() {
  const { id } = useParams();

  const [player, setPlayer] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadPlayer = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPlayerById(id);

      const data = response?.data || response?.player || response;

      setPlayer(data);
    } catch (err) {
      const message =
        err.normalizedMessage || err.message || "Unable to load player.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPlayer();
    }
  }, [id, loadPlayer]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-12
          lg:px-16
        "
      >
        <div className="animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-navy-800" />

          <div className="mt-8 h-80 rounded-3xl bg-gray-200 dark:bg-navy-800" />
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !player) {
    return (
      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-12
          lg:px-16
        "
      >
        <Link
          to="/auctions"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-cyan-500
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
            Player not found
          </h1>

          <p
            className="
              mt-3
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {error || "The requested player could not be found."}
          </p>

          <button
            type="button"
            onClick={loadPlayer}
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

  /* =====================================================
     PLAYER DATA
  ===================================================== */

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

  const nationality = player?.nationality || player?.country;

  const dateOfBirth = player?.dateOfBirth || player?.dob;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        px-6
        py-10
        lg:px-16
      "
    >
      {/* Back */}

      <Link
        to="/auctions"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-gray-600
          hover:text-cyan-500
          dark:text-gray-400
        "
      >
        <FiArrowLeft size={17} />
        Back to Auctions
      </Link>

      {/* Main */}

      <section
        className="
          mt-8
          overflow-hidden
          rounded-3xl
          border
          border-gray-200
          bg-white
          shadow-sm
          dark:border-navy-700
          dark:bg-navy-900
        "
      >
        <div
          className="
            grid
            lg:grid-cols-[320px_1fr]
          "
        >
          {/* Image */}

          <div
            className="
              relative
              min-h-[320px]
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
                  min-h-[320px]
                  w-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  min-h-[320px]
                  items-center
                  justify-center
                  text-6xl
                  font-bold
                  text-cyan-400
                "
              >
                {initials}
              </div>
            )}
          </div>

          {/* Details */}

          <div className="p-7 sm:p-10">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  rounded-full
                  bg-cyan-500/10
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  capitalize
                  text-cyan-500
                "
              >
                {status}
              </span>

              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-gray-600
                  dark:bg-navy-800
                  dark:text-gray-300
                "
              >
                {role}
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

            <div
              className="
                mt-8
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              <DetailItem
                icon={<FiDollarSign size={18} />}
                label="Base Price"
                value={
                  basePrice !== undefined
                    ? formatCurrency(basePrice)
                    : "Not specified"
                }
              />

              <DetailItem
                icon={<FiUser size={18} />}
                label="Role"
                value={role}
              />

              {nationality && (
                <DetailItem
                  icon={<FiUser size={18} />}
                  label="Nationality"
                  value={nationality}
                />
              )}

              {dateOfBirth && (
                <DetailItem
                  icon={<FiCalendar size={18} />}
                  label="Date of Birth"
                  value={formatDate(dateOfBirth)}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
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
          text-cyan-500
        "
      >
        {icon}

        <span
          className="
            text-xs
            font-medium
            uppercase
            tracking-wide
            text-gray-400
          "
        >
          {label}
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
        {value}
      </p>
    </div>
  );
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}
