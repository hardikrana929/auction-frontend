import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  FiActivity,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiHash,
  FiTrash2,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { deleteAuction, getAuction } from "../api/auctionApi";
import AuctionStatusBadge from "../components/auction/AuctionStatusBadge";
import LoadingScreen from "../components/LoadingScreen";
import ErrorState from "../components/ErrorState";
import RupeeIcon from "../components/icons/RupeeIcon";
import { useAuth } from "../context/AuthContext";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAuction(id);

      const data = response?.auction || response?.data || response;

      if (!data || !data._id) {
        setAuction(null);
        setError("Auction not found.");
        return;
      }

      setAuction(data);
    } catch (err) {
      setAuction(null);
      setError(err?.response?.data?.message || "Unable to load auction.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <LoadingScreen label="Loading auction..." />;
  }

  if (error || !auction) {
    return (
      <ErrorState message={error || "Auction not found."} onRetry={load} />
    );
  }

  const canModify = isAdmin && !["live", "completed"].includes(auction.status);

  const remove = async () => {
    if (!window.confirm(`Delete "${auction.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAuction(auction._id);

      toast.success("Auction deleted");

      navigate("/auctions", {
        replace: true,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete auction.");
    }
  };

  /*
   * Auction information cards
   *
   * Use RupeeIcon ONLY for money values.
   * Other information gets an appropriate icon.
   */
  const informationCards = [
    {
      label: "Auction Date",
      value: new Date(auction.date).toLocaleString("en-IN"),
      icon: FiCalendar,
      type: "normal",
    },
    {
      label: "Starting Budget",
      value: money(auction.startingBudget),
      icon: RupeeIcon,
      type: "money",
    },
    {
      label: "Minimum Bid",
      value: money(auction.minimumBid),
      icon: RupeeIcon,
      type: "money",
    },
    {
      label: "Bid Increment",
      value: money(auction.bidIncrement),
      icon: RupeeIcon,
      type: "money",
    },
    {
      label: "Maximum Teams",
      value: auction.maxTeams ?? 0,
      icon: FiUsers,
      type: "normal",
    },
    {
      label: "Players Per Team",
      value: auction.maxPlayersPerTeam ?? 0,
      icon: FiUsers,
      type: "normal",
    },
    {
      label: "Created By",
      value: auction.createdBy?.name || "Admin",
      icon: FiHash,
      type: "normal",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/auctions"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-slate-500
          hover:text-slate-900
          dark:hover:text-white
        "
      >
        <FiArrowLeft />
        Back to auctions
      </Link>

      {/* Main Card */}
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* Hero */}
        <div
          className="
            relative
            h-64
            bg-slate-100
            dark:bg-slate-800
            sm:h-80
          "
        >
          {auction.image ? (
            <img
              src={auction.image}
              alt={auction.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FiActivity
                size={50}
                className="text-slate-300 dark:text-slate-600"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <AuctionStatusBadge status={auction.status} />

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              {auction.name}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Description + Admin Actions */}
          <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
            <p className="max-w-3xl leading-7 text-slate-600 dark:text-slate-300">
              {auction.description || "No description provided."}
            </p>

            {isAdmin && (
              <div className="flex gap-2">
                <Link
                  to={`/admin/auctions/${auction._id}/edit`}
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    dark:border-slate-700
                    ${!canModify ? "pointer-events-none opacity-40" : ""}
                  `}
                >
                  <FiEdit3 />
                  Edit
                </Link>

                {canModify && (
                  <button
                    onClick={remove}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-red-200
                      px-4
                      py-2.5
                      text-sm
                      font-bold
                      text-red-600
                      dark:border-red-900
                    "
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Information Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {informationCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="
                    rounded-2xl
                    bg-slate-50
                    p-4
                    dark:bg-slate-800
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-500/10
                      text-cyan-600
                      dark:text-cyan-400
                    "
                  >
                    <Icon size={20} />
                  </div>

                  <p
                    className="
                      mt-4
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    {card.label}
                  </p>

                  <p className="mt-1 font-black">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div
            className="
              mt-8
              flex
              flex-wrap
              gap-3
              border-t
              border-slate-100
              pt-6
              dark:border-slate-800
            "
          >
            {[
              [
                FiUserPlus,
                "Register a team",
                `/auctions/${auction._id}/register`,
              ],
              [
                FiUsers,
                "Participants",
                `/auctions/${auction._id}/participants`,
              ],
              [FiClock, "History", `/auctions/${auction._id}/history`],
              [
                FiBarChart2,
                "Statistics",
                `/auctions/${auction._id}/statistics`,
              ],
              ...(isAdmin
                ? [
                    [
                      FiActivity,
                      "Auction control",
                      `/admin/auction-control/${auction._id}`,
                    ],
                  ]
                : []),
            ].map(([Icon, label, to]) => (
              <Link
                key={label}
                to={to}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <Icon />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
