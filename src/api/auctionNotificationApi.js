import api from "./axios";

/**
 * Create a new auction notification.
 * Admin only according to the backend API.
 */
export const createAuctionNotification = async (data) => {
    const response = await api.post(
        "/api/auction-notification",
        data
    );

    return response.data;
};

/**
 * Get notifications for the authenticated user.
 */
export const getAuctionNotifications = async (params = {}) => {
    const response = await api.get(
        "/api/auction-notification",
        {
            params,
        }
    );

    return response.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = async () => {
    const response = await api.put(
        "/api/auction-notification/read-all"
    );

    return response.data;
};

/**
 * Delete all/read notifications.
 */
export const deleteReadNotifications = async () => {
    const response = await api.delete(
        "/api/auction-notification/read"
    );

    return response.data;
};

/**
 * Get notification count for an auction.
 */
export const getAuctionNotificationCount = async (
    auctionId
) => {
    if (!auctionId) {
        throw new Error("Auction ID is required.");
    }

    const response = await api.get(
        `/api/auction-notification/count/${auctionId}`
    );

    return response.data;
};

/**
 * Get a single notification.
 */
export const getAuctionNotificationById = async (
    notificationId
) => {
    if (!notificationId) {
        throw new Error("Notification ID is required.");
    }

    const response = await api.get(
        `/api/auction-notification/${notificationId}`
    );

    return response.data;
};

/**
 * Mark one notification as read.
 */
export const markNotificationAsRead = async (
    notificationId
) => {
    if (!notificationId) {
        throw new Error("Notification ID is required.");
    }

    const response = await api.put(
        `/api/auction-notification/${notificationId}/read`
    );

    return response.data;
};

/**
 * Delete one notification.
 */
export const deleteAuctionNotification = async (
    notificationId
) => {
    if (!notificationId) {
        throw new Error("Notification ID is required.");
    }

    const response = await api.delete(
        `/api/auction-notification/${notificationId}`
    );

    return response.data;
};