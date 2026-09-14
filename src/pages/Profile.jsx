import {
  FiCalendar,
  FiCheckCircle,
  FiHash,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";

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
  const isActive = user.isActive !== false;
  const accountStatus = isActive ? "Active" : "Inactive";

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-wide text-cyan-500">
          Account
        </p>
        <h1 className="mt-1 text-3xl font-bold text-navy-950 dark:text-white">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View your AuctionPro account information.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ============================================
            LEFT — Identity summary card
            NOTE: no overflow-hidden on this outer div —
            that was clipping the avatar in half. Only the
            banner itself clips now.
        ============================================ */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-900">
            {/* Gradient cover — overflow-hidden lives HERE only */}
            <div className="relative h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-navy-900">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
            </div>

            <div className="px-6 pb-6">
              {/* Floating avatar — relative + z-10 so it sits
                  cleanly above the banner instead of being cut */}
              <div className="relative z-10 -mt-12 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-cyan-500 text-3xl font-bold text-white shadow-lg dark:border-navy-900">
                  {name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-navy-950 dark:text-white">
                  {name}
                </h2>

                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <FiMail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold capitalize text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400">
                    <FiShield className="h-3.5 w-3.5" />
                    {role}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {accountStatus}
                  </span>
                </div>
              </div>

              {/* Quick meta */}
              <div className="mt-6 space-y-3 border-t border-gray-200 pt-5 dark:border-navy-700">
                <QuickMeta
                  icon={FiHash}
                  label="User ID"
                  value={userId}
                  truncateValue
                />
                <QuickMeta
                  icon={FiCalendar}
                  label="Member Since"
                  value={createdAt}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            RIGHT — Account details
        ============================================ */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">
            <div className="mb-6 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                <FiUser className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-navy-950 dark:text-white">
                  Account Details
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your personal and account information
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField icon={FiUser} label="Full Name" value={name} />
              <ProfileField icon={FiMail} label="Email Address" value={email} />
              <ProfileField
                icon={FiShield}
                label="Role"
                value={role}
                capitalize
              />
              <ProfileField
                icon={FiCheckCircle}
                label="Account Status"
                value={accountStatus}
                valueClassName={
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              />
              <ProfileField
                icon={FiHash}
                label="User ID"
                value={userId}
                truncate
              />
              <ProfileField
                icon={FiCalendar}
                label="Member Since"
                value={createdAt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickMeta({ icon: Icon, label, value, truncateValue = false }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex shrink-0 items-center gap-2 text-gray-500 dark:text-gray-400">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span
        title={truncateValue ? value : undefined}
        className={`min-w-0 pl-3 text-right font-semibold text-navy-950 dark:text-white ${
          truncateValue ? "truncate" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  capitalize = false,
  valueClassName = "",
  truncate = false,
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 dark:border-navy-700 dark:bg-navy-850">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-cyan-500 dark:text-gray-500" />
        {label}
      </div>

      <p
        title={truncate ? value : undefined}
        className={`mt-2 text-sm font-semibold text-navy-950 dark:text-white ${
          truncate ? "truncate" : "break-all"
        } ${capitalize ? "capitalize" : ""} ${valueClassName}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
