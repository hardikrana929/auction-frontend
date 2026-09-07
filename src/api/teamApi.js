import api from "./axios";

/*
 * Get all teams belonging to an auction
 * GET /api/teams/auction/:auctionId
 */
export const getTeamsByAuction = async (auctionId) => {
    const response = await api.get(
        `/api/teams/auction/${auctionId}`,
    );

    return response.data;
};


/*
 * Get a single team
 * GET /api/teams/:id
 */
export const getTeamById = async (teamId) => {
    const response = await api.get(
        `/api/teams/${teamId}`,
    );

    return response.data;
};


/*
 * Create team
 * POST /api/teams
 *
 * `data` must match the actual backend request body.
 */
export const createTeam = async (data) => {
    const response = await api.post(
        "/api/teams",
        data,
    );

    return response.data;
};


/*
 * Update team
 * PUT /api/teams/:id
 *
 * `data` must match the actual backend request body.
 */
export const updateTeam = async (teamId, data) => {
    const response = await api.put(
        `/api/teams/${teamId}`,
        data,
    );

    return response.data;
};


/*
 * Activate / deactivate team
 * PATCH /api/teams/:id/status
 *
 * `data` is intentionally passed through because
 * the API reference does not define its exact body.
 */
export const updateTeamStatus = async (
    teamId,
    data,
) => {
    const response = await api.patch(
        `/api/teams/${teamId}/status`,
        data,
    );

    return response.data;
};


/*
 * Delete team
 * DELETE /api/teams/:id
 */
export const deleteTeam = async (teamId) => {
    const response = await api.delete(
        `/api/teams/${teamId}`,
    );

    return response.data;
};