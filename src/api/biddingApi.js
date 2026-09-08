import api from "./axios";

export const getCurrentBid = async (auctionId) =>
    (await api.get(`/api/bidding/current/${auctionId}`)).data;

export const placeBid = async (data) =>
    (await api.post("/api/bidding/bid", data)).data;

export const startBidding = async (data) =>
    (await api.post("/api/bidding/start", data)).data;

export const sellPlayer = async (data) =>
    (await api.post("/api/bidding/sell", data)).data;

export const markPlayerUnsold = async (data) =>
    (await api.post("/api/bidding/unsold", data)).data;

export const getBidHistory = async (playerId) => {
    const response = await api.get(
        `/api/bidding/history/${playerId}`
    );

    return response.data;
};