import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getPlayer } from "../api/playerApi";
import LoadingScreen from "../components/LoadingScreen";
import ErrorState from "../components/ErrorState";
import PlayerStatusBadge from "../components/player/PlayerStatusBadge";

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPlayer(id);
      setPlayer(result.player);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load player.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingScreen />;
  if (error) return <section className="page-container"><ErrorState title="Unable to load player" message={error} onRetry={load} /></section>;

  return (
    <section className="page-container">
      <Link to="/admin/players" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
        <FiArrowLeft /> Back to players
      </Link>

      <div className="surface-card overflow-hidden">
        <div className="grid gap-7 p-6 md:grid-cols-[280px_1fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
            {player.photo?.url ? (
              <img src={player.photo.url} alt={player.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-black text-slate-300">
                {player.fullName?.slice(0, 1)}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="page-title">{player.fullName} {player.lastName}</h1>
              <PlayerStatusBadge status={player.status} />
            </div>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{player.role} · {player.villageTown}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Gender" value={player.gender} />
              <Info label="Age" value={player.age || "—"} />
              <Info label="Batting" value={player.battingHand} />
              <Info label="Bowling" value={player.bowlingStyle} />
              <Info label="Experience" value={`${player.experience || 0} years`} />
              <Info label="Auction order" value={player.auctionOrder ?? 0} />
              <Info label="Base price" value={money(player.basePrice)} />
              <Info label="Current bid" value={money(player.currentBid)} />
            </div>

            {player.specialization?.length > 0 && (
              <div className="mt-5">
                <p className="label">Specialization</p>
                <div className="flex flex-wrap gap-2">
                  {player.specialization.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {player.bio && <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{player.bio}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{value || "—"}</p></div>;
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}
