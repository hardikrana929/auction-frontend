import api from "./axios";

export const getAuctionStats = async (auctionId) => {
    const response = await api.get(
        `/api/auction-stats/${auctionId}`
    );

    return response.data;
};

export default {
    getAuctionStats,
};