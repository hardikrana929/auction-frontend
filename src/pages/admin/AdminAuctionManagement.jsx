import { useConfirmDialog } from "../../context/ConfirmDialogContext";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiEdit3,
  FiEye,
  FiLink,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  deleteAuction,
  getAuctions,
  updateAuctionStatus,
} from "../../api/auctionApi";
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

  const status = async (a, s) => {
    if (s === a.status) return;
    try {
      await updateAuctionStatus(a._id, s);
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
                        <RowActions a={a} onLink={setLinkAuction} onDelete={remove} />
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
                  <RowActions a={a} onLink={setLinkAuction} onDelete={remove} />
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

function RowActions({ a, onLink, onDelete }) {
  const locked = ["live", "completed"].includes(a.status);
  return (
    <div className="flex justify-end gap-2">
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
