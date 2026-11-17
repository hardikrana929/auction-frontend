import axios from "axios";
import api from "./axios";

/* ---------- Organiser side (logged in: admin / assigned auction manager) ---------- */

export const getRegistrationLink = async (auctionId) =>
  (await api.get(`/api/players/registration-link/${auctionId}`)).data;

export const generateRegistrationLink = async (auctionId, regenerate = false) =>
  (await api.post(`/api/players/registration-link/${auctionId}`, { regenerate }))
    .data;

export const setRegistrationOpen = async (auctionId, open) =>
  (await api.patch(`/api/players/registration-link/${auctionId}`, { open })).data;

export const disableRegistrationLink = async (auctionId) =>
  (await api.delete(`/api/players/registration-link/${auctionId}`)).data;

/** Auctions the logged-in user may browse players for (Players tab). */
export const getMyPlayerAuctions = async () =>
  (await api.get("/api/players/my-auctions")).data;

/* ---------- Public side (NO login, no auth header, never logs the user out) ---------- */

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const publicClient = axios.create({ baseURL: apiUrl, timeout: 30000 });

export const getPublicRegistration = async (token) =>
  (await publicClient.get(`/api/public/player-registration/${encodeURIComponent(token)}`))
    .data;

export const submitPublicRegistration = async (token, formData) =>
  (
    await publicClient.post(
      `/api/public/player-registration/${encodeURIComponent(token)}`,
      formData,
    )
  ).data;

/** Full URL a player opens. Built from the current site so it works on any deployment. */
export const buildRegistrationUrl = (token) =>
  `${window.location.origin}/player-registration/${token}`;
