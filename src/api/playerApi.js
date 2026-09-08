import api from "./axios";

export const getPlayersByAuction = async (auctionId) => {
    const response = await api.get(
        `/api/players/auction/${auctionId}`
    );

    return response.data;
};

export const getPlayerById = async (playerId) => {
    const response = await api.get(
        `/api/players/${playerId}`
    );

    return response.data;
};

export const createPlayer = async (data) => {
    const response = await api.post(
        "/api/players",
        data
    );

    return response.data;
};

export const updatePlayer = async (playerId, data) => {
    const response = await api.put(
        `/api/players/${playerId}`,
        data
    );

    return response.data;
};

export const deletePlayer = async (playerId) => {
    const response = await api.delete(
        `/api/players/${playerId}`
    );

    return response.data;
};

export const updatePlayerStatus = async (playerId, data) => {
    const response = await api.patch(
        `/api/players/${playerId}/status`,
        data
    );

    return response.data;
};