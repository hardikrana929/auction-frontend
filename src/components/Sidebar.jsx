import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiGrid,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { NavLink, useLocation } from "react-router-dom";

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
    label: "Live Auctions",
    path: "/live-auctions",
    icon: FiActivity,
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
];

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) => `
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-sm
        font-medium
        transition
        duration-200
        ${
          isActive
            ? `
              bg-cyan-500/10
              text-cyan-600
              dark:bg-cyan-500/10
              dark:text-cyan-400
            `
            : `
              text-gray-600
              hover:bg-gray-100
              hover:text-navy-950
              dark:text-gray-300
              dark:hover:bg-navy-800
              dark:hover:text-white
            `
        }
      `}
    >
      <Icon size={19} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  /*
   * Get auction ID from URLs such as:
   *
   * /auctions/123
   * /auctions/123/register
   * /live-auctions/123
   * /admin/auctions/123/control
   * /admin/auctions/123/statistics
   * /admin/auctions/123/history
   */

  const auctionId =
    location.pathname.match(/^\/admin\/auctions\/([^/]+)/)?.[1] ||
    location.pathname.match(/^\/live-auctions\/([^/]+)/)?.[1] ||
    location.pathname.match(/^\/auctions\/([^/]+)/)?.[1];

  const adminAuctionLinks = auctionId
    ? [
        {
          label: "Auction Control",
          path: `/admin/auctions/${auctionId}/control`,
          icon: FiActivity,
        },
        {
          label: "Statistics",
          path: `/admin/auctions/${auctionId}/statistics`,
          icon: FiBarChart2,
        },
        {
          label: "Auction History",
          path: `/admin/auctions/${auctionId}/history`,
          icon: FiBarChart2,
        },
      ]
    : [];

  /*
   * Main navigation.
   *
   * Admin:
   * Dashboard
   * Auctions
   * Profile
   * Settings
   * Teams
   * Players
   * Registrations
   *
   * User:
   * Dashboard
   * Auctions
   * Profile
   * Settings
   * Live Auctions
   */

  const links = [...commonLinks, ...(isAdmin ? adminLinks : userLinks)];

  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        border-r
        border-gray-200
        bg-white
        dark:border-navy-700
        dark:bg-navy-900
        lg:block
      "
    >
      <div
        className="
          sticky
          top-16
          flex
          h-[calc(100vh-4rem)]
          flex-col
        "
      >
        {/* ================================
            MAIN NAVIGATION
        ================================= */}

        <nav className="flex-1 overflow-y-auto p-4">
          <p
            className="
              mb-3
              px-3
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            Navigation
          </p>

          <div className="space-y-1">
            {links.map((item) => (
              <SidebarLink
                key={item.path}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* ================================
              CURRENT AUCTION
          ================================= */}

          {isAdmin && auctionId && (
            <div className="mt-7">
              <p
                className="
                  mb-3
                  px-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-gray-400
                "
              >
                Current Auction
              </p>

              <div className="space-y-1">
                {adminAuctionLinks.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* ================================
            SIDEBAR FOOTER
        ================================= */}

        <div
          className="
            border-t
            border-gray-200
            p-4
            dark:border-navy-700
          "
        >
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              dark:border-navy-700
              dark:bg-navy-950
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-cyan-500/10
                  text-cyan-500
                "
              >
                <FiActivity size={17} />
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-navy-950
                  dark:text-white
                "
              >
                AuctionPro
              </p>
            </div>

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-gray-600
                dark:text-gray-400
              "
            >
              Professional cricket auction management platform.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
