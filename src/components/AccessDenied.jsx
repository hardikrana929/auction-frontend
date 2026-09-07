import { FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";


export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch-50 px-6 dark:bg-navy-950">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <FiShield size={30} />
        </div>

        <h1 className="font-display text-3xl font-bold text-navy-950 dark:text-white">
          Access Denied
        </h1>

        <p className="mt-3 text-gray-600 dark:text-gray-400">
          You do not have permission to access this page.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-white transition hover:bg-cyan-400"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
