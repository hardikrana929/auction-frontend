import api from "./axios";

/*
 * Get all players for an auction
 */
export const getPlayersByAuction = async (auctionId) => {
    const response = await api.get(
        `/api/players/auction/${auctionId}`,
    );

    return response.data;
};


/*
 * Get a single player
 */
export const getPlayerById = async (playerId) => {
    const response = await api.get(
        `/api/players/${playerId}`,
    );

    return response.data;
};


/*
 * Create player
 */
export const createPlayer = async (data) => {
    const response = await api.post(
        "/api/players",
        data,
    );

    return response.data;
};


/*
 * Update player
 */
export const updatePlayer = async (
    playerId,
    data,
) => {
    const response = await api.put(
        `/api/players/${playerId}`,
        data,
    );

    return response.data;
};


/*
 * Update player status
 */
export const updatePlayerStatus = async (
    playerId,
    data,
) => {
    const response = await api.patch(
        `/api/players/${playerId}/status`,
        data,
    );

    return response.data;
};


/*
 * Delete player
 */
export const deletePlayer = async (playerId) => {
    const response = await api.delete(
        `/api/players/${playerId}`,
    );

    return response.data;
};