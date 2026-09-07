import { FiCheckCircle, FiMail, FiShield, FiUser } from "react-icons/fi";

import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/PageLoader";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            Your authenticated user information could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const name = user.name || user.fullName || user.username || "User";

  const email = user.email || "—";

  const role = user.role || "user";

  const userId = user._id || user.id || "—";

  const accountStatus = user.isActive === false ? "Inactive" : "Active";

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-cyan-500">Account</p>

        <h1 className="mt-1 text-3xl font-bold text-navy-950 dark:text-white">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View your AuctionPro account information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-900">
        {/* Profile header */}
        <div className="border-b border-gray-200 bg-gray-50 p-6 dark:border-navy-700 dark:bg-navy-850">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-3xl font-bold text-white shadow-lg">
              {name.charAt(0).toUpperCase()}
            </div>

            {/* User name */}
            <div>
              <h2 className="text-2xl font-bold text-navy-950 dark:text-white">
                {name}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiMail className="h-4 w-4" />
                <span>{email}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold capitalize text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400">
                  <FiShield className="h-3.5 w-3.5" />
                  {role}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isActive === false
                      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  }`}
                >
                  <FiCheckCircle className="h-3.5 w-3.5" />

                  {accountStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <FiUser className="h-5 w-5 text-cyan-500" />

            <h3 className="text-lg font-bold text-navy-950 dark:text-white">
              Account Details
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Full Name" value={name} />

            <ProfileField label="Email Address" value={email} />

            <ProfileField label="Role" value={role} capitalize />

            <ProfileField label="Account Status" value={accountStatus} />

            <ProfileField label="User ID" value={userId} />

            <ProfileField label="Member Since" value={createdAt} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, capitalize = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-850">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p
        className={`mt-2 break-all text-sm font-semibold text-navy-950 dark:text-white ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
