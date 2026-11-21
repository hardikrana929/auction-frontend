import api from "./axios";

// The backend reads req.body.auctionId. Some pages pass just the id string
// (e.g. startAuction(auctionId)), which axios sends as a bare JSON string and
// the server rejects with 400 "Invalid JSON request body". Wrap it here once.
const toBody = (data) =>
  data && typeof data === "object" ? data : { auctionId: data };

export const startAuction = async (data) => {
  const response = await api.post("/api/auction-control/start", toBody(data));

  return response.data;
};

export const pauseAuction = async (data) => {
  const response = await api.post("/api/auction-control/pause", toBody(data));

  return response.data;
};

export const resumeAuction = async (data) => {
  const response = await api.post("/api/auction-control/resume", toBody(data));

  return response.data;
};

export const getAuctionSession = async (auctionId) => {
  if (!auctionId) {
    throw new Error("Auction ID is required.");
  }

  const response = await api.get(`/api/auction-control/session/${auctionId}`);

  return response.data;
};

export const startNextPlayer = async (data) => {
  const response = await api.post(
    "/api/auction-control/next-player",
    toBody(data),
  );

  return response.data;
};

export const completeCurrentPlayer = async (data) => {
  const response = await api.post(
    "/api/auction-control/complete-player",
    toBody(data),
  );

  return response.data;
};

export const completeAuction = async (data) => {
  const response = await api.post(
    "/api/auction-control/complete",
    toBody(data),
  );

  return response.data;
};

/* Everything the control dashboard shows, in one request. */
export const getControlDashboard = async (auctionId) =>
  (await api.get(`/api/auction-control/dashboard/${auctionId}`)).data;

/* order | manual | random */
export const setSelectionMode = async (auctionId, mode) =>
  (await api.post("/api/auction-control/selection-mode", { auctionId, mode }))
    .data;

export default {
  getControlDashboard,
  setSelectionMode,
  startAuction,
  pauseAuction,
  resumeAuction,
  getAuctionSession,
  startNextPlayer,
  completeCurrentPlayer,
  completeAuction,
};
