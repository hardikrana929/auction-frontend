import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiRadio,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/auctions", label: "Auctions", icon: FiCalendar ?? FiActivity },
  { to: "/live-auctions", label: "Live Auctions", icon: FiRadio },
  { to: "/notifications", label: "Notifications", icon: FiBell },
  { to: "/statistics", label: "Statistics", icon: FiBarChart2 },
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin
    ? [
        ...baseLinks,
        { to: "/admin/auctions", label: "Auction Management", icon: FiLayers },
        { to: "/admin/teams", label: "Team Management", icon: FiUsers },
        { to: "/admin/players", label: "Player Management", icon: FiUserCheck },
        { to: "/admin/registrations", label: "Registrations", icon: FiShield },
        {
          to: "/admin/auction-control",
          label: "Auction Control",
          icon: FiTrendingUp,
        },
      ]
    : baseLinks;

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ==================================================
          SIDEBAR
          flex flex-col + h-full turns this into a real
          layout: header/footer stay fixed-size (shrink-0),
          nav takes remaining space and scrolls internally
          (flex-1 min-h-0 overflow-y-auto). This is what was
          missing — nav had no height limit before, so it
          just overflowed past the screen and got covered by
          the absolutely-positioned footer.
      ================================================== */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 transform flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : ""}`}
      >
        {/* HEADER — shrink-0 keeps it pinned at top */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div
            className={`flex items-center gap-3 overflow-hidden ${
              collapsed ? "lg:w-full lg:justify-center" : ""
            }`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <FiActivity />
            </span>
            {!collapsed && (
              <span className="text-lg font-black">AuctionPro</span>
            )}
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* NAV — flex-1 min-h-0 overflow-y-auto = scrolls internally
            instead of overflowing the sidebar */}
        <nav
          className="
            flex-1 min-h-0 space-y-1 overflow-y-auto p-3

            [scrollbar-width:thin]
            [scrollbar-color:theme(colors.slate.300)_transparent]
            dark:[scrollbar-color:theme(colors.slate.700)_transparent]
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-700
          "
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                } ${collapsed ? "lg:justify-center" : ""}`
              }
            >
              <Icon className="shrink-0 text-lg" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER — shrink-0, no longer absolute. Flex now
            guarantees it always sits below the nav, visible,
            never overlapped. */}
        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            onClick={doLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <FiLogOut />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <div
        className={`${collapsed ? "lg:pl-20" : "lg:pl-72"} min-h-screen transition-all`}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <FiMenu className="text-xl" />
            </button>
            <button
              className="hidden rounded-lg p-2 hover:bg-slate-100 lg:block dark:hover:bg-slate-800"
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
            <div>
              <p className="text-sm font-black">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Professional cricket auction management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <div className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700 sm:block">
              {user?.role || "user"}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
