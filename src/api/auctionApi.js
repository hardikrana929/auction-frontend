import api from "./axios";

export const getAuctions = async () => (await api.get("/api/auctions")).data;
export const getAuction = async (id) => (await api.get(`/api/auctions/${id}`)).data;
// Alias kept for pages that import getAuctionById — same endpoint as getAuction.
export const getAuctionById = getAuction;

// Auctions are created/updated with an optional image FILE now, so these
// go through multipart/form-data (same pattern as teamApi.js / playerApi.js)
// instead of a plain JSON payload.
export const createAuction = async (formData) =>
    (await api.post("/api/auctions", formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
export const updateAuction = async (id, formData) =>
    (await api.put(`/api/auctions/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data;

export const updateAuctionStatus = async (id, status) => (await api.patch(`/api/auctions/${id}/status`, { status })).data;
export const deleteAuction = async (id) => (await api.delete(`/api/auctions/${id}`)).data;