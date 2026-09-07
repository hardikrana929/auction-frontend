import api from "./axios";

/*
 * Register a team for an auction
 */
export const registerForAuction = async (data) => {
  const response = await api.post(
    "/api/auction-registration/register",
    data
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
export const getAuctionRegistrations = async (
  auctionId
) => {
  const response = await api.get(
    `/api/auction-registration/${auctionId}`
  );

  return response.data;
};


/*
 * Check registration status for a team
 */
export const getRegistrationStatus = async (
  auctionId,
  teamId
) => {
  const response = await api.get(
    `/api/auction-registration/status/${auctionId}/${teamId}`
  );

  return response.data;
};


/*
 * Get a single registration
 */
export const getRegistrationById = async (
  registrationId
) => {
  const response = await api.get(
    `/api/auction-registration/detail/${registrationId}`
  );

  return response.data;
};