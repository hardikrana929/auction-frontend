import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentUser, loginUser, registerUser } from "../api/authApi";

import { STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    sessionStorage.getItem(STORAGE_KEYS.TOKEN),
  );

  const [loading, setLoading] = useState(true);

  /*
   * Save authentication session
   */
  const saveSession = useCallback((authToken, authUser = null) => {
    if (authToken) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
      setToken(authToken);
    }

    if (authUser) {
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));

      setUser(authUser);
    }
  }, []);

  /*
   * Clear authentication session
   */
  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);

    setToken(null);
    setUser(null);
  }, []);

  /*
   * Normalize /api/auth/me response
   *
   * We support the response shapes already used
   * by your frontend without changing the backend.
   */
  const extractUser = useCallback((response) => {
    if (!response) {
      return null;
    }

    // { user: {...} }
    if (response.user) {
      return response.user;
    }

    // { data: { user: {...} } }
    if (response.data?.user) {
      return response.data.user;
    }

    // { data: {...user fields...} }
    if (
      response.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    // Direct user object
    if (typeof response === "object" && !Array.isArray(response)) {
      return response;
    }

    return null;
  }, []);

  /*
   * Load authenticated user from backend
   */
  const loadCurrentUser = useCallback(
    async (authToken) => {
      if (!authToken) {
        return null;
      }

      const response = await getCurrentUser();

      console.log("AuctionPro /api/auth/me response:", response);

      const currentUser = extractUser(response);

      if (!currentUser) {
        throw new Error(
          "Authenticated user information was not returned by the server.",
        );
      }

      setUser(currentUser);

      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));

      return currentUser;
    },
    [extractUser],
  );

  /*
   * Login
   */
  const login = useCallback(
    async (credentials) => {
      const response = await loginUser(credentials);

      console.log("AuctionPro login response:", response);

      const authToken =
        response?.token ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      if (!authToken) {
        throw new Error(
          "Login succeeded but no authentication token was returned.",
        );
      }

      /*
       * Save token FIRST.
       *
       * This is important because /api/auth/me
       * uses the token from sessionStorage.
       */
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, authToken);

      setToken(authToken);

      /*
       * Try to get user directly from login response.
       */
      let authUser = response?.user || response?.data?.user || null;

      /*
       * If login does not return user information,
       * immediately call /api/auth/me.
       */
      if (!authUser) {
        authUser = await loadCurrentUser(authToken);
      } else {
        setUser(authUser);

        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      }

      return response;
    },
    [loadCurrentUser],
  );

  /*
   * Register
   */
  const register = useCallback(async (data) => {
    return registerUser(data);
  }, []);

  /*
   * Logout
   */
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /*
   * Restore session when application starts
   */
  const restoreSession = useCallback(async () => {
    const storedToken = sessionStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      setToken(storedToken);

      await loadCurrentUser(storedToken);
    } catch (error) {
      console.error("AuctionPro session restore failed:", error);

      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, loadCurrentUser]);

  /*
   * Run once when application starts
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,

      isAuthenticated: Boolean(token && user),

      isAdmin: user?.role === "admin",

      login,
      register,
      logout,
      restoreSession,
    }),
    [user, token, loading, login, register, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
