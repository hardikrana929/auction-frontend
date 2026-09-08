import { Link, NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

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

  const closeMobileMenu = () => {
    setMobileOpen(false);
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
        {/* =====================================================
            LOGO
        ====================================================== */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-1 font-display text-2xl font-bold tracking-tight"
        >
          <span className="text-navy-950 dark:text-white">Auction</span>

          <span className="text-cyan-500">Pro</span>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
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

        {/* =====================================================
            DESKTOP ACTIONS
        ====================================================== */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-cyan-500
              dark:text-gray-300
              dark:hover:bg-navy-800
              dark:hover:text-cyan-400
            "
          >
            {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>

          {/* =================================================
              NOTIFICATION BELL
              ONLY VISIBLE WHEN USER IS LOGGED IN
          ================================================== */}
          {isAuthenticated && (
            <div className="relative z-[60]">
              <NotificationBell />
            </div>
          )}

          {/* =================================================
              AUTHENTICATED USER
          ================================================== */}
          {isAuthenticated ? (
            <>
              {/* Profile */}
              <Link
                to="/profile"
                className="
                  flex items-center gap-2
                  rounded-xl
                  px-3 py-2
                  text-sm font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-100
                  dark:text-gray-200
                  dark:hover:bg-navy-800
                "
              >
                <FiUser size={18} />

                <span className="max-w-[120px] truncate">
                  {user?.name || "Profile"}
                </span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex items-center gap-2
                  rounded-xl
                  border border-gray-300
                  px-4 py-2
                  text-sm font-semibold
                  text-gray-700
                  transition
                  hover:border-red-500
                  hover:text-red-500
                  dark:border-navy-700
                  dark:text-gray-200
                  dark:hover:border-red-500
                  dark:hover:text-red-400
                "
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="
                  flex items-center gap-2
                  rounded-xl
                  px-4 py-2
                  text-sm font-semibold
                  text-gray-700
                  transition
                  hover:text-cyan-500
                  dark:text-gray-200
                  dark:hover:text-cyan-400
                "
              >
                <FiLogIn size={17} />
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="
                  rounded-xl
                  bg-cyan-500
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  transition
                  hover:bg-cyan-400
                "
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* =====================================================
            MOBILE ACTIONS
        ====================================================== */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-cyan-500
              dark:text-gray-300
              dark:hover:bg-navy-800
              dark:hover:text-cyan-400
            "
          >
            {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* =================================================
              MOBILE NOTIFICATION
              ONLY VISIBLE WHEN LOGGED IN
          ================================================== */}
          {isAuthenticated && (
            <div className="relative z-[60]">
              <NotificationBell />
            </div>
          )}

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              text-gray-700
              transition
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-navy-800
            "
          >
            {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>
      </div>

      {/* =======================================================
          MOBILE MENU
      ======================================================== */}
      {mobileOpen && (
        <div
          className="
            border-t
            border-gray-200
            bg-white
            px-4 py-5
            shadow-lg
            dark:border-navy-700
            dark:bg-navy-950
            md:hidden
          "
        >
          <nav className="flex flex-col gap-1">
            {/* Home */}
            <NavLink to="/" onClick={closeMobileMenu} className={navLinkClass}>
              <span
                className="
                  block rounded-xl
                  px-3 py-3
                  hover:bg-gray-100
                  dark:hover:bg-navy-800
                "
              >
                Home
              </span>
            </NavLink>

            {/* Auctions */}
            <NavLink
              to="/auctions"
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              <span
                className="
                  block rounded-xl
                  px-3 py-3
                  hover:bg-gray-100
                  dark:hover:bg-navy-800
                "
              >
                Auctions
              </span>
            </NavLink>

            {/* Live Auctions */}
            <NavLink
              to="/live-auctions"
              onClick={closeMobileMenu}
              className={navLinkClass}
            >
              <span
                className="
                  block rounded-xl
                  px-3 py-3
                  hover:bg-gray-100
                  dark:hover:bg-navy-800
                "
              >
                Live Auctions
              </span>
            </NavLink>

            <div className="my-3 border-t border-gray-200 dark:border-navy-700" />

            {/* =================================================
                LOGGED-IN MOBILE MENU
            ================================================== */}
            {isAuthenticated ? (
              <>
                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="
                    flex items-center gap-3
                    rounded-xl
                    px-3 py-3
                    text-sm font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                    dark:text-gray-200
                    dark:hover:bg-navy-800
                  "
                >
                  <FiUser size={18} />

                  <span>{user?.name || "Profile"}</span>
                </Link>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="
                    flex w-full items-center gap-3
                    rounded-xl
                    px-3 py-3
                    text-left
                    text-sm font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                    dark:text-gray-200
                    dark:hover:bg-navy-800
                  "
                >
                  <span className="text-cyan-500">🔔</span>

                  <span>Notifications</span>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex w-full items-center gap-3
                    rounded-xl
                    px-3 py-3
                    text-left
                    text-sm font-medium
                    text-red-500
                    transition
                    hover:bg-red-50
                    dark:hover:bg-red-950/20
                  "
                >
                  <FiLogOut size={18} />

                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="
                    flex items-center gap-3
                    rounded-xl
                    px-3 py-3
                    text-sm font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-100
                    dark:text-gray-200
                    dark:hover:bg-navy-800
                  "
                >
                  <FiLogIn size={18} />

                  <span>Login</span>
                </Link>

                {/* Register */}
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="
                    mt-1
                    rounded-xl
                    bg-cyan-500
                    px-4 py-3
                    text-center
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-cyan-400
                  "
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
