import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
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
      <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-200 bg-white text-cyan-600 shadow-lg shadow-cyan-500/10 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400 group-hover:bg-cyan-500 group-hover:text-white dark:border-cyan-500/20 dark:bg-navy-850 dark:text-cyan-400 dark:group-hover:border-cyan-500 dark:group-hover:bg-cyan-500 dark:group-hover:text-white">
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

        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-600 dark:text-gray-400">
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

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-navy-950 dark:bg-navy-950 dark:text-white">
      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -left-40 top-60 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:pb-28 lg:pt-24">
          {/* Left content */}
          <div>
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              Professional Cricket Auction Platform
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-5xl lg:text-6xl dark:text-white">
              Build your team.
              <span className="block text-cyan-500">Win the auction.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-400">
              AuctionPro brings cricket auctions into one powerful platform.
              Manage players, teams, budgets, registrations, live bidding and
              auction results with complete control.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/auctions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600 hover:shadow-cyan-500/30"
              >
                Explore Auctions
                <FiArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-navy-950 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-navy-700 dark:bg-navy-900 dark:text-white dark:hover:border-cyan-500 dark:hover:text-cyan-400"
              >
                Create Account
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <TrustPoint text="Real-time bidding" />
              <TrustPoint text="Secure access" />
              <TrustPoint text="Team management" />
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg">
              {/* Main dashboard card */}
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 shadow-2xl dark:border-navy-700 dark:bg-navy-900">
                {/* Top bar */}
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-navy-850">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      LIVE AUCTION
                    </p>

                    <p className="mt-1 text-sm font-bold text-navy-950 dark:text-white">
                      Cricket Premier Auction
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    LIVE
                  </div>
                </div>

                {/* Player card */}
                <div className="mt-4 rounded-2xl bg-navy-950 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-2xl font-extrabold text-white">
                      AP
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        Current Player
                      </p>

                      <h3 className="mt-1 truncate text-xl font-bold text-white">
                        Premium Player
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">All Rounder</p>
                    </div>
                  </div>

                  {/* Current bid */}
                  <div className="mt-6 rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Current Bid</span>

                      <span className="text-xs font-semibold text-cyan-400">
                        NEXT BID AVAILABLE
                      </span>
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <span className="text-3xl font-extrabold text-white">
                        ₹12.5L
                      </span>

                      <span className="text-sm text-gray-400">+ ₹50K</span>
                    </div>
                  </div>

                  {/* Bid button */}
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-bold text-white"
                  >
                    <FiZap className="h-4 w-4" />
                    Place Bid
                  </button>
                </div>

                {/* Bottom stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniStat label="Teams" value="08" />

                  <MiniStat label="Players" value="64" />

                  <MiniStat label="Bids" value="128" />
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -left-4 top-20 hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:block dark:border-navy-700 dark:bg-navy-850">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      PLAYER SOLD
                    </p>

                    <p className="text-sm font-bold text-navy-950 dark:text-white">
                      ₹12.5 Lakhs
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating teams */}
              <div className="absolute -bottom-5 -right-5 hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:block dark:border-navy-700 dark:bg-navy-850">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                    <FiUsers className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="border-y border-gray-200 bg-gray-50 py-20 dark:border-navy-800 dark:bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-500">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-navy-950 sm:text-4xl dark:text-white">
              One platform for the entire auction
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
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
      <section className="relative overflow-hidden border-y border-gray-200 bg-gray-50 py-20 dark:border-navy-800 dark:bg-navy-900">
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

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
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
          <div className="mt-16 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-850 sm:p-8">
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
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600"
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
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-navy-950 px-6 py-14 sm:px-10 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Ready to get started?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
                Create your team and enter the next auction.
              </h2>

              <p className="mt-4 max-w-xl text-gray-400">
                Join AuctionPro and experience a modern, organized cricket
                auction platform.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                Get Started
                <FiArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/auctions"
                className="inline-flex items-center justify-center rounded-xl border border-navy-700 px-6 py-3.5 text-sm font-bold text-white transition hover:border-cyan-500 hover:text-cyan-400"
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
      <footer className="border-t border-gray-200 bg-gray-50 dark:border-navy-800 dark:bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-sm font-bold text-navy-950 dark:text-white">
              AuctionPro
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Professional cricket auction management platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-600 dark:text-gray-400">
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
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <FiCheckCircle className="h-4 w-4 text-green-500" />
      {text}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center dark:bg-navy-850">
      <p className="text-lg font-bold text-navy-950 dark:text-white">{value}</p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-navy-700 dark:bg-navy-850 dark:hover:border-cyan-500/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 transition group-hover:bg-cyan-500 group-hover:text-white dark:bg-cyan-500/10 dark:text-cyan-400 dark:group-hover:bg-cyan-500">
        <span className="text-xl">{icon}</span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-navy-950 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
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

        <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function LargeStat({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-850">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-extrabold text-navy-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
