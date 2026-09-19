import api from "./axios";

export const startAuction = async (data) => {
    const response = await api.post(
        "/api/auction-control/start",
        data
    );

    return response.data;
};

export const pauseAuction = async (data) => {
    const response = await api.post(
        "/api/auction-control/pause",
        data
    );

    return response.data;
};

export const resumeAuction = async (data) => {
    const response = await api.post(
        "/api/auction-control/resume",
        data
    );

    return response.data;
};

export const getAuctionSession = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/auction-control/session/${auctionId}`
    );

    return response.data;
};

export const startNextPlayer = async (data) => {
    const response = await api.post(
        "/api/auction-control/next-player",
        data
    );

    return response.data;
};

export const completeCurrentPlayer = async (data) => {
    const response = await api.post(
        "/api/auction-control/complete-player",
        data
    );

    return response.data;
};

export const completeAuction = async (data) => {
    const response = await api.post(
        "/api/auction-control/complete",
        data
    );

    return response.data;
};

export default {
    startAuction,
    pauseAuction,
    resumeAuction,
    getAuctionSession,
    startNextPlayer,
    completeCurrentPlayer,
    completeAuction,
};