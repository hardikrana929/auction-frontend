import api from "./axios";

// Kept as a compatibility wrapper for older imports.
// The backend exposes password recovery under /api/auth.
export const forgotPassword = async (data) => {
  const response = await api.post("/api/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (token, data) => {
  const response = await api.post(
    `/api/auth/reset-password/${encodeURIComponent(token)}`,
    data,
  );
  return response.data;
};
