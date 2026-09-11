import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUserProfile, loginUser, registerUser } from "../api/authApi";

const AuthContext = createContext(null);
const TOKEN_KEY = "auctionpro_token";
const USER_KEY = "auctionpro_user";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readUser);
  const [loading, setLoading] = useState(true);

  const persistAuth = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    persistAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    persistAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await getUserProfile();
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  };

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        if (mounted) logout();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
