import api from "./axios";

export const getPlayersByAuction = async (auctionId) => {
  const response = await api.get(`/api/players/auction/${auctionId}`);
  return response.data;
};

export const getPlayer = async (playerId) => {
  const response = await api.get(`/api/players/${playerId}`);
  return response.data;
};

export const createPlayer = async (formData) => {
  const response = await api.post("/api/players", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePlayer = async (playerId, formData) => {
  const response = await api.put(`/api/players/${playerId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updatePlayerStatus = async (playerId, status) => {
  const response = await api.patch(`/api/players/${playerId}/status`, { status });
  return response.data;
};

export const deletePlayer = async (playerId) => {
  const response = await api.delete(`/api/players/${playerId}`);
  return response.data;
};
