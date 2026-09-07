import api from "./axios";

/**
 * Check whether current user has access to an auction
 */
export const checkAuctionAccess = async (auctionId) =>
    (
        await api.get(`/api/auction-access/${auctionId}/check`)
    ).data;

/**
 * Check access for a specific team
 */
export const getTeamAuctionAccess = async (auctionId, teamId) =>
    (
        await api.get(
            `/api/auction-access/${auctionId}/team/${teamId}`
        )
    ).data;

/**
 * Get auction participants
 */
export const getAuctionParticipants = async (auctionId) =>
    (
        await api.get(
            `/api/auction-access/${auctionId}/participants`
        )
    ).data;

/**
 * Verify whether a team can participate
 */
export const verifyTeamAuctionAccess = async (auctionId, teamId) =>
    (
        await api.get(
            `/api/auction-access/${auctionId}/team/${teamId}/verify`
        )
    ).data;