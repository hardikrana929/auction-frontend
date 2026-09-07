import api from "./axios";

/*
|--------------------------------------------------------------------------
| Complete auction history
|--------------------------------------------------------------------------
*/

export const getAuctionHistory = async (
    auctionId,
    params = {}
) => {
    const response = await api.get(
        `/api/auction-history/${auctionId}`,
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Sold players
|--------------------------------------------------------------------------
*/

export const getSoldHistory = async (
    auctionId,
    params = {}
) => {
    const response = await api.get(
        `/api/auction-history/${auctionId}/sold`,
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Unsold players
|--------------------------------------------------------------------------
*/

export const getUnsoldHistory = async (
    auctionId,
    params = {}
) => {
    const response = await api.get(
        `/api/auction-history/${auctionId}/unsold`,
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Bid history
|--------------------------------------------------------------------------
*/

export const getAuctionBidHistory = async (
    auctionId,
    params = {}
) => {
    const response = await api.get(
        `/api/auction-history/${auctionId}/bids`,
        {
            params,
        }
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Player history
|--------------------------------------------------------------------------
*/

export const getPlayerAuctionHistory = async (
    playerId
) => {
    const response = await api.get(
        `/api/auction-history/player/${playerId}`
    );

    return response.data;
};


export default {
    getAuctionHistory,
    getSoldHistory,
    getUnsoldHistory,
    getAuctionBidHistory,
    getPlayerAuctionHistory,
};