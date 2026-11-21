import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiEdit3,
  FiEye,
  FiKey,
  FiLink,
  FiRadio,
  FiSliders,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  deleteAuction,
  getAuctionManager,
  getAuctions,
  resetAuctionManager,
  updateAuctionStatus,
} from "../../api/auctionApi";
import { completeAuction, startAuction } from "../../api/auctionControlApi";
import AuctionCredentialsModal from "../../components/auction/AuctionCredentialsModal";
import { copyText } from "../../utils/clipboard";
import AuctionStatusBadge from "../../components/auction/AuctionStatusBadge";
import LoadingScreen from "../../components/LoadingScreen";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import PlayerRegistrationLinkModal from "../../components/auction/PlayerRegistrationLinkModal";
import usePagination from "../../hooks/usePagination";

const statuses = ["draft", "upcoming", "live", "completed", "cancelled"];

export default function AdminAuctionManagement() {
  const { confirm } = useConfirmDialog();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [linkAuction, setLinkAuction] = useState(null);
  const [adminAuction, setAdminAuction] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const pager = usePagination(rows, { initialPageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAuctions();
      setRows(r.auctions || []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load auctions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The cycle draft -> upcoming -> live -> completed is NOT strict: any status
  // can be chosen. "live" and "completed" drive the live session, so they go
  // through the auction-control endpoints (live also re-opens a completed one).
  const status = async (a, s) => {
    if (s === a.status) return;
    try {
      if (s === "live") {
        await startAuction(a._id);
      } else if (s === "completed" && a.status === "live") {
        try {
          await completeAuction({ auctionId: a._id });
        } catch (e) {
          if (e.response?.data?.code !== "REMAINING_PLAYERS") throw e;
          const ok = await confirm({
            title: "Complete with players remaining?",
            message: `${e.response.data.remainingPlayers} player(s) have not been auctioned yet. You can make the auction live again later.`,
            confirmText: "Complete anyway",
            tone: "primary",
          });
          if (!ok) return;
          await completeAuction({ auctionId: a._id, force: true });
        }
      } else {
        await updateAuctionStatus(a._id, s);
      }
      toast.success(`Status changed to ${s}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update status.");
    }
  };

  const remove = async (a) => {
    const ok = await confirm({
      title: "Delete auction?",
      message: `"${a.name}" will be permanently deleted.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteAuction(a._id);
      toast.success("Auction deleted");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to delete auction.");
    }
  };

  if (loading) return <LoadingScreen label="Loading auction management..." />;

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="page-title">Auction Management</h1>
          <p className="page-subtitle">
            Create, review, update and control auction status.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="secondary-btn">
            <FiRefreshCw /> Refresh
          </button>
          <Link to="/admin/auctions/new" className="primary-btn">
            <FiPlus /> Create
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No auctions"
          message="Create your first auction to get started."
        />
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="surface-card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Auction</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Budget</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pager.pageItems.map((a) => (
                    <tr
                      key={a._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900 dark:text-white">
                          {a.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {a.maxTeams} teams · {a.maxPlayersPerTeam} players/team
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {new Date(a.date).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        {budgetOf(a)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusControl a={a} onChange={status} />
                      </td>
                      <td className="px-5 py-4">
                        <RowActions a={a} onLink={setLinkAuction} onAdmin={setAdminAuction} onDelete={remove} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-4 md:hidden">
            {pager.pageItems.map((a) => (
              <article key={a._id} className="surface-card space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-900 dark:text-white">
                      {a.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <FiCalendar /> {new Date(a.date).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-black text-slate-900 dark:text-white">
                    {budgetOf(a)}
                  </p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <FiUsers /> {a.maxTeams} teams · {a.maxPlayersPerTeam} players/team
                </p>
                <StatusControl a={a} onChange={status} />
                <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                  <RowActions a={a} onLink={setLinkAuction} onAdmin={setAdminAuction} onDelete={remove} />
                </div>
              </article>
            ))}
          </div>

          <Pagination
            {...pager}
            onPageChange={pager.setPage}
            onPageSizeChange={pager.setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            label="auctions"
          />
        </>
      )}

      {adminAuction && (
        <AuctionAdminModal
          auction={adminAuction}
          onClose={() => setAdminAuction(null)}
          onReset={(creds) => {
            setCredentials({ ...creds, auctionName: adminAuction.name });
            setAdminAuction(null);
          }}
        />
      )}
      {credentials && (
        <AuctionCredentialsModal
          credentials={credentials}
          auctionName={credentials.auctionName}
          closeLabel="Done"
          onClose={() => setCredentials(null)}
        />
      )}

      {linkAuction && (
        <PlayerRegistrationLinkModal
          auction={linkAuction}
          onClose={() => setLinkAuction(null)}
        />
      )}
    </div>
  );
}

const budgetOf = (a) =>
  `₹${Number(a.teamBudget ?? a.startingBudget ?? 0).toLocaleString("en-IN")}`;

function StatusControl({ a, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <AuctionStatusBadge status={a.status} />
      <select
        aria-label={`Change status of ${a.name}`}
        value={a.status}
        onChange={(e) => onChange(a, e.target.value)}
        className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:focus:border-slate-500"
      >
        {statuses.map((s) => (
          <option
            key={s}
            value={s}
            className="text-slate-900 dark:bg-slate-800 dark:text-white"
          >
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

function RowActions({ a, onLink, onAdmin, onDelete }) {
  const locked = ["live", "completed"].includes(a.status);
  const publicLink = `${window.location.origin}/live/${a._id}`;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        title="Auction control (bidding dashboard)"
        aria-label="Auction control"
        to={`/admin/auction-control/${a._id}`}
        className="icon-btn border border-slate-200 text-indigo-600 dark:border-slate-700 dark:text-indigo-400"
      >
        <FiSliders />
      </Link>
      <button
        title="Copy public live link (no login needed)"
        aria-label="Copy public live link"
        onClick={async () => {
          const ok = await copyText(publicLink);
          if (ok) toast.success("Public live link copied");
          else toast.error("Could not copy the link");
        }}
        className="icon-btn border border-slate-200 text-rose-600 dark:border-slate-700 dark:text-rose-400"
      >
        <FiRadio />
      </button>
      <button
        title="Auction admin credentials"
        aria-label="Auction admin credentials"
        onClick={() => onAdmin(a)}
        className="icon-btn border border-slate-200 text-amber-600 dark:border-slate-700 dark:text-amber-400"
      >
        <FiKey />
      </button>
      <button
        title="Player registration link"
        aria-label="Player registration link"
        onClick={() => onLink(a)}
        className="icon-btn border border-slate-200 text-cyan-600 dark:border-slate-700 dark:text-cyan-400"
      >
        <FiLink />
      </button>
      <Link
        title="View"
        to={`/auctions/${a._id}`}
        className="icon-btn border border-slate-200 dark:border-slate-700"
      >
        <FiEye />
      </Link>
      <Link
        title="Edit"
        to={`/admin/auctions/${a._id}/edit`}
        className={`icon-btn border border-slate-200 dark:border-slate-700 ${locked ? "pointer-events-none opacity-40" : ""}`}
      >
        <FiEdit3 />
      </Link>
      <button
        title="Delete"
        onClick={() => onDelete(a)}
        disabled={locked}
        className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <FiTrash2 />
      </button>
    </div>
  );
}

function AuctionAdminModal({ auction, onClose, onReset }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getAuctionManager(auction._id)
      .then(setInfo)
      .catch((e) =>
        toast.error(e.response?.data?.message || "Unable to load admin."),
      )
      .finally(() => setLoading(false));
  }, [auction._id]);

  const reset = async () => {
    setResetting(true);
    try {
      const r = await resetAuctionManager(auction._id);
      onReset(r.managerCredentials);
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to reset password.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Admin of {auction.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Each auction has one admin who runs only this auction.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <>
              <Row label="Auction ID" value={info?.auctionId || "—"} />
              <Row label="Username" value={info?.manager?.username || "No admin assigned"} />
            </>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Passwords are stored encrypted and cannot be shown. Reset to create a
          new password (the admin is signed out).
        </p>
        <div className="mt-5 flex gap-2">
          <button className="secondary-btn flex-1 justify-center" onClick={onClose}>
            Close
          </button>
          <button
            className="primary-btn flex-1 justify-center"
            onClick={reset}
            disabled={resetting}
          >
            {resetting ? "Resetting…" : info?.manager ? "Reset password" : "Create admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.05]">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-mono font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
