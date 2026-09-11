import api from "./axios";

export const registerUser = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`, { password });
  return response.data;
};
