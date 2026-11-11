import { Link } from "react-router-dom";
import { FiActivity, FiCheckCircle, FiShield, FiZap } from "react-icons/fi";

import ThemeToggle from "./ThemeToggle";

const FEATURES = [
  { icon: FiZap, text: "Real-time player bidding" },
  { icon: FiShield, text: "Secure, role-based access" },
  { icon: FiCheckCircle, text: "Teams, players & live statistics" },
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden p-4 sm:p-6">
      {/* drifting colour orbs behind the glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ap-orb absolute -left-24 top-10 h-96 w-96 rounded-full bg-cyan-400/40 blur-3xl dark:bg-cyan-500/25" />
        <div className="ap-orb ap-orb-b absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-violet-400/40 blur-3xl dark:bg-violet-600/25" />
      </div>

      <div className="ap-zoom mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 shadow-[0_30px_90px_-20px_rgba(15,23,42,0.35)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-black/50 sm:min-h-[calc(100vh-3rem)] lg:grid-cols-2">
        {/* ---------- brand panel ---------- */}
        <section className="relative hidden overflow-hidden border-r border-white/60 bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-violet-500/15 p-10 dark:border-white/10 lg:flex lg:flex-col lg:justify-between">
          <Link
            to="/login"
            className="flex items-center gap-3 text-xl font-extrabold text-slate-950 dark:text-white"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <FiActivity />
            </span>
            AuctionPro
          </Link>

          <div className="relative">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
              Cricket Auction Platform
            </p>
            <h2 className="max-w-md text-4xl font-black leading-tight text-slate-950 dark:text-white">
              Manage auctions with{" "}
              <span className="ap-shimmer-text">confidence.</span>
            </h2>
            <p className="mt-5 max-w-md text-slate-600 dark:text-slate-300">
              Secure authentication for administrators, teams and auction
              participants.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <li
                  key={text}
                  style={{ "--d": `${500 + i * 120}ms` }}
                  className="ap-rise flex items-center gap-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                    <Icon size={16} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            AuctionPro • Professional Auction Management
          </p>
        </section>

        {/* ---------- form panel ---------- */}
        <section className="relative flex items-center p-6 pt-20 sm:p-10 sm:pt-20">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
            <ThemeToggle compact />
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                to="/login"
                className="text-2xl font-black text-slate-950 dark:text-white"
              >
                AuctionPro
              </Link>
            </div>
            <h1 className="ap-rise text-3xl font-black text-slate-950 dark:text-white">
              {title}
            </h1>
            <p
              style={{ "--d": "80ms" }}
              className="ap-rise mt-2 text-slate-500 dark:text-slate-400"
            >
              {subtitle}
            </p>
            <div style={{ "--d": "160ms" }} className="ap-rise mt-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
