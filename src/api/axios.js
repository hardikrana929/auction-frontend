import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
if (import.meta.env.PROD && !apiUrl)
  throw new Error("VITE_API_URL must be configured for production builds.");
const api = axios.create({
  baseURL: apiUrl || "http://localhost:5000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auctionpro_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auctionpro_token");
      localStorage.removeItem("auctionpro_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  },
);
export default api;
