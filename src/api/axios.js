import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
if (import.meta.env.PROD && !apiUrl)
  throw new Error("VITE_API_URL must be configured for production builds.");

const baseURL = apiUrl || "http://localhost:5000";
const TOKEN_KEY = "auctionpro_token";
const USER_KEY = "auctionpro_user";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/*
 * Staying logged in.
 * When the server answers 401 (token expired), the old token is swapped for a
 * fresh one through POST /api/auth/refresh and the original request is
 * repeated, so people are not sent to the login page every time their token
 * runs out. Only if the refresh itself is refused (logged out elsewhere,
 * account disabled, too long ago) is the user logged out.
 * Several requests failing at once share ONE refresh call.
 */
const NO_REFRESH_URLS = ["/api/auth/login", "/api/auth/auction-login", "/api/auth/refresh"];
let refreshing = null;

const forceLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth:logout"));
};

const refreshToken = () => {
  if (!refreshing) {
    const oldToken = localStorage.getItem(TOKEN_KEY);
    // A bare axios call: no interceptors, so a failed refresh cannot loop.
    refreshing = axios
      .post(`${baseURL}/api/auth/refresh`, { token: oldToken }, { timeout: 15000 })
      .then(({ data }) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent("auth:token", { detail: data }));
        return data.token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const hasToken = Boolean(localStorage.getItem(TOKEN_KEY));
    const skip = NO_REFRESH_URLS.some((url) => original?.url?.includes(url));

    if (status === 401 && original && hasToken && !skip && !original._retried) {
      original._retried = true;
      try {
        const token = await refreshToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        // Only an explicit refusal ends the session. A network error while
        // refreshing (server asleep, offline) must not log anyone out.
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          forceLogout();
        }
        return Promise.reject(error);
      }
    }

    if (status === 401 && !skip && !hasToken) forceLogout();
    return Promise.reject(error);
  },
);

export default api;
