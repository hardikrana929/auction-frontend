import api from "./axios";

/*
 * Start auction
 *
 * Backend:
 * POST /api/auction-control/start
 */
export const startAuction = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/start",
        {
            auctionId,
        }
    );

    return response.data;
};

/*
 * Pause auction
 *
 * Backend:
 * POST /api/auction-control/pause
 */
export const pauseAuction = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/pause",
        {
            auctionId,
        }
    );

    return response.data;
};

/*
 * Resume auction
 *
 * Backend:
 * POST /api/auction-control/resume
 */
export const resumeAuction = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/resume",
        {
            auctionId,
        }
    );

    return response.data;
};

/*
 * Get auction session
 *
 * Backend:
 * GET /api/auction-control/session/:auctionId
 */
export const getAuctionSession = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.get(
        `/api/auction-control/session/${auctionId}`
    );

    return response.data;
};

/*
 * Start next player
 *
 * Backend:
 * POST /api/auction-control/next-player
 */
export const startNextPlayer = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/next-player",
        {
            auctionId,
        }
    );

    return response.data;
};

/*
 * Complete current player session
 *
 * IMPORTANT:
 * This does NOT sell the player.
 *
 * Selling/unsold is handled by bidding API.
 *
 * Backend:
 * POST /api/auction-control/complete-player
 */
export const completeCurrentPlayer = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/complete-player",
        {
            auctionId,
        }
    );

    return response.data;
};

/*
 * Complete entire auction
 *
 * Backend:
 * POST /api/auction-control/complete
 */
export const completeAuction = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required");
    }

    const response = await api.post(
        "/api/auction-control/complete",
        {
            auctionId,
        }
    );

    return response.data;
};