import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiRefreshCw, FiSearch, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { getAuctions } from "../../api/auctionApi";
import {
  createPlayer,
  deletePlayer,
  getPlayersByAuction,
  updatePlayer,
  updatePlayerStatus,
} from "../../api/playerApi";
import PlayerCard from "../../components/player/PlayerCard";
import PlayerForm from "../../components/player/PlayerForm";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

export default function PlayerManagement() {
  const [auctions, setAuctions] = useState([]);
  const [auctionId, setAuctionId] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
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

  const loadPlayers = async (id = auctionId) => {
    if (!id) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await getPlayersByAuction(id);
      setPlayers(result.players || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAuctions(); }, []);
  useEffect(() => { loadPlayers(); }, [auctionId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players.filter((player) => {
      const matchesSearch =
        !query ||
        `${player.fullName} ${player.lastName}`.toLowerCase().includes(query) ||
        player.role?.toLowerCase().includes(query) ||
        player.villageTown?.toLowerCase().includes(query);
      return matchesSearch && (!status || player.status === status);
    });
  }, [players, search, status]);

  const save = async (data) => {
    setSaving(true);
    try {
      const result = editing
        ? await updatePlayer(editing._id, data)
        : await createPlayer(data);
      toast.success(result.message || "Player saved successfully.");
      setShowForm(false);
      setEditing(null);
      await loadPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save player.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (player) => {
    const statuses = ["available", "auctioning", "sold", "unsold"];
    const next = window.prompt(
      `Enter status for ${player.fullName}: available, auctioning, sold, or unsold`,
      player.status
    );
    if (!next || !statuses.includes(next)) {
      if (next) toast.error("Invalid player status.");
      return;
    }

    try {
      const result = await updatePlayerStatus(player._id, next);
      toast.success(result.message || "Player status updated.");
      await loadPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update status.");
    }
  };

  const remove = async (player) => {
    if (!window.confirm(`Delete ${player.fullName} ${player.lastName}? This cannot be undone.`)) return;

    try {
      const result = await deletePlayer(player._id);
      toast.success(result.message || "Player deleted.");
      await loadPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete player.");
    }
  };

  if (showForm) {
    return (
      <section className="page-container">
        <div className="mb-6">
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">{editing ? "Edit Player" : "Create Player"}</h1>
          <p className="page-subtitle">
            Maintain player registration information before the auction starts.
          </p>
        </div>
        <div className="surface-card p-5 sm:p-7">
          <PlayerForm
            auctions={auctions}
            player={editing}
            loading={saving}
            onSubmit={save}
            onCancel={() => { setShowForm(false); setEditing(null); }}
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
          <h1 className="page-title">Player Management</h1>
          <p className="page-subtitle">Manage registered cricket players for each auction.</p>
        </div>
        <button className="primary-btn w-full sm:w-fit" onClick={() => { setEditing(null); setShowForm(true); }}>
          <FiPlus /> Create player
        </button>
      </div>

      <div className="surface-card mb-6 grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_minmax(160px,auto)_auto]">
        <div>
          <label className="label">Auction</label>
          <select className="input" value={auctionId} onChange={(e) => setAuctionId(e.target.value)}>
            <option value="">Select auction</option>
            {auctions.map((auction) => <option key={auction._id} value={auction._id}>{auction.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Search</label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, role, town" />
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="auctioning">Auctioning</option>
            <option value="sold">Sold</option>
            <option value="unsold">Unsold</option>
          </select>
        </div>
        <button className="secondary-btn self-end" onClick={() => loadPlayers()}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Unable to load players" message={error} onRetry={() => loadPlayers()} />
      ) : loading ? (
        <LoadingScreen />
      ) : !auctionId ? (
        <EmptyState icon={<FiUser />} title="Select an auction" description="Choose an auction to view its players." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FiUser />} title="No players found" description="Try another filter or create a player." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((player) => (
            <PlayerCard
              key={player._id}
              player={player}
              onView={setSelected}
              onEdit={(item) => { setEditing(item); setShowForm(true); }}
              onStatus={changeStatus}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-slate-900 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="h-40 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-40 sm:w-40 dark:bg-slate-800">
                {selected.photo?.url ? <img src={selected.photo.url} alt={selected.fullName} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Player details</p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selected.fullName} {selected.lastName}</h2>
                  </div>
                  <button className="secondary-btn" onClick={() => setSelected(null)}>Close</button>
                </div>
                <p className="mt-1 text-slate-500">{selected.role} · {selected.villageTown}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Info label="Age" value={selected.age || "—"} />
                  <Info label="Experience" value={`${selected.experience || 0} years`} />
                  <Info label="Base price" value={money(selected.basePrice)} />
                  <Info label="Current bid" value={money(selected.currentBid)} />
                  <Info label="Status" value={selected.status} />
                  <Info label="Auction order" value={selected.auctionOrder ?? 0} />
                </div>
              </div>
            </div>
            {selected.bio && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{selected.bio}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{value}</p></div>;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}
