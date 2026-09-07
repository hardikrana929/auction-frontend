import api from "./axios";

/**
 * Validate whether an auction can be started
 */
export const validateAuctionStart = async (auctionId) =>
    (
        await api.get(`/api/auction-validation/start/${auctionId}`)
    ).data;

/**
 * Validate a specific player
 */
export const validatePlayer = async (playerId) =>
    (
        await api.get(`/api/auction-validation/player/${playerId}`)
    ).data;

/**
 * Validate whether a bid is allowed
 */
export const validateBid = async (data) =>
    (
        await api.post("/api/auction-validation/bid", data)
    ).data;

/**
 * Validate whether a team can buy a player
 */
export const validateTeamPlayer = async (teamId, playerId) =>
    (
        await api.get(
            `/api/auction-validation/team/${teamId}/player/${playerId}`
        )
    ).data;

/**
 * Validate auction completion
 */
export const validateAuctionCompletion = async (auctionId) =>
    (
        await api.get(
            `/api/auction-validation/completion/${auctionId}`
        )
    ).data;