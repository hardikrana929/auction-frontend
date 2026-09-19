import api from "./axios";

/*
 * Check current user's access to an auction.
 */
export const checkAuctionAccess = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/auction-access/${auctionId}/check`,
    );

    return response.data;
};

/*
 * Alias.
 */
export const getAuctionAccess = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/auction-access/${auctionId}/check`,
    );

    return response.data;
};

/*
 * Get auction participants.
 */
export const getAuctionParticipants = async (auctionId) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/auction-access/${auctionId}/participants`,
    );

    return response.data;
};

/*
 * Check access for a specific team.
 */
export const checkTeamAuctionAccess = async (
    auctionId,
    teamId,
) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    if (!teamId) {
        throw new Error("Team ID is required.");
    }

    const response = await api.get(
        `/api/auction-access/${auctionId}/team/${teamId}`,
    );

    return response.data;
};

/*
 * Verify access for a specific team.
 */
export const verifyTeamAuctionAccess = async (
    auctionId,
    teamId,
) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    if (!teamId) {
        throw new Error("Team ID is required.");
    }

    const response = await api.get(
        `/api/auction-access/${auctionId}/team/${teamId}/verify`,
    );

    return response.data;
};