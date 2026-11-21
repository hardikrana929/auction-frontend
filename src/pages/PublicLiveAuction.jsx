import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { FiRadio, FiUser } from "react-icons/fi";
import { getPublicLiveAuctions, getPublicLiveState } from "../api/publicApi";
import { formatCurrency } from "../utils/formatCurrency";
import { formatShortAmount } from "../utils/formatAmount";

/*
 * PUBLIC live auction screen. No login.
 * Shows only the player's photo and details and the current bid.
 *   /live              -> pick a live auction
 *   /live/:auctionId   -> the live screen
 */

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const POLL_MS = 5000;

const messages = {
  upcoming: ["This auction has not started yet", "Please check back when it goes live."],
  waiting: ["Next player coming up", "The auction is live. Stay tuned."],
  paused: ["Auction paused", "Bidding will continue shortly."],
  completed: ["This auction has ended", "Thank you for watching."],
};

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="text-lg font-black tracking-tight">
          Auction<span className="text-emerald-400">Pro</span>
        </Link>
        <Link to="/live" className="text-sm font-semibold text-slate-400 hover:text-white">
          All live auctions
        </Link>
      </header>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- list */
function LiveList() {
  const [auctions, setAuctions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicLiveAuctions()
      .then((r) => setAuctions(r.auctions || []))
      .catch(() => setError("Unable to load live auctions."));
  }, []);

  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-6">
        <h1 className="flex items-center gap-2 text-3xl font-black">
          <FiRadio className="text-rose-500" /> Live auctions
        </h1>
        {error && <p className="mt-6 text-red-400">{error}</p>}
        {auctions && auctions.length === 0 && (
          <p className="mt-6 text-slate-400">No auction is live right now.</p>
        )}
        <ul className="mt-6 space-y-3">
          {(auctions || []).map((a) => (
            <li key={a._id}>
              <Link
                to={`/live/${a._id}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition hover:bg-white/[0.08]"
              >
                <span className="font-bold">{a.name}</span>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300">
                  Watch live
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </Shell>
  );
}

/* -------------------------------------------------------------- screen */
function LiveScreen({ auctionId }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const lastBid = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getPublicLiveState(auctionId);
      setState(data);
      setError("");
    } catch (e) {
      setError(
        e.response?.status === 404
          ? "This auction is not available."
          : "Connection problem. Retrying…",
      );
    }
  }, [auctionId]);

  // initial load + polling fallback
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // instant updates over a socket that needs no login
  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.on("connect", () => socket.emit("public:join", { auctionId }));
    socket.on("public:update", load);
    return () => {
      socket.emit("public:leave", { auctionId });
      socket.disconnect();
    };
  }, [auctionId, load]);

  // brief highlight whenever the bid changes
  useEffect(() => {
    if (state?.phase !== "bidding") return undefined;
    if (lastBid.current !== null && lastBid.current !== state.currentBid) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      lastBid.current = state.currentBid;
      return () => clearTimeout(t);
    }
    lastBid.current = state.currentBid;
    return undefined;
  }, [state]);

  const player = state?.player;
  const phase = state?.phase;
  const short = formatShortAmount(state?.currentBid);

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-2 sm:px-8">
        <div className="mb-5">
          <p className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <span className="size-2 animate-pulse rounded-full bg-rose-500" /> LIVE
          </p>
          <h1 className="text-2xl font-black sm:text-3xl">{state?.auction?.name || "Live auction"}</h1>
        </div>

        {error && !state && <p className="text-lg text-slate-300">{error}</p>}
        {error && state && <p className="mb-3 text-sm text-amber-300">{error}</p>}

        {state && !player && messages[phase] && (
          <div className="grid min-h-[50vh] place-items-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div>
              <p className="text-3xl font-black sm:text-5xl">{messages[phase][0]}</p>
              <p className="mt-3 text-slate-400">{messages[phase][1]}</p>
            </div>
          </div>
        )}

        {player && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900">
              {player.photo ? (
                <img src={player.photo} alt={`${player.fullName} ${player.lastName}`} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/5] place-items-center text-8xl text-slate-700"><FiUser /></div>
              )}
              {phase !== "bidding" && (
                <div className={`absolute inset-x-0 bottom-0 p-4 text-center text-2xl font-black tracking-wide ${phase === "sold" ? "bg-emerald-500 text-emerald-950" : "bg-slate-600 text-white"}`}>
                  {phase === "sold" ? "SOLD" : "UNSOLD"}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                  {player.fullName} {player.lastName}
                </h2>
                <p className="mt-2 text-lg text-slate-300">
                  {player.role} · {player.villageTown}
                </p>
              </div>

              <div className={`rounded-3xl border p-6 transition-colors duration-500 ${flash ? "border-emerald-400 bg-emerald-400/20" : "border-white/10 bg-white/[0.04]"}`}>
                <p className="text-sm font-semibold text-slate-400">
                  {phase === "sold" ? "Sold for" : phase === "unsold" ? "Result" : "Current bid"}
                </p>
                {phase === "unsold" ? (
                  <p className="mt-1 text-4xl font-black text-slate-300">Unsold</p>
                ) : (
                  <>
                    <p className="mt-1 text-5xl font-black tabular-nums text-emerald-400 sm:text-7xl">
                      {formatCurrency(state.currentBid)}
                    </p>
                    {short && state.currentBid >= 1000 && (
                      <p className="mt-1 text-2xl font-bold text-emerald-300/80">{short}</p>
                    )}
                  </>
                )}
                {phase === "bidding" && player.basePrice > 0 && (
                  <p className="mt-3 text-sm text-slate-400">Base price {formatCurrency(player.basePrice)}</p>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {[
                  ["Age", player.age],
                  ["Experience", `${player.experience || 0} yrs`],
                  ["Batting", player.battingHand],
                  ["Bowling", player.bowlingStyle],
                  ["Player ID", player.auctionNumber],
                ]
                  .filter(([, v]) => v !== null && v !== undefined && v !== "")
                  .map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/[0.05] px-4 py-3">
                      <dt className="text-xs text-slate-400">{label}</dt>
                      <dd className="font-bold">{value}</dd>
                    </div>
                  ))}
              </dl>
              {player.specialization?.length > 0 && (
                <p className="text-sm text-slate-300">{player.specialization.join(" · ")}</p>
              )}
              {player.bio && <p className="text-sm text-slate-400">{player.bio}</p>}
            </div>
          </div>
        )}

      </main>
    </Shell>
  );
}

export default function PublicLiveAuction() {
  const { auctionId } = useParams();
  return auctionId ? <LiveScreen key={auctionId} auctionId={auctionId} /> : <LiveList />;
}
