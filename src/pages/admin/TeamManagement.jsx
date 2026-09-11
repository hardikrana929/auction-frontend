import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import { getAuctions } from "../../api/auctionApi";
import {
  createTeam,
  deleteTeam,
  getTeamsByAuction,
  updateTeam,
  updateTeamStatus,
} from "../../api/teamApi";
import TeamCard from "../../components/team/TeamCard";
import TeamForm from "../../components/team/TeamForm";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingScreen from "../../components/LoadingScreen";

export default function TeamManagement() {
  const [auctions, setAuctions] = useState([]);
  const [auctionId, setAuctionId] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadAuctions = async () => {
    try {
      const result = await getAuctions();
      const list = result.auctions || [];
      setAuctions(list);
      if (!auctionId && list.length) setAuctionId(list[0]._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load auctions.");
    }
  };

  const loadTeams = async (id = auctionId) => {
    if (!id) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getTeamsByAuction(id);
      setTeams(result.teams || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  useEffect(() => {
    loadTeams();
  }, [auctionId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter(
      (team) =>
        team.name?.toLowerCase().includes(query) ||
        team.ownerName?.toLowerCase().includes(query)
    );
  }, [teams, search]);

  const saveTeam = async (formData) => {
    setActionLoading(true);
    try {
      const result = editing
        ? await updateTeam(editing._id, formData)
        : await createTeam(formData);

      toast.success(result.message || "Team saved successfully.");
      setShowForm(false);
      setEditing(null);
      await loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save team.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (team) => {
    const next = team.status === "active" ? "inactive" : "active";
    if (!window.confirm(`Change ${team.name} to ${next}?`)) return;

    try {
      const result = await updateTeamStatus(team._id, next);
      toast.success(result.message || "Team status updated.");
      await loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update team status.");
    }
  };

  const remove = async (team) => {
    if (!window.confirm(`Delete ${team.name}? This cannot be undone.`)) return;

    try {
      const result = await deleteTeam(team._id);
      toast.success(result.message || "Team deleted.");
      await loadTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete team.");
    }
  };

  if (showForm) {
    return (
      <section className="page-container">
        <div className="mb-6">
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">{editing ? "Edit Team" : "Create Team"}</h1>
          <p className="page-subtitle">
            Manage the team identity and ownership. Purse values remain backend-controlled.
          </p>
        </div>
        <div className="surface-card p-5 sm:p-7">
          <TeamForm
            auctions={auctions}
            team={editing}
            loading={actionLoading}
            onSubmit={saveTeam}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Create, review and manage teams registered for each auction.</p>
        </div>
        <button
          className="primary-btn w-full sm:w-fit"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <FiPlus /> Create team
        </button>
      </div>

      <div className="surface-card mb-6 grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]">
        <div>
          <label className="label">Auction</label>
          <select className="input" value={auctionId} onChange={(e) => setAuctionId(e.target.value)}>
            <option value="">Select auction</option>
            {auctions.map((auction) => (
              <option key={auction._id} value={auction._id}>{auction.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Search teams</label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Team or owner" />
          </div>
        </div>
        <button className="secondary-btn self-end" onClick={() => loadTeams()}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Unable to load teams" message={error} onRetry={() => loadTeams()} />
      ) : loading ? (
        <LoadingScreen />
      ) : !auctionId ? (
        <EmptyState icon={<FiUsers />} title="Select an auction" description="Choose an auction to view its teams." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiUsers />}
          title={search ? "No matching teams" : "No teams yet"}
          description={search ? "Try another search term." : "Create the first team for this auction."}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onView={setSelected}
              onEdit={(item) => {
                setEditing(item);
                setShowForm(true);
              }}
              onToggleStatus={toggleStatus}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-slate-900 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="eyebrow">Team details</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selected.name}</h2>
              </div>
              <button className="secondary-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div className="space-y-3 text-sm">
              <Detail label="Owner" value={selected.ownerName} />
              <Detail label="Owner User ID" value={selected.owner?._id || selected.owner || "—"} mono />
              <Detail label="Auction" value={selected.auction?.name || "—"} />
              <Detail label="Status" value={selected.status} />
              <Detail label="Total budget" value={selected.totalBudget} />
              <Detail label="Remaining budget" value={selected.remainingBudget} />
              <Detail label="Players" value={Array.isArray(selected.players) ? selected.players.length : 0} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`max-w-[65%] break-all text-right font-semibold text-slate-900 dark:text-white ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
