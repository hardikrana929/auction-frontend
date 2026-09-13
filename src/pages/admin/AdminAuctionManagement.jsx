import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit3, FiEye, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { deleteAuction, getAuctions, updateAuctionStatus } from "../../api/auctionApi";
import AuctionStatusBadge from "../../components/auction/AuctionStatusBadge";
import LoadingScreen from "../../components/LoadingScreen";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";

const statuses = ["draft", "upcoming", "live", "completed", "cancelled"];

export default function AdminAuctionManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!window.confirm(`Delete "${a.name}"?`)) return;
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
          <p className="page-subtitle">Create, review, update and control auction status.</p>
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
        <EmptyState title="No auctions" message="Create your first auction to get started." />
      ) : (
        <div className="surface-card overflow-hidden">
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
                {rows.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900 dark:text-white">{a.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {a.maxTeams} teams · {a.maxPlayersPerTeam} players/team
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {new Date(a.date).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      ₹{Number(a.startingBudget || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <AuctionStatusBadge status={a.status} />
                        <select
                          value={a.status}
                          onChange={(e) => status(a, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:focus:border-slate-500"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s} className="text-slate-900 dark:bg-slate-800 dark:text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
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
                          className={`icon-btn border border-slate-200 dark:border-slate-700 ${["live", "completed"].includes(a.status) ? "pointer-events-none opacity-40" : ""}`}
                        >
                          <FiEdit3 />
                        </Link>
                        <button
                          title="Delete"
                          onClick={() => remove(a)}
                          disabled={["live", "completed"].includes(a.status)}
                          className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
