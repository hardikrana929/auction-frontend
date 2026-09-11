import { Link } from "react-router-dom";
import { FiActivity } from "react-icons/fi";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 dark:bg-black">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 lg:grid-cols-2">
        <section className="hidden bg-slate-100 p-10 dark:bg-slate-800 lg:flex lg:flex-col lg:justify-between">
          <Link to="/login" className="flex items-center gap-3 text-xl font-extrabold text-slate-950 dark:text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white"><FiActivity /></span>
            AuctionPro
          </Link>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Cricket Auction Platform</p>
            <h2 className="max-w-md text-4xl font-black leading-tight text-slate-950 dark:text-white">Manage auctions with confidence.</h2>
            <p className="mt-5 max-w-md text-slate-600 dark:text-slate-300">Secure authentication for administrators, teams and auction participants.</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">AuctionPro • Professional Auction Management</p>
        </section>
        <section className="flex items-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden"><Link to="/login" className="text-2xl font-black text-slate-950 dark:text-white">AuctionPro</Link></div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">{title}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
