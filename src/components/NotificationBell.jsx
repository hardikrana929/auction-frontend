import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import {
  getAuctionNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAuctionNotification,
} from "../api/auctionNotificationApi";

/**
 * AuctionPro Notification Bell
 *
 * Features:
 * - Displays unread notification count
 * - Opens notification dropdown
 * - Loads latest notifications
 * - Mark individual notification as read
 * - Mark all notifications as read
 * - Delete individual notification
 * - Refreshes notifications periodically
 * - Handles API errors safely
 *
 * Backend endpoints:
 * GET    /api/auction-notification
 * PUT    /api/auction-notification/read-all
 * PUT    /api/auction-notification/:notificationId/read
 * DELETE /api/auction-notification/:notificationId
 */

const MAX_VISIBLE_NOTIFICATIONS = 10;
const POLLING_INTERVAL = 30000;

const getNotificationId = (notification) =>
  notification?._id ||
  notification?.id ||
  notification?.notificationId ||
  null;

const isNotificationRead = (notification) =>
  Boolean(notification?.read ?? notification?.isRead);

const getNotificationMessage = (notification) =>
  notification?.message ||
  notification?.description ||
  notification?.text ||
  "You have a new auction notification.";

const getNotificationTitle = (notification) =>
  notification?.title ||
  notification?.subject ||
  "AuctionPro Notification";

const getNotificationType = (notification) =>
  String(notification?.type || notification?.notificationType || "info")
    .toLowerCase()
    .trim();

const getNotificationDate = (notification) =>
  notification?.createdAt ||
  notification?.updatedAt ||
  notification?.date ||
  null;

const normalizeNotifications = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getRelativeTime = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();
  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getNotificationIcon = (type) => {
  if (
    type.includes("success") ||
    type.includes("sold") ||
    type.includes("approved")
  ) {
    return <FiCheckCircle className="h-4 w-4" />;
  }

  if (
    type.includes("warning") ||
    type.includes("bid") ||
    type.includes("auction")
  ) {
    return <FiClock className="h-4 w-4" />;
  }

  return <FiInfo className="h-4 w-4" />;
};

const getNotificationIconClasses = (type) => {
  if (
    type.includes("success") ||
    type.includes("sold") ||
    type.includes("approved")
  ) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (
    type.includes("warning") ||
    type.includes("bid") ||
    type.includes("auction")
  ) {
    return "bg-amber-50 text-amber-600";
  }

  if (type.includes("error") || type.includes("rejected")) {
    return "bg-red-50 text-red-600";
  }

  return "bg-blue-50 text-blue-600";
};

export default function NotificationBell({
  className = "",
  onNotificationClick,
}) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef(null);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification)
  ).length;

  const loadNotifications = useCallback(async (showLoader = false) => {
    if (showLoader && mountedRef.current) {
      setLoading(true);
    }

    try {
      const response = await getAuctionNotifications();

      if (!mountedRef.current) return;

      const normalized = normalizeNotifications(response);

      const sorted = [...normalized]
        .filter(Boolean)
        .sort((a, b) => {
          const first = new Date(
            getNotificationDate(a) || 0
          ).getTime();

          const second = new Date(
            getNotificationDate(b) || 0
          ).getTime();

          return second - first;
        });

      setNotifications(sorted);
      setHasError(false);
    } catch (error) {
      if (!mountedRef.current) return;

      setHasError(true);

      if (showLoader) {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load notifications."
        );
      }
    } finally {
      if (showLoader && mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    loadNotifications(true);

    const interval = window.setInterval(() => {
      loadNotifications(false);
    }, POLLING_INTERVAL);

    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
  };

  const handleMarkAsRead = async (notification) => {
    const notificationId = getNotificationId(notification);

    if (!notificationId || isNotificationRead(notification)) {
      return;
    }

    setActionId(notificationId);

    try {
      await markNotificationAsRead(notificationId);

      if (!mountedRef.current) return;

      setNotifications((previous) =>
        previous.map((item) =>
          getNotificationId(item) === notificationId
            ? {
                ...item,
                read: true,
                isRead: true,
              }
            : item
        )
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      if (mountedRef.current) {
        setActionId(null);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setActionId("all");

    try {
      await markAllNotificationsAsRead();

      if (!mountedRef.current) return;

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
        }))
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      if (mountedRef.current) {
        setActionId(null);
      }
    }
  };

  const handleDelete = async (notification) => {
    const notificationId = getNotificationId(notification);

    if (!notificationId) return;

    setActionId(notificationId);

    try {
      await deleteAuctionNotification(notificationId);

      if (!mountedRef.current) return;

      setNotifications((previous) =>
        previous.filter(
          (item) => getNotificationId(item) !== notificationId
        )
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      if (mountedRef.current) {
        setActionId(null);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    await handleMarkAsRead(notification);

    onNotificationClick?.(notification);
  };

  const visibleNotifications = notifications.slice(
    0,
    MAX_VISIBLE_NOTIFICATIONS
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <FiBell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={actionId === "all"}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionId === "all"
                    ? "Updating..."
                    : "Mark all read"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse gap-3"
                  >
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />

                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-2.5 w-1/4 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError && notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <FiBell className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Notifications unavailable
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Something went wrong while loading notifications.
                </p>

                <button
                  type="button"
                  onClick={() => loadNotifications(true)}
                  className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Try again
                </button>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiBell className="h-6 w-6" />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-800">
                  No notifications
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Auction updates, bids and important alerts
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleNotifications.map((notification) => {
                  const notificationId =
                    getNotificationId(notification);

                  const read = isNotificationRead(notification);
                  const type = getNotificationType(notification);
                  const busy = actionId === notificationId;

                  return (
                    <div
                      key={
                        notificationId ||
                        `${getNotificationTitle(notification)}-${getNotificationDate(
                          notification
                        )}`
                      }
                      className={`group relative px-4 py-3 transition ${
                        read
                          ? "bg-white hover:bg-slate-50"
                          : "bg-blue-50/50 hover:bg-blue-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className="flex w-full gap-3 text-left"
                      >
                        {/* Icon */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClasses(
                            type
                          )}`}
                        >
                          {getNotificationIcon(type)}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1 pr-8">
                          <div className="flex items-start gap-2">
                            <h4
                              className={`line-clamp-1 text-sm ${
                                read
                                  ? "font-medium text-slate-700"
                                  : "font-bold text-slate-900"
                              }`}
                            >
                              {getNotificationTitle(
                                notification
                              )}
                            </h4>

                            {!read && (
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {getNotificationMessage(
                              notification
                            )}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                            <FiClock className="h-3 w-3" />
                            {getRelativeTime(
                              getNotificationDate(notification)
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(notification)}
                        disabled={busy}
                        aria-label="Delete notification"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                        ) : (
                          <FiTrash2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Read indicator */}
                      {!read && (
                        <span className="absolute bottom-3 right-3 hidden text-blue-500 sm:block">
                          <FiCheck className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > MAX_VISIBLE_NOTIFICATIONS && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center">
              <span className="text-xs font-medium text-slate-500">
                Showing latest {MAX_VISIBLE_NOTIFICATIONS}{" "}
                notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}