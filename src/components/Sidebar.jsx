import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiClock,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiRadio,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ============================================================
// COMMON LINKS
// ============================================================

const commonLinks = [
  { label: "Profile", path: "/profile", icon: FiUser },
  { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  { label: "Auctions", path: "/auctions", icon: FiCalendar },
  { label: "Notifications", path: "/notifications", icon: FiBell },
  { label: "Settings", path: "/settings", icon: FiSettings },
];

// ============================================================
// USER LINKS
// ============================================================

const userLinks = [
  { label: "Live Auctions", path: "/live-auctions", icon: FiRadio },
];

// ============================================================
// ADMIN LINKS
// ============================================================

const adminLinks = [
  { label: "Statistics", path: "/admin/statistics", icon: FiBarChart2 },
  {
    label: "Auction Management",
    path: "/admin/auction-management",
    icon: FiLayers,
  },
  { label: "Team Management", path: "/admin/teams", icon: FiUsers },
  { label: "Player Management", path: "/admin/players", icon: FiUserCheck },
  { label: "Registrations", path: "/admin/registrations", icon: FiShield },
];

// ============================================================
// SIDEBAR LINK COMPONENT
// ============================================================

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) => `
        flex items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium transition duration-200
        ${
          isActive
            ? `bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400`
            : `text-gray-600 hover:bg-gray-100 hover:text-navy-950
               dark:text-gray-300 dark:hover:bg-navy-800 dark:hover:text-white`
        }
      `}
    >
      <Icon size={19} />
      <span>{item.label}</span>
    </NavLink>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

export default function Sidebar({ onNavigate }) {
  const { isAdmin, logout } = useAuth();
  const location = useLocation();

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
          icon: FiTrendingUp,
        },
        {
          label: "Auction History",
          path: `/admin/auctions/${auctionId}/history`,
          icon: FiClock,
        },
      ]
    : [];

  const links = [...commonLinks, ...(isAdmin ? adminLinks : userLinks)];

  return (
    // FIXED to the viewport, not sticky inside a scrolling page.
    // This is what stops it from being pushed around by page content.
    <aside
      className="
        hidden lg:flex
        fixed left-0 top-0 z-40
        h-screen w-64
        flex-col
        border-r border-gray-200 bg-white
        dark:border-navy-700 dark:bg-navy-900
      "
    >
      {/* Spacer for your fixed header height (adjust h-16 to match) */}
      <div className="h-16 shrink-0" />

      {/* ==================================================
          SCROLLABLE NAV
          flex-1 + min-h-0 is the fix: without min-h-0 a flex
          child refuses to shrink below its content size, so
          overflow-y-auto never actually triggers and the
          footer gets shoved off-screen instead of the nav
          scrolling internally.
      ================================================== */}
      <nav
        className="
          flex-1 min-h-0 overflow-y-auto p-4
          [scrollbar-width:thin]
          [scrollbar-color:theme(colors.gray.300)_transparent]
          dark:[scrollbar-color:theme(colors.navy.700)_transparent]
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-thumb]:bg-navy-700
          [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
        "
      >
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </p>

        <div className="space-y-1">
          {links.map((item) => (
            <SidebarLink key={item.path} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        {isAdmin && auctionId && (
          <div className="mt-7">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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

      {/* ==================================================
          FOOTER — shrink-0 keeps it pinned at a fixed size,
          always visible below the scrollable nav.
      ================================================== */}
      <div className="shrink-0 border-t border-gray-200 p-4 dark:border-navy-700">
        <button
          onClick={logout}
          className="
            mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-medium text-red-500 transition duration-200
            hover:bg-red-500/10
          "
        >
          <FiLogOut size={19} />
          <span>Logout</span>
        </button>

        <div
          className="
            rounded-xl border border-gray-200 bg-white p-4 shadow-sm
            dark:border-navy-700 dark:bg-navy-950
          "
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
              <FiActivity size={17} />
            </div>
            <p className="text-sm font-semibold text-navy-950 dark:text-white">
              AuctionPro
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
            Professional cricket auction management platform.
          </p>
        </div>
      </div>
    </aside>
  );
}
