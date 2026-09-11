import api from "./axios";

export const getTeamsByAuction = async (auctionId) => {
  const response = await api.get(`/api/teams/auction/${auctionId}`);
  return response.data;
};

export const getTeam = async (teamId) => {
  const response = await api.get(`/api/teams/${teamId}`);
  return response.data;
};

export const createTeam = async (formData) => {
  const response = await api.post("/api/teams", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateTeam = async (teamId, formData) => {
  const response = await api.put(`/api/teams/${teamId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateTeamStatus = async (teamId, status) => {
  const response = await api.patch(`/api/teams/${teamId}/status`, { status });
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await api.delete(`/api/teams/${teamId}`);
  return response.data;
};
