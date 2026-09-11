import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ compact=false }) {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${compact ? "size-10" : "gap-2 px-3 py-2 text-sm font-semibold"}`}>{theme === "dark" ? <FiSun /> : <FiMoon />}{!compact && <span>{theme === "dark" ? "Light" : "Dark"}</span>}</button>;
}
