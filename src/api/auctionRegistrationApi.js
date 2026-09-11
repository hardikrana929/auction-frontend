import api from "./axios";

/*
 * Register team for an auction
 */
export const registerForAuction = async ({ auctionId, teamId }) => {
  if (!auctionId) {
    throw new Error("Auction ID is required");
  }

  if (!teamId) {
    throw new Error("Team ID is required");
  }

  const response = await api.post(
    "/api/auction-registration/register",
    {
      auctionId,
      teamId,
    }
  );

  return response.data;
};

/*
 * Admin approves registration
 */
export const approveRegistration = async (
  registrationId,
  data = {}
) => {
  const response = await api.put(
    `/api/auction-registration/${registrationId}/approve`,
    data
  );

  return response.data;
};

/*
 * Admin rejects registration
 */
export const rejectRegistration = async (
  registrationId,
  data = {}
) => {
  const response = await api.put(
    `/api/auction-registration/${registrationId}/reject`,
    data
  );

  return response.data;
};

/*
 * User cancels registration
 */
export const cancelRegistration = async (
  registrationId,
  data = {}
) => {
  const response = await api.put(
    `/api/auction-registration/${registrationId}/cancel`,
    data
  );

  return response.data;
};

/*
 * Get all registrations for an auction
 */
export const getAuctionRegistrations = async (auctionId) => {
  if (!auctionId) {
    throw new Error("Auction ID is required");
  }

  const response = await api.get(
    `/api/auction-registration/${auctionId}`
  );

  return response.data;
};

/*
 * Check registration status
 */
export const getRegistrationStatus = async (
  auctionId,
  teamId
) => {
  if (!auctionId || !teamId) {
    throw new Error("Auction ID and Team ID are required");
  }

  const response = await api.get(
    `/api/auction-registration/status/${auctionId}/${teamId}`
  );

  return response.data;
};

/*
 * Get single registration
 */
export const getRegistrationById = async (registrationId) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  const response = await api.get(
    `/api/auction-registration/detail/${registrationId}`
  );

  return response.data;
};