import api from "./axios";

// Start auction
export const startAuction = async ({ auctionId }) => {
    const response = await api.post(
        "/api/auction-control/start",
        { auctionId }
    );

    return response.data;
};
// Pause auction
export const pauseAuction = async (auctionId) => {
    const response = await api.post(
        "/api/auction-control/pause",
        {
            auctionId,
        }
    );

    return response.data;
};

// Resume auction
export const resumeAuction = async (auctionId) => {
    const response = await api.post(
        "/api/auction-control/resume",
        {
            auctionId,
        }
    );

    return response.data;
};

// Get auction session
export const getAuctionSession = async (auctionId) => {
    const response = await api.get(
        `/api/auction-control/session/${auctionId}`
    );

    return response.data;
};

// Start next player
export const startNextPlayer = async ({ auctionId }) => {
    const response = await api.post(
        "/api/auction-control/next-player",
        { auctionId }
    );

    return response.data;
};

// Complete current player
export const completePlayer = async (auctionId) => {
    const response = await api.post(
        "/api/auction-control/complete-player",
        {
            auctionId,
        }
    );

    return response.data;
};

// Complete auction
export const completeAuction = async (auctionId) => {
    const response = await api.post(
        "/api/auction-control/complete",
        {
            auctionId,
        }
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