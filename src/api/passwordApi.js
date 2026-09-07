import api from "./axios";

export const forgotPassword = async (data) => {
    const response = await api.post("/api/pass/forgotPass", data);
    return response.data;
};