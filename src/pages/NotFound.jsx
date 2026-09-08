import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiHome, FiSearch } from "react-icons/fi";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full text-center">
          {/* 404 */}
          <div className="relative mb-8">
            <p className="select-none text-[120px] font-black leading-none tracking-tight text-slate-200 sm:text-[180px]">
              404
            </p>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-lg shadow-slate-900/5">
                <span className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
                  Page Not Found
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <FiSearch className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              We couldn't find that page
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              The page you're looking for may have been removed, renamed, or the
              URL may be incorrect.
            </p>

            {/* Current URL */}
            <div className="mx-auto mt-5 max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="truncate text-xs font-medium text-slate-400">
                {location.pathname}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
              >
                <FiHome className="h-4 w-4" />
                Go to Dashboard
              </Link>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>
          </div>

          {/* Branding */}
          <div className="mt-12">
            <p className="text-sm font-bold tracking-wide text-slate-900">
              Auction<span className="text-blue-600">Pro</span>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Professional Auction Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
