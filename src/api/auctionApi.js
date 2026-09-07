import api from "./axios";

export const getAuctions = async () => {
    const response = await api.get("/api/auctions");
    return response.data;
};

export const getAuctionById = async (auctionId) => {
    const response = await api.get(`/api/auctions/${auctionId}`);
    return response.data;
};

export const createAuction = async (data) => {
    const response = await api.post("/api/auctions", data);
    return response.data;
};

export const updateAuction = async (auctionId, data) => {
    const response = await api.put(
        `/api/auctions/${auctionId}`,
        data,
    );

    return response.data;
};

export const updateAuctionStatus = async (auctionId, data) => {
    const response = await api.patch(
        `/api/auctions/${auctionId}/status`,
        data,
    );

    return response.data;
};

export const deleteAuction = async (auctionId) => {
    const response = await api.delete(
        `/api/auctions/${auctionId}`,
    );

    return response.data;
};