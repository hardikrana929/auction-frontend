import api from "./axios";

/*
 * Get the player currently being auctioned.
 */
export const getCurrentBid = async (auctionId) => {
  if (!auctionId) {
    throw new Error("Auction ID is required.");
  }

  const response = await api.get(`/api/bidding/current/${auctionId}`);

  return response.data;
};

/*
 * Place a bid.
 *
 * Backend:
 * POST /api/bidding/place
 */
export const placeBid = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Bid data is required.");
  }

  const response = await api.post("/api/bidding/place", data);

  return response.data;
};

/*
 * Admin presses "Bidding": raises the current bid by the configured increment.
 * POST /api/bidding/raise  { auctionId, playerId }
 */
export const raiseBid = async (data) =>
  (await api.post("/api/bidding/raise", data)).data;

/* Admin takes the last raise back. POST /api/bidding/undo */
export const undoRaise = async (data) =>
  (await api.post("/api/bidding/undo", data)).data;

/*
 * Admin reverses a wrong sale: the money goes back to the team.
 * POST /api/bidding/rollback  { auctionId, playerId }
 */
export const rollbackSale = async (data) =>
  (await api.post("/api/bidding/rollback", data)).data;

/*
 * "Buy Player": sells the current player to a team at the current bid.
 * POST /api/bidding/sell  { auctionId, playerId, teamId }
 *
 * Backend:
 * POST /api/bidding/sell
 */
export const sellPlayer = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Sell data is required.");
  }

  const response = await api.post("/api/bidding/sell", data);

  return response.data;
};

/*
 * Admin marks current player unsold.
 *
 * Backend:
 * POST /api/bidding/unsold
 */
export const markPlayerUnsold = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Unsold data is required.");
  }

  const response = await api.post("/api/bidding/unsold", data);

  return response.data;
};

/*
 * Get bid history for a player.
 *
 * Backend:
 * GET /api/bidding/history/:playerId
 */
export const getBidHistory = async (playerId) => {
  if (!playerId) {
    throw new Error("Player ID is required.");
  }

  const response = await api.get(`/api/bidding/history/${playerId}`);

  return response.data;
};

export default {
  getCurrentBid,
  raiseBid,
  undoRaise,
  rollbackSale,
  placeBid,
  sellPlayer,
  markPlayerUnsold,
  getBidHistory,
};
