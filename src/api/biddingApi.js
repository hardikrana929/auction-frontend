import api from "./axios";

/*
 * Get the player currently being auctioned.
 *
 * Backend:
 * GET /api/bidding/current/:auctionId
 */
export const getCurrentBid = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.get(
        `/api/bidding/current/${auctionId}`
    );

    return response.data;
};

/*
 * Place bid
 *
 * Backend expects:
 *
 * {
 *   auctionId,
 *   playerId,
 *   teamId,
 *   amount
 * }
 */
export const placeBid = async ({
    auctionId,
    playerId,
    teamId,
    amount,
}) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    if (!playerId) {
        throw new Error("Player ID is required");
    }

    if (!teamId) {
        throw new Error("Team ID is required");
    }

    if (amount === undefined || amount === null) {
        throw new Error("Bid amount is required");
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Bid amount must be greater than 0");
    }

    const response = await api.post(
        "/api/bidding/bid",
        {
            auctionId,
            playerId,
            teamId,
            amount: numericAmount,
        }
    );

    return response.data;
};

/*
 * Start player auction
 *
 * ADMIN ONLY
 *
 * Backend:
 * POST /api/bidding/start
 */
export const startBidding = async ({
    auctionId,
    playerId,
}) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    if (!playerId) {
        throw new Error("Player ID is required");
    }

    const response = await api.post(
        "/api/bidding/start",
        {
            auctionId,
            playerId,
        }
    );

    return response.data;
};

/*
 * Sell current player
 *
 * ADMIN ONLY
 */
export const sellPlayer = async ({
    auctionId,
    playerId,
}) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    if (!playerId) {
        throw new Error("Player ID is required");
    }

    const response = await api.post(
        "/api/bidding/sell",
        {
            auctionId,
            playerId,
        }
    );

    return response.data;
};

/*
 * Mark player unsold
 *
 * ADMIN ONLY
 */
export const markPlayerUnsold = async ({
    auctionId,
    playerId,
}) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    if (!playerId) {
        throw new Error("Player ID is required");
    }

    const response = await api.post(
        "/api/bidding/unsold",
        {
            auctionId,
            playerId,
        }
    );

    return response.data;
};

/*
 * Get bid history
 *
 * Backend:
 * GET /api/bidding/history/:playerId
 */
export const getBidHistory = async (playerId) => {
    if (!playerId) {
        throw new Error("Player ID is required");
    }

    const response = await api.get(
        `/api/bidding/history/${playerId}`
    );

    return response.data;
};