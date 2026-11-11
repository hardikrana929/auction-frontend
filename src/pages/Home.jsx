import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiPlayCircle,
  FiShield,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import { Link } from "react-router-dom";
function HowItWorksStep({ number, icon, title, description }) {
  return (
    <div className="group relative text-center">
      {/* Number / Icon */}
      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-cyan-600 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400 group-hover:bg-cyan-500 group-hover:text-white dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-400 dark:group-hover:border-cyan-500 dark:group-hover:bg-cyan-500 dark:group-hover:text-white">
        <span className="text-2xl">{icon}</span>

        {/* Step number */}
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy-950 text-[10px] font-extrabold text-white dark:bg-cyan-500">
          {number}
        </span>
      </div>

      {/* Content */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-navy-950 dark:text-white">
          {title}
        </h3>

        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function WorkflowItem({ icon, title, text }) {
  return (
    <div className="flex items-center gap-4 lg:justify-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
        <span className="text-xl">{icon}</span>
      </div>

      <div>
        <p className="text-sm font-bold text-navy-950 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </div>
  );
}
const TEAMS = ["Mumbai Strikers", "Delhi Titans", "Chennai Kings", "Punjab Hawks"];
const START_BID = 1250000;
const STEP = 50000;
const CAP = 1600000;

const lakh = (n) => `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, "")}L`;

/* Looping, self-playing mini auction so the hero feels alive */
function useLiveAuction() {
  const [state, setState] = useState({
    bid: START_BID,
    bids: 128,
    team: 0,
    sold: false,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.sold) return { bid: START_BID, bids: 128, team: 0, sold: false };
        if (prev.bid >= CAP) return { ...prev, sold: true };
        return {
          bid: prev.bid + STEP,
          bids: prev.bids + 1,
          team: (prev.team + 1) % TEAMS.length,
          sold: false,
        };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return state;
}

export default function Home() {
  const live = useLiveAuction();
  const sold = live.sold;

  return (
    <div className="min-h-screen  text-navy-950  dark:text-white">
      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-x-clip">
        {/* Animated colour orbs (the glass blurs these) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="ap-orb absolute -right-32 top-4 h-[26rem] w-[26rem] rounded-full bg-cyan-400/40 blur-3xl dark:bg-cyan-500/25" />
          <div className="ap-orb ap-orb-b absolute -left-40 top-52 h-[24rem] w-[24rem] rounded-full bg-violet-400/35 blur-3xl dark:bg-violet-600/25" />
          <div className="ap-orb absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-24">
          {/* Left content */}
          <div>
            {/* Badge */}
            <div className="ap-rise mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-lg shadow-cyan-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              Professional Cricket Auction Platform
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-5xl lg:text-6xl dark:text-white">
              <span style={{ "--d": "120ms" }} className="ap-rise block">
                Build your team.
              </span>
              <span
                style={{ "--d": "280ms" }}
                className="ap-rise block pb-1"
              >
                <span className="ap-shimmer-text">Win the auction.</span>
              </span>
            </h1>

            {/* Description */}
            <p
              style={{ "--d": "440ms" }}
              className="ap-rise mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400"
            >
              AuctionPro brings cricket auctions into one powerful platform.
              Manage players, teams, budgets, registrations, live bidding and
              auction results with complete control.
            </p>

            {/* Buttons */}
            <div
              style={{ "--d": "580ms" }}
              className="ap-rise mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/auctions"
                className="glass-primary ap-shine px-6 py-3.5 text-sm"
              >
                Explore Auctions
                <FiArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-[0.875rem] border border-white/70 bg-white/55 px-6 py-3.5 text-sm font-bold text-navy-950 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-cyan-400"
              >
                Create Account
              </Link>
            </div>

            {/* Trust points */}
            <div
              style={{ "--d": "720ms" }}
              className="ap-rise mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              <TrustPoint text="Real-time bidding" />
              <TrustPoint text="Secure access" />
              <TrustPoint text="Team management" />
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg">
              <div style={{ "--d": "300ms" }} className="ap-zoom">
                <div className="ap-float">
                  {/* Main glass dashboard card */}
                  <div className="ap-tilt rounded-3xl border border-white/70 bg-white/45 p-4 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-black/50">
                    {/* Top bar */}
                    <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          LIVE AUCTION
                        </p>
                        <p className="mt-1 text-sm font-bold text-navy-950 dark:text-white">
                          Cricket Premier Auction
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-500 ${
                          sold
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                              sold ? "bg-amber-400" : "bg-green-400"
                            }`}
                          />
                          <span
                            className={`relative inline-flex h-2 w-2 rounded-full ${
                              sold ? "bg-amber-500" : "bg-green-500"
                            }`}
                          />
                        </span>
                        {sold ? "SOLD" : "LIVE"}
                      </div>
                    </div>

                    {/* Player card */}
                    <div className="mt-4 rounded-2xl bg-slate-950/80 p-5 ring-1 ring-white/10 backdrop-blur-xl">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/30">
                          AP
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                            Current Player
                          </p>
                          <h3 className="mt-1 truncate text-xl font-bold text-white">
                            Premium Player
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            All Rounder
                          </p>
                        </div>
                      </div>

                      {/* Current bid */}
                      <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">
                            {sold ? "Sold for" : "Current Bid"}
                          </span>
                          <span className="text-xs font-semibold text-cyan-400">
                            {sold ? "CONGRATULATIONS" : "NEXT BID AVAILABLE"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-end justify-between">
                          <span
                            key={live.bid}
                            className="ap-pop inline-block text-3xl font-extrabold text-white"
                          >
                            {lakh(live.bid)}
                          </span>
                          <span className="text-sm text-slate-400">
                            {sold ? TEAMS[live.team] : "+ ₹50K"}
                          </span>
                        </div>

                        {/* auto-restarting countdown bar */}
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                          {!sold && (
                            <div
                              key={live.bid}
                              className="ap-bar h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                              style={{ animationDuration: "2.2s" }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Bid button */}
                      <button
                        type="button"
                        className="glass-primary ap-shine mt-4 flex w-full py-3"
                      >
                        <FiZap className="h-4 w-4" />
                        Place Bid
                      </button>
                    </div>

                    {/* Bottom stats */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <MiniStat label="Teams" value="08" />
                      <MiniStat label="Players" value="64" />
                      <MiniStat label="Bids" value={String(live.bids)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification: follows the live bids */}
              <div className="ap-rise absolute -top-14 left-6 hidden sm:block" style={{ "--d": "900ms" }}>
                <div className="ap-float-slow rounded-2xl border border-white/80 bg-white/85 p-3.5 shadow-2xl shadow-slate-900/20 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/80 dark:shadow-black/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      <FiCheckCircle className="h-5 w-5" />
                    </div>
                    <div key={`${live.bid}-${sold}`} className="ap-pop">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {sold ? "PLAYER SOLD" : "NEW BID"}
                      </p>
                      <p className="text-sm font-bold text-navy-950 dark:text-white">
                        {lakh(live.bid)}{" "}
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          · {TEAMS[live.team]}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating teams */}
              <div className="ap-rise absolute -bottom-14 right-4 hidden sm:block" style={{ "--d": "1050ms" }}>
                <div className="ap-float rounded-2xl border border-white/80 bg-white/85 p-3.5 shadow-2xl shadow-slate-900/20 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/80 dark:shadow-black/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                      <FiUsers className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ACTIVE TEAMS
                      </p>
                      <p className="text-lg font-bold text-navy-950 dark:text-white">
                        08 Teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="border-y border-white/60 bg-white/30 py-20 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-500">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
              One platform for the entire auction
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              From registration to the final player sale, AuctionPro keeps your
              auction organized and under control.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FiPlayCircle />}
              title="Live Auctions"
              description="Run engaging real-time player auctions with live bidding."
            />

            <FeatureCard
              icon={<FiUsers />}
              title="Team Management"
              description="Manage teams, budgets and player selections in one place."
            />

            <FeatureCard
              icon={<FiBarChart2 />}
              title="Auction Analytics"
              description="Track bidding activity, results and auction performance."
            />

            <FeatureCard
              icon={<FiShield />}
              title="Controlled Access"
              description="Registration, approval and auction access controls keep events secure."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
    HOW AUCTIONPRO WORKS
====================================================== */}
      <section className="relative overflow-hidden border-y border-white/60 bg-white/30 py-20 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Section heading */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
              Simple & Powerful
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl dark:text-white">
              How AuctionPro Works
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              From creating your team to winning your favourite players,
              AuctionPro makes every stage of the auction simple, transparent
              and exciting.
            </p>
          </div>

          {/* Steps */}
          <div className="relative mt-16">
            {/* Connecting line - desktop */}
            <div className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-cyan-500/10 via-cyan-500 to-cyan-500/10 lg:block" />

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <HowItWorksStep
                number="01"
                icon={<FiUsers />}
                title="Create Your Team"
                description="Create your account and set up your team with the required auction details."
              />

              {/* Step 2 */}
              <HowItWorksStep
                number="02"
                icon={<FiCheckCircle />}
                title="Register & Get Approved"
                description="Register your team for an available auction and wait for administrator approval."
              />

              {/* Step 3 */}
              <HowItWorksStep
                number="03"
                icon={<FiPlayCircle />}
                title="Join the Live Auction"
                description="Once approved, enter the live auction and watch players appear for bidding."
              />

              {/* Step 4 */}
              <HowItWorksStep
                number="04"
                icon={<FiZap />}
                title="Bid & Build Your Squad"
                description="Place strategic bids, manage your budget and build the strongest possible team."
              />
            </div>
          </div>

          {/* Bottom workflow */}
          <div className="mt-16 rounded-3xl border border-white/70 bg-white/55 p-6 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
              {/* Registration */}
              <WorkflowItem
                icon={<FiUsers />}
                title="Registration"
                text="Join an auction"
              />

              <FiArrowRight className="hidden h-5 w-5 text-cyan-500 lg:block" />

              {/* Bidding */}
              <WorkflowItem
                icon={<FiZap />}
                title="Live Bidding"
                text="Compete in real time"
              />

              <FiArrowRight className="hidden h-5 w-5 text-cyan-500 lg:block" />

              {/* Results */}
              <WorkflowItem
                icon={<FiBarChart2 />}
                title="Final Results"
                text="Build your winning squad"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 glass-primary px-6 py-3.5 text-sm"
            >
              Explore Auctions
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950/75 px-6 py-14 shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-2xl sm:px-10 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Ready to get started?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
                Create your team and enter the next auction.
              </h2>

              <p className="mt-4 max-w-xl text-slate-400">
                Join AuctionPro and experience a modern, organized cricket
                auction platform.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 glass-primary px-6 py-3.5 text-sm"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/auctions"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-cyan-500 hover:text-cyan-400"
              >
                Browse Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-white/60 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-sm font-bold text-navy-950 dark:text-white">
              AuctionPro
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Professional cricket auction management platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/auctions" className="transition hover:text-cyan-500">
              Auctions
            </Link>

            <Link to="/login" className="transition hover:text-cyan-500">
              Login
            </Link>

            <Link to="/register" className="transition hover:text-cyan-500">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function TrustPoint({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      <FiCheckCircle className="h-4 w-4 text-green-500" />
      {text}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/60 p-3 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <p className="text-lg font-bold text-navy-950 dark:text-white">{value}</p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-white/70 bg-white/55 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300 hover:bg-white/75 hover:shadow-xl hover:shadow-cyan-500/15 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.09]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 transition group-hover:bg-cyan-500 group-hover:text-white dark:bg-cyan-500/10 dark:text-cyan-400 dark:group-hover:bg-cyan-500">
        <span className="text-xl">{icon}</span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-navy-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-xs font-extrabold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
        {number}
      </div>

      <div>
        <h3 className="font-bold text-navy-950 dark:text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function LargeStat({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-extrabold text-navy-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
