import { useCallback, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiClock, FiLock, FiRefreshCw, FiShield, FiUsers, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuctionAccess from "../hooks/useAuctionAccess";
import AuctionAccessStatus from "../components/AuctionAccessStatus";

const statusLabel = (status) => String(status || "").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AuctionAccess() {
  const { id } = useParams();
  const { access, loading, checkAccess } = useAuctionAccess(id);

  const load = useCallback(async () => {
    try { await checkAccess(); } catch { toast.error("Unable to check auction access."); }
  }, [checkAccess]);

  useEffect(() => { load(); }, [load]);

  const registrations = useMemo(() => access?.registrations || [], [access]);
  const approved = registrations.filter((r) => r?.status === "approved" && r?.team?.status === "active");
  const pending = registrations.filter((r) => r?.status === "pending");
  const auction = access?.auction;

  const allowed = Boolean(access?.canParticipate);
  const message = access?.isAdmin || access?.isCreator
    ? "You can manage this auction. Participant bidding access is still governed by the auction/team authorization rules."
    : allowed
      ? "You have an approved active team and the auction is live."
      : auction?.status === "live"
        ? "You need an approved active team registration to participate."
        : `Participation is unavailable while this auction is ${statusLabel(auction?.status || "not live")}.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/auctions/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <FiArrowLeft /> Back to auction
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-7 text-white dark:border-slate-800 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <FiShield /> Access verification
              </div>
              <h1 className="text-3xl font-black sm:text-4xl">{auction?.name || "Auction Access"}</h1>
              <p className="mt-2 text-sm text-slate-300">Backend-authorized participation status for your account and teams.</p>
            </div>
            <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15 disabled:opacity-50">
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <AuctionAccessStatus loading={loading} allowed={allowed} status={approved.length ? "approved" : pending.length ? "pending" : ""} message={message} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800"><FiUsers className="text-xl" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Registrations</p><p className="mt-1 text-2xl font-black">{registrations.length}</p></div>
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800"><FiCheckCircle className="text-xl text-emerald-500" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Approved active teams</p><p className="mt-1 text-2xl font-black">{approved.length}</p></div>
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800"><FiClock className="text-xl text-amber-500" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Pending</p><p className="mt-1 text-2xl font-black">{pending.length}</p></div>
          </div>

          <div>
            <h2 className="text-xl font-black">Your registered teams</h2>
            <div className="mt-4 space-y-3">
              {registrations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <FiLock className="mx-auto mb-3 text-2xl" /> No registration was found for this account.
                  <div className="mt-4"><Link to={`/auctions/${id}/register`} className="font-bold text-cyan-500">Register a team</Link></div>
                </div>
              ) : registrations.map((registration) => {
                const team = registration?.team;
                return <div key={registration._id || registration.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-black">{team?.name || "Team"}</p><p className="text-sm text-slate-500">{statusLabel(registration.status)}{team?.status ? ` · Team ${team.status}` : ""}</p></div>
                  <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${registration.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : registration.status === "pending" ? "bg-amber-500/10 text-amber-600" : "bg-slate-500/10 text-slate-500"}`}>
                    {registration.status === "approved" ? <FiCheckCircle /> : registration.status === "pending" ? <FiClock /> : <FiXCircle />}{statusLabel(registration.status)}
                  </span>
                </div>;
              })}
            </div>
          </div>

          {allowed && <div className="flex flex-wrap gap-3"><Link to={`/live-auctions/${id}`} className="inline-flex items-center rounded-xl bg-cyan-500 px-5 py-3 font-bold text-white hover:bg-cyan-400">Enter Live Auction</Link></div>}
        </div>
      </div>
    </div>
  );
}
