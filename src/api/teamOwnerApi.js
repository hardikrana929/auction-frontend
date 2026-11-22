import api from "./axios";

// Team owner area (only the owner of a team can read these).
export const getMyTeams = async () =>
  (await api.get("/api/team-owner/teams")).data;

export const getMyTeamReport = async (teamId) =>
  (await api.get(`/api/team-owner/teams/${teamId}/report`)).data;

export const downloadMyTeamExcel = async (teamId) =>
  (await api.get(`/api/team-owner/teams/${teamId}/export`, { responseType: "blob" })).data;
