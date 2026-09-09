import api from "./axios";

export const getTeamsByAuction = async (auctionId) => {
    const response = await api.get(`/api/teams/auction/${auctionId}`);
    return response.data;
};

export const getTeamById = async (teamId) => {
    const response = await api.get(`/api/teams/${teamId}`);
    return response.data;
};

export const createTeam = async (data) => {
    const response = await api.post("/api/teams", data);
    return response.data;
};

export const updateTeam = async (teamId, data) => {
    const response = await api.put(`/api/teams/${teamId}`, data);
    return response.data;
};

export const updateTeamStatus = async (teamId, data) => {
    const response = await api.patch(`/api/teams/${teamId}/status`, data);
    return response.data;
};

export const deleteTeam = async (teamId) => {
    const response = await api.delete(`/api/teams/${teamId}`);
    return response.data;
};