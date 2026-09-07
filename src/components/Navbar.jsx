import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-cyan-500"
        : "text-gray-600 hover:text-cyan-500 dark:text-gray-300 dark:hover:text-cyan-400"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-navy-700 dark:bg-navy-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-navy-950 dark:text-white">Auction</span>
          <span className="text-cyan-500">Pro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/auctions" className={navLinkClass}>
            Auctions
          </NavLink>

          <NavLink to="/live-auctions" className={navLinkClass}>
            Live Auctions
          </NavLink>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="rounded-lg p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-cyan-500 dark:text-gray-300 dark:hover:bg-navy-800 dark:hover:text-cyan-400"
          >
            {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-navy-800"
              >
                <FiUser size={18} />
                <span>{user?.name || "Profile"}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-500 hover:text-red-500 dark:border-navy-700 dark:text-gray-200"
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:text-cyan-500 dark:text-gray-200"
              >
                <FiLogIn size={17} />
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-gray-600 dark:text-gray-300"
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-gray-700 dark:text-gray-200"
          >
            {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-5 dark:border-navy-700 dark:bg-navy-950 md:hidden">
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              <span className="block rounded-lg px-3 py-3 hover:bg-gray-100 dark:hover:bg-navy-800">
                Home
              </span>
            </NavLink>

            <NavLink
              to="/auctions"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              <span className="block rounded-lg px-3 py-3 hover:bg-gray-100 dark:hover:bg-navy-800">
                Auctions
              </span>
            </NavLink>

            <NavLink
              to="/live-auctions"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              <span className="block rounded-lg px-3 py-3 hover:bg-gray-100 dark:hover:bg-navy-800">
                Live Auctions
              </span>
            </NavLink>

            <div className="my-2 border-t border-gray-200 dark:border-navy-700" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-navy-800"
                >
                  <span className="flex items-center gap-2">
                    <FiUser />
                    {user?.name || "Profile"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-navy-800"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
