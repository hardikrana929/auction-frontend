import api from "./axios";

export const getAuctions = async () => (await api.get("/api/auctions")).data;
export const getAuction = async (id) => (await api.get(`/api/auctions/${id}`)).data;
export const createAuction = async (payload) => (await api.post("/api/auctions", payload)).data;
export const updateAuction = async (id, payload) => (await api.put(`/api/auctions/${id}`, payload)).data;
export const updateAuctionStatus = async (id, status) => (await api.patch(`/api/auctions/${id}/status`, { status })).data;
export const deleteAuction = async (id) => (await api.delete(`/api/auctions/${id}`)).data;
