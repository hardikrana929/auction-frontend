import api from "./axios";

/*
 * ==========================================
 * REGISTER TEAM FOR AUCTION
 * POST /api/auction-registration/register
 * ==========================================
 */
export const registerForAuction = async (data) => {
  if (!data?.auctionId || !data?.teamId) {
    throw new Error("auctionId and teamId are required");
  }

  const response = await api.post(
    "/api/auction-registration/register",
    {
      auctionId: data.auctionId,
      teamId: data.teamId,
    },
  );

  return response.data;
};

/*
 * ==========================================
 * GET ALL REGISTRATIONS FOR AUCTION
 *
 * GET /api/auction-registration/:auctionId
 *
 * Supported query parameters:
 * status
 * page
 * limit
 * ==========================================
 */
export const getAuctionRegistrations = async (
  auctionId,
  params = {},
) => {
  if (!auctionId) {
    throw new Error("Auction ID is required");
  }

  const response = await api.get(
    `/api/auction-registration/${auctionId}`,
    {
      params: {
        ...(params.status
          ? { status: params.status }
          : {}),
        ...(params.page
          ? { page: params.page }
          : {}),
        ...(params.limit
          ? { limit: params.limit }
          : {}),
      },
    },
  );

  return response.data;
};

/*
 * ==========================================
 * GET SINGLE REGISTRATION
 *
 * GET /api/auction-registration/detail/:registrationId
 * ==========================================
 */
export const getRegistrationById = async (
  registrationId,
) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  const response = await api.get(
    `/api/auction-registration/detail/${registrationId}`,
  );

  return response.data;
};

/*
 * ==========================================
 * GET REGISTRATION STATUS
 *
 * GET /api/auction-registration/status/:auctionId/:teamId
 * ==========================================
 */
export const getRegistrationStatus = async (
  auctionId,
  teamId,
) => {
  if (!auctionId || !teamId) {
    throw new Error("Auction ID and Team ID are required");
  }

  const response = await api.get(
    `/api/auction-registration/status/${auctionId}/${teamId}`,
  );

  return response.data;
};

/*
 * ==========================================
 * ADMIN APPROVE REGISTRATION
 *
 * PUT /api/auction-registration/:registrationId/approve
 *
 * No request body required by backend.
 * ==========================================
 */
export const approveRegistration = async (
  registrationId,
) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  const response = await api.put(
    `/api/auction-registration/${registrationId}/approve`,
  );

  return response.data;
};

/*
 * ==========================================
 * ADMIN REJECT REGISTRATION
 *
 * PUT /api/auction-registration/:registrationId/reject
 *
 * Backend expects:
 * {
 *   rejectionReason: "..."
 * }
 * ==========================================
 */
export const rejectRegistration = async (
  registrationId,
  rejectionReason = "",
) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  const response = await api.put(
    `/api/auction-registration/${registrationId}/reject`,
    {
      rejectionReason: String(rejectionReason || "").trim(),
    },
  );

  return response.data;
};

/*
 * ==========================================
 * CANCEL REGISTRATION
 *
 * PUT /api/auction-registration/:registrationId/cancel
 * ==========================================
 */
export const cancelRegistration = async (
  registrationId,
) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  const response = await api.put(
    `/api/auction-registration/${registrationId}/cancel`,
  );

  return response.data;
};