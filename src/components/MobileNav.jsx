import { FiActivity, FiCalendar, FiGrid, FiUser } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const links = [
  {
    label: "Home",
    path: "/dashboard",
    icon: FiGrid,
  },
  {
    label: "Auctions",
    path: "/auctions",
    icon: FiCalendar,
  },
  {
    label: "Live",
    path: "/live-auctions",
    icon: FiActivity,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: FiUser,
  },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-navy-700 dark:bg-navy-900/95 lg:hidden">
      <div className="grid grid-cols-4">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  isActive
                    ? "text-cyan-500"
                    : "text-gray-500 dark:text-gray-400"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
