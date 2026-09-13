import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

/**
 * Without this, an uncaught render error in ANY page (a null/undefined field,
 * an unexpected API response shape, etc.) unmounts the entire React tree.
 * The screen goes blank, and since React itself is gone, the browser's
 * back/forward buttons only change the URL — nothing re-renders.
 *
 * This boundary catches errors from its children and shows a recoverable
 * screen instead. App.jsx re-keys it by route, so navigating to a different
 * page automatically clears a crash and gives that page a fresh mount.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error in page:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-[60vh] place-items-center p-6">
          <div className="surface-card max-w-md p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-500/10 text-red-500">
              <FiAlertTriangle size={26} />
            </div>
            <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This page ran into an unexpected error. You can try again, or go back to the dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button onClick={() => window.location.reload()} className="primary-btn">
                <FiRefreshCw /> Reload page
              </button>
              <a href="/dashboard" className="secondary-btn">
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
