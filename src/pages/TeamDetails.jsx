import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiUsers } from "react-icons/fi";
import { getTeam } from "../api/teamApi";
import TeamStatusBadge from "../components/team/TeamStatusBadge";
import LoadingScreen from "../components/LoadingScreen";
import ErrorState from "../components/ErrorState";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function TeamDetails() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getTeam(id);
      setTeam(result.team);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingScreen />;
  if (error) return <section className="page-container"><ErrorState title="Unable to load team" message={error} onRetry={load} /></section>;

  return (
    <section className="page-container">
      <Link to="/admin/teams" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
        <FiArrowLeft /> Back to teams
      </Link>

      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-slate-200 p-6 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="h-24 w-24 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
            {team.logo?.url ? (
              <img src={team.logo.url} alt={`${team.name} logo`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-black text-slate-400">
                {team.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="page-title">{team.name}</h1>
              <TeamStatusBadge status={team.status} />
            </div>
            <p className="page-subtitle">Owner: {team.ownerName}</p>
            <p className="mt-1 text-sm text-slate-500">{team.auction?.name || "Auction"}</p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total budget" value={money(team.totalBudget)} />
          <Metric label="Remaining budget" value={money(team.remainingBudget)} />
          <Metric label="Players" value={Array.isArray(team.players) ? team.players.length : 0} />
          <Metric label="Status" value={team.status} />
        </div>
      </div>

      <div className="surface-card mt-5 p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <FiUsers /> Squad
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Player allocation will be connected to the Player/Auction workflow in the later groups.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
