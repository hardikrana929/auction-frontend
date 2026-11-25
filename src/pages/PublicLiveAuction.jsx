import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { FiDroplet, FiMaximize, FiMinimize, FiRadio, FiUser } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import {
  DEFAULT_LIVE_THEME,
  LIVE_PRESETS,
  resolveLiveTheme,
  sanitizeLiveSettings,
} from "../utils/liveThemes";
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

const THEME_KEY = "auctionpro_live_theme";

const loadThemeSettings = () => {
  try {
    return sanitizeLiveSettings(JSON.parse(localStorage.getItem(THEME_KEY)));
  } catch {
    return DEFAULT_LIVE_THEME;
  }
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

/*
 * Everything is sized with vmin / cqw / clamp(), so the layout scales from a
 * phone to a 4K projector: photo, name and bid grow and shrink with the
 * screen. Landscape = photo card on the left, bid on the right; portrait
 * stacks them. Colours come from CSS variables (see utils/liveThemes.js) set
 * on this page only.
 */
const LIVE_CSS = `
.pl-root,.pl-root *{box-sizing:border-box}
.pl-root :where(p,h1,h2,h3,dl,dd,dt){margin:0}
.pl-root{height:100dvh;display:flex;flex-direction:column;gap:clamp(.5rem,1.6vmin,1.75rem);padding:clamp(.75rem,2.4vmin,3rem);background:var(--bg);color:var(--fg);overflow:hidden;position:relative;transition:background-color .3s,color .3s}
.pl-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex:none}
.pl-title{font-size:clamp(1rem,2.8vmin,2.5rem);font-weight:900;line-height:1.1}
.pl-live{display:flex;align-items:center;gap:.5em;font-size:clamp(.7rem,1.6vmin,1.25rem);font-weight:800;color:#ef4444;letter-spacing:.08em}
.pl-live i{width:.7em;height:.7em;border-radius:50%;background:#ef4444;animation:pl-pulse 1.4s infinite}
.pl-tools{display:flex;gap:.5rem}
.pl-btn{display:inline-flex;align-items:center;gap:.4em;padding:.55em .9em;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--cardfg);font-size:clamp(.75rem,1.7vmin,1.2rem);font-weight:700;cursor:pointer}
.pl-btn:hover{filter:brightness(1.08)}
.pl-main{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,8fr);gap:clamp(1rem,3.5vmin,4rem)}
.pl-card{container-type:inline-size;display:flex;flex-direction:column;min-height:0;background:var(--card);color:var(--cardfg);border:2px solid var(--border);border-radius:clamp(14px,2.4vmin,32px);overflow:hidden;box-shadow:0 .6em 2em rgba(0,0,0,.18)}
.pl-photo{position:relative;flex:1;min-height:0;background:color-mix(in srgb,var(--cardfg) 8%,transparent);container-type:inline-size}
.pl-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:filter .4s}
.pl-photo.is-unsold img{filter:grayscale(1) brightness(.85)}
.pl-ph{position:absolute;inset:0;display:grid;place-items:center;font-size:30cqw;opacity:.25}
.pl-stamp{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) rotate(-24deg);padding:.02em .22em;border:.09em solid currentColor;border-radius:.12em;font-size:clamp(2.2rem,26cqw,12rem);font-weight:900;letter-spacing:.06em;line-height:1.05;background:rgba(0,0,0,.28);text-shadow:0 .03em .12em rgba(0,0,0,.45);animation:pl-stamp .45s ease-out both;white-space:nowrap}
.pl-stamp.sold{color:var(--sold)}
.pl-stamp.unsold{color:#d1d5db;border-color:#d1d5db}
.pl-info{flex:none;padding:clamp(.6rem,5cqw,1.5rem)}
.pl-name{font-size:clamp(1.1rem,7cqw,3rem);font-weight:900;line-height:1.1;overflow-wrap:anywhere}
.pl-sub{margin-top:.2em;font-size:clamp(.75rem,4cqw,1.4rem);color:color-mix(in srgb,var(--cardfg) 68%,transparent)}
.pl-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5em;margin-top:clamp(.5rem,3cqw,1rem)}
.pl-stats dt{font-size:clamp(.65rem,3.2cqw,1.1rem);color:color-mix(in srgb,var(--cardfg) 62%,transparent)}
.pl-stats dd{font-size:clamp(.8rem,4.6cqw,1.6rem);font-weight:800;overflow-wrap:anywhere}
.pl-side{container-type:inline-size;display:flex;flex-direction:column;justify-content:center;gap:clamp(.5rem,2.4vmin,2rem);min-width:0}
.pl-label{font-size:clamp(1rem,min(2.8vmin,4cqw),2.8rem);font-weight:700;color:var(--muted)}
.pl-bid{font-size:clamp(2.4rem,min(17vmin,11.5cqw),17rem);font-weight:900;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:var(--accent);white-space:nowrap;transition:color .3s}
.pl-bid.flash{animation:pl-flash .7s ease-out}
.pl-short{font-size:clamp(1.1rem,min(4.4vmin,6cqw),4rem);font-weight:800;color:var(--muted)}
.pl-status{font-size:clamp(1.3rem,min(6.4vmin,7.2cqw),6rem);font-weight:900;line-height:1.1;overflow-wrap:anywhere}
.pl-status small{display:block;font-size:.4em;font-weight:700;color:var(--muted);margin-bottom:.2em}
.pl-sold{color:var(--sold)} .pl-unsold{color:var(--unsold)}
.pl-base{font-size:clamp(.85rem,min(2.4vmin,3.2cqw),2rem);color:var(--muted)}
.pl-idle{flex:1;display:grid;place-items:center;text-align:center;border:2px dashed var(--border);border-radius:clamp(14px,2.4vmin,32px);padding:2rem}
.pl-idle h2{font-size:clamp(1.6rem,7vmin,6rem);font-weight:900;line-height:1.1}
.pl-idle p{margin-top:.6em;font-size:clamp(.9rem,2.6vmin,2rem);color:var(--muted)}
.pl-panel{position:absolute;top:clamp(3rem,8vmin,5.5rem);right:clamp(.75rem,2.4vmin,3rem);z-index:20;width:min(92vw,22rem);padding:1rem;border-radius:1rem;background:var(--card);color:var(--cardfg);border:1px solid var(--border);box-shadow:0 1rem 3rem rgba(0,0,0,.35);font-size:.9rem}
.pl-panel h3{font-weight:800;margin-bottom:.6rem}
.pl-swatches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}
.pl-sw{display:flex;align-items:center;gap:.5rem;padding:.45rem .6rem;border-radius:.7rem;border:2px solid var(--border);background:transparent;color:inherit;font-weight:600;cursor:pointer;text-align:left}
.pl-sw[aria-pressed=true]{border-color:var(--accent)}
.pl-dot{width:1.2rem;height:1.2rem;border-radius:50%;border:1px solid var(--border);flex:none}
.pl-pick{display:grid;grid-template-columns:1fr auto;gap:.4rem .6rem;align-items:center;margin-top:.8rem}
.pl-pick input{width:3rem;height:2rem;border:none;background:none;padding:0;cursor:pointer}
@media (max-aspect-ratio:11/10){
 .pl-root{height:auto;min-height:100dvh;overflow:auto}
 .pl-main{grid-template-columns:minmax(0,1fr);justify-items:center}
 .pl-card{width:min(100%,calc(50dvh*.8))}
 .pl-photo{flex:none;aspect-ratio:4/5}
 .pl-side{width:100%}
 .pl-bid{font-size:clamp(2.2rem,min(15vmin,15cqw),8rem)}
}
@keyframes pl-pulse{50%{opacity:.35}}
@keyframes pl-flash{0%{transform:scale(1.06);filter:brightness(1.35)}100%{transform:none;filter:none}}
@keyframes pl-stamp{0%{transform:translate(-50%,-50%) rotate(-24deg) scale(1.8);opacity:0}100%{transform:translate(-50%,-50%) rotate(-24deg) scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.pl-bid.flash,.pl-stamp,.pl-live i{animation:none}}
`;

function ThemePanel({ settings, onChange, onClose }) {
  return (
    <div className="pl-panel" role="dialog" aria-label="Live screen theme">
      <h3>Screen theme</h3>
      <div className="pl-swatches">
        {LIVE_PRESETS.map((preset) => {
          const vars = preset.vars;
          return (
            <button
              key={preset.id}
              type="button"
              className="pl-sw"
              aria-pressed={settings.preset === preset.id}
              onClick={() => onChange({ ...settings, preset: preset.id })}
            >
              <span
                className="pl-dot"
                style={{
                  background: vars
                    ? `linear-gradient(135deg, ${vars.bg} 50%, ${vars.card} 50%)`
                    : preset.id === "custom"
                      ? `linear-gradient(135deg, ${settings.bg} 50%, ${settings.card} 50%)`
                      : "conic-gradient(#f1f5f9 0 50%, #0f172a 0 100%)",
                }}
              />
              {preset.label}
            </button>
          );
        })}
      </div>

      {settings.preset === "custom" && (
        <div className="pl-pick">
          <label htmlFor="pl-bg">Background color</label>
          <input id="pl-bg" type="color" value={settings.bg} onChange={(e) => onChange({ ...settings, bg: e.target.value })} />
          <label htmlFor="pl-card">Ground (card) color</label>
          <input id="pl-card" type="color" value={settings.card} onChange={(e) => onChange({ ...settings, card: e.target.value })} />
        </div>
      )}
      <p style={{ marginTop: ".8rem", opacity: 0.7, fontSize: ".78rem" }}>
        Only changes this live screen. Text colour adjusts automatically.
      </p>
      <button type="button" className="pl-btn" style={{ marginTop: ".6rem" }} onClick={onClose}>
        Done
      </button>
    </div>
  );
}

function LiveScreen({ auctionId }) {
  const { theme: appTheme } = useTheme();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const [settings, setSettings] = useState(loadThemeSettings);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const lastBid = useRef(null);

  const vars = resolveLiveTheme(settings, appTheme);

  const updateSettings = (next) => {
    setSettings(next);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(next));
    } catch {
      /* private mode: the theme just is not remembered */
    }
  };

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

  // close the theme panel with Escape; keep the fullscreen button in sync
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPanelOpen(false);
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const player = state?.player;
  const phase = state?.phase;
  const short = state?.currentBid >= 1000 ? formatShortAmount(state.currentBid) : "";
  const sold = phase === "sold";
  const unsold = phase === "unsold";

  const style = {
    "--bg": vars.bg, "--card": vars.card, "--fg": vars.fg, "--cardfg": vars.cardfg,
    "--muted": vars.muted, "--accent": vars.accent, "--border": vars.border,
    "--sold": vars.sold, "--unsold": vars.unsold,
  };
  const bidColor = sold ? "var(--sold)" : unsold ? "var(--unsold)" : undefined;

  return (
    <div className="pl-root" style={style}>
      <style>{LIVE_CSS}</style>

      <header className="pl-head">
        <div>
          <p className="pl-live"><i /> LIVE</p>
          <h1 className="pl-title">{state?.auction?.name || "Live auction"}</h1>
        </div>
        <div className="pl-tools">
          <button type="button" className="pl-btn" onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen} aria-label="Change screen theme">
            <FiDroplet /> Theme
          </button>
          <button type="button" className="pl-btn" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </header>

      {panelOpen && (
        <ThemePanel settings={settings} onChange={updateSettings} onClose={() => setPanelOpen(false)} />
      )}

      {error && !state && <div className="pl-idle"><h2>{error}</h2></div>}
      {error && state && <p style={{ color: "#f59e0b", fontSize: ".85rem" }}>{error}</p>}

      {state && !player && messages[phase] && (
        <div className="pl-idle">
          <div>
            <h2>{messages[phase][0]}</h2>
            <p>{messages[phase][1]}</p>
          </div>
        </div>
      )}

      {player && (
        <main className="pl-main">
          <section className="pl-card" aria-label="Player">
            <div className={`pl-photo ${unsold ? "is-unsold" : ""}`}>
              {player.photo ? (
                <img src={player.photo} alt={`${player.fullName} ${player.lastName}`} />
              ) : (
                <div className="pl-ph"><FiUser /></div>
              )}
              {(sold || unsold) && (
                <span className={`pl-stamp ${sold ? "sold" : "unsold"}`}>{sold ? "SOLD" : "UNSOLD"}</span>
              )}
            </div>
            <div className="pl-info">
              <h2 className="pl-name">{player.fullName} {player.lastName}</h2>
              <p className="pl-sub">
                {[player.role, player.villageTown, player.auctionNumber ? `ID ${player.auctionNumber}` : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <dl className="pl-stats">
                <div><dt>Age</dt><dd>{player.age || "—"}</dd></div>
                <div><dt>Batting</dt><dd>{player.battingHand || "—"}</dd></div>
                <div><dt>Bowling</dt><dd>{player.bowlingStyle || "—"}</dd></div>
              </dl>
            </div>
          </section>

          <section className="pl-side" aria-live="polite">
            <p className="pl-label">{sold ? "Sold for" : unsold ? "Result" : "Current bidding:"}</p>
            {unsold ? (
              <p className="pl-bid pl-unsold">Unsold</p>
            ) : (
              <>
                <p className={`pl-bid ${flash ? "flash" : ""}`} style={bidColor ? { color: bidColor } : undefined}>
                  {formatCurrency(state.currentBid)}
                </p>
                {short && <p className="pl-short" style={bidColor ? { color: bidColor } : undefined}>{short}</p>}
              </>
            )}

            {sold && (
              <p className="pl-status pl-sold">
                <small>Player sold in</small>
                {state.soldTo?.name || "a team"}
              </p>
            )}
            {unsold && <p className="pl-status pl-unsold">Player unsold</p>}
            {phase === "bidding" && player.basePrice > 0 && (
              <p className="pl-base">Opening bid {formatCurrency(player.basePrice)}</p>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default function PublicLiveAuction() {
  const { auctionId } = useParams();
  return auctionId ? <LiveScreen key={auctionId} auctionId={auctionId} /> : <LiveList />;
}
