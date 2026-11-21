import axios from "axios";

// Public endpoints (no login). A separate client is used on purpose: the shared
// one adds the auth token and logs the user out on a 401, neither of which is
// wanted for the public live screen.
const apiUrl = import.meta.env.VITE_API_URL;
const publicApi = axios.create({
  baseURL: apiUrl || "http://localhost:5000",
  timeout: 15000,
});

export const getPublicLiveAuctions = async () =>
  (await publicApi.get("/api/public/live")).data;

export const getPublicLiveState = async (auctionId) =>
  (await publicApi.get(`/api/public/live/${auctionId}`)).data;
