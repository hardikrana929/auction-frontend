import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("auctionpro_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;

        let message =
            "Something went wrong. Please try again.";

        if (!error.response) {
            message =
                "Unable to reach the server. Check your connection and try again.";
        } else if (status === 401) {
            message = "Your session has expired. Please login again.";

            sessionStorage.removeItem("auctionpro_token");
            sessionStorage.removeItem("auctionpro_user");
        } else if (status === 403) {
            message =
                "You do not have permission to perform this action.";
        } else if (status === 404) {
            message = "The requested resource was not found.";
        } else if (status >= 500) {
            message =
                "Something went wrong on the server. Please try again.";
        }

        error.normalizedMessage = message;

        return Promise.reject(error);
    }
);

export default api;