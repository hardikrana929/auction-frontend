import { useEffect, useState } from "react";
import { FiActivity, FiArrowRight, FiCalendar, FiUsers } from "react-icons/fi";
import RupeeIcon from "../components/RupeeIcon";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuctions } from "../api/auctionApi";

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default function Dashboard() {
  const { user, isAdmin, isAuctionManager } = useAuth();
  const [auctions, setAuctions] = useState([]);
  useEffect(() => {
    getAuctions()
      .then((r) => setAuctions(r.auctions || []))
      .catch(() => setAuctions([]));
  }, []);
  const live = auctions.filter((a) => a.status === "live").length;
  const upcoming = auctions
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const budget = auctions.reduce(
    (sum, a) => sum + Number(a.startingBudget || 0),
    0,
  );
  const cards = [
    { label: "Active Auctions", value: live, icon: FiActivity },
    { label: "Total Auctions", value: auctions.length, icon: FiCalendar },
    {
      label: "Upcoming Auctions",
      value: auctions.filter((a) => a.status === "upcoming").length,
      icon: FiUsers,
    },
    // { label: "Configured Budget", value: money(budget), icon: RupeeIcon },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Admin workspace"
              : isAuctionManager
                ? "Auction manager workspace"
                : "Auction workspace"}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            A command center for managing cricket auctions and live activity.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/80 px-5 py-4 text-white ring-1 ring-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold opacity-70">Signed in as</p>
          <p className="mt-1 font-black">
            {user?.email || "Authenticated user"}
          </p>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/70 bg-white/55 backdrop-blur-xl p-5 shadow-xl shadow-slate-900/[0.06] dark:shadow-black/30 dark:border-white/10 dark:bg-slate-900/45"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-slate-900/5 dark:bg-white/10">
              <Icon />
            </span>
            <p className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-950/80 p-7 text-white ring-1 ring-white/10 backdrop-blur-xl lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Auction workspace
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Manage auctions from one place.
          </h2>
          <p className="mt-2 max-w-xl opacity-70">
            Create auctions, review schedules and inspect auction configuration
            before teams and players are connected.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Browse auctions <FiArrowRight />
            </Link>
            {isAdmin && (
              <Link
                to="/admin/auctions/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
              >
                Create auction
              </Link>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl p-7 dark:border-white/10 dark:bg-slate-900/45">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black">Upcoming</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Next scheduled auctions
              </p>
            </div>
            <FiCalendar />
          </div>
          <div className="mt-5 space-y-3">
            {upcoming.length ? (
              upcoming.map((a) => (
                <Link
                  key={a._id}
                  to={`/auctions/${a._id}`}
                  className="block rounded-xl bg-white/40 p-3 hover:bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-slate-700"
                >
                  <p className="font-bold">{a.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(a.date).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming auctions.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
