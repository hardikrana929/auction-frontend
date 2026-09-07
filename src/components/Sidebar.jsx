import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
  FiUser,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const commonLinks = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FiGrid,
  },
  {
    label: "Auctions",
    path: "/auctions",
    icon: FiCalendar,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: FiUser,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
];

const userLinks = [
  {
    label: "My Registrations",
    path: "/registrations",
    icon: FiClock,
  },
  {
    label: "Live Auctions",
    path: "/live-auctions",
    icon: FiActivity,
  },
  {
    label: "Auction History",
    path: "/auction-history",
    icon: FiBarChart2,
  },
];

const adminLinks = [
  {
    label: "Teams",
    path: "/admin/teams",
    icon: FiUsers,
  },
  {
    label: "Players",
    path: "/admin/players",
    icon: FiUser,
  },
  {
    label: "Registrations",
    path: "/admin/registrations",
    icon: FiShield,
  },
  {
    label: "Statistics",
    path: "/admin/statistics",
    icon: FiBarChart2,
  },
];

export default function Sidebar({ onNavigate }) {
  const { isAdmin } = useAuth();
  const links = [...commonLinks, ...(isAdmin ? adminLinks : userLinks)];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white dark:border-navy-700 dark:bg-navy-900 lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Navigation
          </p>

          <div className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-navy-950 dark:text-gray-300 dark:hover:bg-navy-800 dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-navy-700">
          <div
            className="
              rounded-xl
              border border-gray-200
              bg-white
              p-4
              shadow-sm
              dark:border-navy-700
              dark:bg-navy-950
            "
          >
            <p className="text-sm font-semibold text-navy-950 dark:text-white">
              AuctionPro
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
              Professional cricket auction management platform.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
