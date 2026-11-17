import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiExternalLink,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import GlassSelect from "../components/GlassSelect";
import PlayerStatusBadge from "../components/player/PlayerStatusBadge";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import usePagination from "../hooks/usePagination";
import { getMyPlayerAuctions } from "../api/playerRegistrationApi";
import { getPlayersByAuction } from "../api/playerApi";
import { formatCurrency } from "../utils/formatCurrency";

const ROLES = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];

const SORTS = {
  order: { label: "Auction order", fn: (a, b) => (a.auctionOrder ?? 0) - (b.auctionOrder ?? 0) },
  priceHigh: { label: "Base price: high to low", fn: (a, b) => b.basePrice - a.basePrice },
  priceLow: { label: "Base price: low to high", fn: (a, b) => a.basePrice - b.basePrice },
  experience: { label: "Most experienced", fn: (a, b) => (b.experience ?? 0) - (a.experience ?? 0) },
  youngest: { label: "Youngest first", fn: (a, b) => (a.age ?? 999) - (b.age ?? 999) },
  name: {
    label: "Name A–Z",
    fn: (a, b) => `${a.fullName} ${a.lastName}`.localeCompare(`${b.fullName} ${b.lastName}`),
  },
};

const shortlistKey = (auctionId) => `auctionpro_shortlist_${auctionId}`;
const readShortlist = (auctionId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(shortlistKey(auctionId)) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
const writeShortlist = (auctionId, ids) => {
  try {
    localStorage.setItem(shortlistKey(auctionId), JSON.stringify(ids));
  } catch {
    /* private mode / storage full: shortlist just won't persist */
  }
};

export default function PlayersBrowse() {
  const [auctions, setAuctions] = useState([]);
  const [auctionId, setAuctionId] = useState("");
  const [players, setPlayers] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("order");
  const [onlyShortlist, setOnlyShortlist] = useState(false);
  const [shortlist, setShortlist] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadAuctions = useCallback(async () => {
    setLoadingAuctions(true);
    setError("");
    try {
      const result = await getMyPlayerAuctions();
      const list = result.auctions || [];
      setAuctions(list);
      setAuctionId((current) => current || list[0]?._id || "");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your auctions.");
    } finally {
      setLoadingAuctions(false);
    }
  }, []);

  const loadPlayers = useCallback(async (id) => {
    if (!id) {
      setPlayers([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getPlayersByAuction(id);
      setPlayers(result.players || []);
    } catch (err) {
      setPlayers([]);
      setError(err.response?.data?.message || "Unable to load players.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  useEffect(() => {
    setShortlist(auctionId ? readShortlist(auctionId) : []);
    setRole("");
    setStatus("");
    setSearch("");
    setOnlyShortlist(false);
    loadPlayers(auctionId);
  }, [auctionId, loadPlayers]);

  const toggleShortlist = (playerId) => {
    setShortlist((current) => {
      const next = current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId];
      writeShortlist(auctionId, next);
      return next;
    });
  };

  const roleCounts = useMemo(() => {
    const counts = {};
    players.forEach((p) => {
      counts[p.role] = (counts[p.role] || 0) + 1;
    });
    return counts;
  }, [players]);

  const statusCounts = useMemo(() => {
    const counts = { available: 0, sold: 0, unsold: 0 };
    players.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    });
    return counts;
  }, [players]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return players
      .filter((p) => {
        if (role && p.role !== role) return false;
        if (status && p.status !== status) return false;
        if (onlyShortlist && !shortlist.includes(p._id)) return false;
        if (!query) return true;
        return (
          `${p.fullName} ${p.lastName}`.toLowerCase().includes(query) ||
          p.villageTown?.toLowerCase().includes(query) ||
          p.specialization?.some((s) => s.toLowerCase().includes(query))
        );
      })
      .sort(SORTS[sort].fn);
  }, [players, search, role, status, sort, onlyShortlist, shortlist]);

  const pager = usePagination(filtered, {
    initialPageSize: 12,
    resetKey: [auctionId, search, role, status, sort, onlyShortlist],
  });

  const currentAuction = auctions.find((a) => a._id === auctionId);

  return (
    <section className="page-container space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Scouting</p>
          <h1 className="page-title">Players</h1>
          <p className="page-subtitle">
            Compare everyone in the auction pool, shortlist your targets, and decide
            who is worth your budget.
          </p>
        </div>
        <button
          className="secondary-btn w-full sm:w-fit"
          onClick={() => loadPlayers(auctionId)}
          disabled={!auctionId || loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loadingAuctions ? (
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading your auctions…
        </p>
      ) : auctions.length === 0 && !error ? (
        <EmptyState
          title="No auctions yet"
          message="Once your team is registered for an auction, its players will appear here."
        />
      ) : (
        <>
          <div className="surface-card grid gap-4 p-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(200px,1.5fr)_minmax(200px,1fr)]">
            <div>
              <label className="label">Auction</label>
              <GlassSelect
                ariaLabel="Auction"
                value={auctionId}
                onChange={setAuctionId}
                placeholder="Select auction"
                options={auctions.map((a) => ({ value: a._id, label: a.name }))}
              />
            </div>
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  className="input pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, town, skill"
                />
              </div>
            </div>
            <div>
              <label className="label">Sort by</label>
              <GlassSelect
                ariaLabel="Sort players"
                value={sort}
                onChange={setSort}
                options={Object.entries(SORTS).map(([value, { label }]) => ({
                  value,
                  label,
                }))}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
                <Chip active={!role} onClick={() => setRole("")}>
                  All roles <Count>{players.length}</Count>
                </Chip>
                {ROLES.map((r) => (
                  <Chip key={r} active={role === r} onClick={() => setRole(role === r ? "" : r)}>
                    {r} <Count>{roleCounts[r] || 0}</Count>
                  </Chip>
                ))}
                <span className="mx-1 h-6 w-px shrink-0 bg-slate-300 dark:bg-white/10" />
                {["available", "sold", "unsold"].map((s) => (
                  <Chip
                    key={s}
                    active={status === s}
                    onClick={() => setStatus(status === s ? "" : s)}
                  >
                    <span className="capitalize">{s}</span> <Count>{statusCounts[s]}</Count>
                  </Chip>
                ))}
                <span className="mx-1 h-6 w-px shrink-0 bg-slate-300 dark:bg-white/10" />
                <Chip active={onlyShortlist} onClick={() => setOnlyShortlist((v) => !v)}>
                  <FiStar className={onlyShortlist ? "fill-current" : ""} /> Shortlist{" "}
                  <Count>{shortlist.length}</Count>
                </Chip>
              </div>
            </div>
          </div>

          {error ? (
            <ErrorState
              title="Unable to load players"
              message={error}
              onRetry={() => (auctionId ? loadPlayers(auctionId) : loadAuctions())}
            />
          ) : loading ? (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Loading players…
            </p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={players.length ? "No players match your filters" : "No players yet"}
              message={
                players.length
                  ? "Try clearing a filter or searching for something else."
                  : "Players will show up here as they are added to this auction."
              }
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {pager.pageItems.map((player) => (
                  <PlayerScoutCard
                    key={player._id}
                    player={player}
                    starred={shortlist.includes(player._id)}
                    onStar={() => toggleShortlist(player._id)}
                    onOpen={() => setSelected(player)}
                  />
                ))}
              </div>
              <Pagination
                {...pager}
                onPageChange={pager.setPage}
                onPageSizeChange={pager.setPageSize}
                label="players"
              />
            </>
          )}
        </>
      )}

      {selected && (
        <PlayerModal
          player={selected}
          auction={currentAuction}
          starred={shortlist.includes(selected._id)}
          onStar={() => toggleShortlist(selected._id)}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
        active
          ? "bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          : "border border-white/70 bg-white/50 text-slate-700 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }) {
  return (
    <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] leading-none dark:bg-white/15">
      {children}
    </span>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-xl bg-white/40 p-2.5 dark:bg-white/[0.05]">
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function PlayerScoutCard({ player, starred, onStar, onOpen }) {
  const sold = player.status === "sold";
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/55 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/45 dark:shadow-black/30">
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {player.photo?.url ? (
          <img
            src={player.photo.url}
            alt={`${player.fullName} ${player.lastName}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-black text-slate-300 dark:text-slate-600">
            {player.fullName?.slice(0, 1).toUpperCase() || "P"}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <PlayerStatusBadge status={player.status} />
        </div>
        <button
          type="button"
          onClick={onStar}
          aria-pressed={starred}
          aria-label={starred ? "Remove from shortlist" : "Add to shortlist"}
          className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full backdrop-blur-xl transition ${
            starred
              ? "bg-amber-400 text-white shadow-lg shadow-amber-500/40"
              : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-200"
          }`}
        >
          <FiStar className={starred ? "fill-current" : ""} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate text-lg font-black text-slate-900 dark:text-white">
          {player.fullName} {player.lastName}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
          {player.role} · {player.villageTown}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Fact label="Batting" value={player.battingHand || "—"} />
          <Fact label="Bowling" value={player.bowlingStyle || "—"} />
          <Fact label="Experience" value={`${player.experience ?? 0} yrs`} />
          <Fact label="Age" value={player.age ?? "—"} />
        </div>

        {player.specialization?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {player.specialization.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sold ? "Sold for" : "Base price"}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(sold ? player.soldPrice : player.basePrice)}
              </p>
              {sold && player.soldTo?.name && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  to {player.soldTo.name}
                </p>
              )}
            </div>
            <button className="secondary-btn !px-3 !py-2" onClick={onOpen}>
              Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlayerModal({ player, auction, starred, onStar, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sold = player.status === "sold";
  const budget = Number(auction?.teamBudget ?? auction?.startingBudget ?? 0);
  const share =
    budget > 0 ? Math.round((Number(player.basePrice || 0) / budget) * 100) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/70 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="mx-auto h-44 w-44 shrink-0 overflow-hidden rounded-2xl bg-slate-900/5 dark:bg-white/10 sm:mx-0">
            {player.photo?.url ? (
              <img src={player.photo.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-black text-slate-300 dark:text-slate-600">
                <FiUser />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black text-slate-900 dark:text-white">
                  {player.fullName} {player.lastName}
                </h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  {player.role} · {player.villageTown}
                </p>
                <div className="mt-2">
                  <PlayerStatusBadge status={player.status} />
                </div>
              </div>
              <button className="icon-btn shrink-0" onClick={onClose} aria-label="Close">
                <FiX />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Fact label="Age" value={player.age ?? "—"} />
              <Fact label="Gender" value={player.gender || "—"} />
              <Fact label="Batting hand" value={player.battingHand || "—"} />
              <Fact label="Bowling style" value={player.bowlingStyle || "—"} />
              <Fact label="Experience" value={`${player.experience ?? 0} years`} />
              <Fact
                label={sold ? "Sold for" : "Base price"}
                value={formatCurrency(sold ? player.soldPrice : player.basePrice)}
              />
            </div>
          </div>
        </div>

        {share !== null && !sold && (
          <p className="mt-4 rounded-xl bg-cyan-500/10 p-3 text-sm text-cyan-800 dark:text-cyan-200">
            Base price is about <strong>{share}%</strong> of a team&apos;s{" "}
            {formatCurrency(budget)} purse.
          </p>
        )}

        {player.specialization?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {player.specialization.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {player.bio && (
          <p className="mt-4 rounded-xl bg-white/50 p-4 text-sm text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
            {player.bio}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button className="secondary-btn" onClick={onStar}>
            <FiStar className={starred ? "fill-current text-amber-500" : ""} />
            {starred ? "Shortlisted" : "Add to shortlist"}
          </button>
          <Link to={`/players/${player._id}`} className="primary-btn">
            <FiExternalLink /> Full profile
          </Link>
        </div>
      </div>
    </div>
  );
}
