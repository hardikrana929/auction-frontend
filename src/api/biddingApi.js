import api from "./axios";

/*
 * Get the player currently being auctioned.
 */
export const getCurrentBid = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/bidding/current/${auctionId}`
    );

    return response.data;
};

/*
 * Place a bid.
 *
 * Backend:
 * POST /api/bidding/bid
 */
export const placeBid = async (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Bid data is required.");
    }

    const response = await api.post(
        "/api/bidding/bid",
        data
    );

    return response.data;
};

/*
 * Admin starts bidding for a player.
 *
 * Backend:
 * POST /api/bidding/start
 */
export const startBidding = async (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Bidding start data is required.");
    }

    const response = await api.post(
        "/api/bidding/start",
        data
    );

    return response.data;
};

/*
 * Admin sells current player.
 *
 * Backend:
 * POST /api/bidding/sell
 */
export const sellPlayer = async (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Sell data is required.");
    }

    const response = await api.post(
        "/api/bidding/sell",
        data
    );

    return response.data;
};

/*
 * Admin marks current player unsold.
 *
 * Backend:
 * POST /api/bidding/unsold
 */
export const markPlayerUnsold = async (data) => {
    if (!data || typeof data !== "object") {
        throw new Error("Unsold data is required.");
    }

    const response = await api.post(
        "/api/bidding/unsold",
        data
    );

    return response.data;
};

/*
 * Get bid history for a player.
 *
 * Backend:
 * GET /api/bidding/history/:playerId
 */
export const getBidHistory = async (playerId) => {
    if (!playerId) {
        throw new Error("Player ID is required.");
    }

    const response = await api.get(
        `/api/bidding/history/${playerId}`
    );

    return response.data;
};

export default {
    getCurrentBid,
    placeBid,
    startBidding,
    sellPlayer,
    markPlayerUnsold,
    getBidHistory,
};