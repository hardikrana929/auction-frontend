import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/55 backdrop-blur-xl text-slate-700 shadow-xl shadow-slate-900/[0.06] dark:shadow-black/30 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:bg-slate-800 ${compact ? "size-10" : "gap-2 px-3 py-2 text-sm font-semibold"}`}
    >
      {theme === "dark" ? <FiSun /> : <FiMoon />}
      {!compact && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
    </button>
  );
}
