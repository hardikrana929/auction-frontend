import { createContext, useContext, useEffect, useMemo, useState } from "react";
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("auctionpro_theme") || "light");
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem("auctionpro_theme", theme); }, [theme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme: () => setTheme(t => t === "dark" ? "light" : "dark") }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => { const c=useContext(ThemeContext); if(!c) throw new Error("useTheme must be used inside ThemeProvider"); return c; };
