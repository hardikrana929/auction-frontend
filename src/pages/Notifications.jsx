import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiRefreshCw,
  FiTrash2,
  FiAlertTriangle,
  FiXCircle,
  FiExternalLink,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  getAuctionNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAuctionNotification,
  deleteReadNotifications,
} from "../api/auctionNotificationApi";

import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getNotificationId = (notification) =>
  notification?._id || notification?.id || notification?.notificationId || null;

const getNotificationTitle = (notification) =>
  notification?.title ||
  notification?.subject ||
  notification?.heading ||
  "AuctionPro Notification";

const getNotificationMessage = (notification) =>
  notification?.message ||
  notification?.description ||
  notification?.content ||
  "You have a new notification.";

const isReadNotification = (notification) =>
  notification?.isRead === true ||
  notification?.read === true ||
  notification?.status === "READ";

const getNotificationDate = (notification) =>
  notification?.createdAt ||
  notification?.updatedAt ||
  notification?.date ||
  null;

const formatNotificationDate = (date) => {
  if (!date) return "Unknown time";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown time";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationType = (notification) => {
  const type = String(
    notification?.type ||
      notification?.notificationType ||
      notification?.category ||
      "",
  ).toLowerCase();

  if (
    type.includes("success") ||
    type.includes("sold") ||
    type.includes("approved")
  ) {
    return "success";
  }

  if (
    type.includes("warning") ||
    type.includes("pending") ||
    type.includes("bid")
  ) {
    return "warning";
  }

  if (
    type.includes("error") ||
    type.includes("reject") ||
    type.includes("failed")
  ) {
    return "error";
  }

  return "info";
};

const getTypeIcon = (type) => {
  switch (type) {
    case "success":
      return FiCheckCircle;

    case "warning":
      return FiAlertTriangle;

    case "error":
      return FiXCircle;

    default:
      return FiInfo;
  }
};

/*
|--------------------------------------------------------------------------
| Notification Card
|--------------------------------------------------------------------------
*/

const NotificationCard = ({ notification, onRead, onDelete }) => {
  const id = getNotificationId(notification);
  const read = isReadNotification(notification);
  const type = getNotificationType(notification);
  const Icon = getTypeIcon(type);

  const auctionId =
    notification?.auction?._id ||
    notification?.auction?.id ||
    notification?.auctionId ||
    null;

  return (
    <article
      className={[
        "group relative rounded-2xl border p-4 sm:p-5",
        "transition-all duration-200",
        read
          ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          : "border-cyan-200 bg-cyan-50/60 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/20",
      ].join(" ")}
    >
      {!read && (
        <span
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-cyan-500"
          title="Unread"
        />
      )}

      <div className="flex gap-4">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            type === "success" &&
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
            type === "warning" &&
              "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            type === "error" &&
              "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
            type === "info" &&
              "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
          ].join(" ")}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={[
                "text-sm font-bold",
                read
                  ? "text-slate-800 dark:text-slate-100"
                  : "text-slate-950 dark:text-white",
              ].join(" ")}
            >
              {getNotificationTitle(notification)}
            </h3>

            {!read && (
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                New
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {getNotificationMessage(notification)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <FiClock size={13} />
              {formatNotificationDate(getNotificationDate(notification))}
            </span>

            {notification?.auction?.name && (
              <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                {notification.auction.name}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!read && id && (
              <button
                type="button"
                onClick={() => onRead(id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-400"
              >
                <FiCheck size={14} />
                Mark as read
              </button>
            )}

            {auctionId && (
              <Link
                to={`/auctions/${auctionId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-400"
              >
                <FiExternalLink size={14} />
                View auction
              </Link>
            )}

            {id && (
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/*
|--------------------------------------------------------------------------
| Notifications Page
|--------------------------------------------------------------------------
*/

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  /*
    |--------------------------------------------------------------------------
    | Load Notifications
    |--------------------------------------------------------------------------
    */

  const loadNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await getAuctionNotifications();

      const data =
        response?.notifications ||
        response?.data?.notifications ||
        response?.data ||
        response;

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load notifications error:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setError("You do not have permission to view notifications.");
      } else if (status === 404) {
        setError("Notification service is not available.");
      } else {
        setError("Unable to load notifications. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

  const unreadCount = useMemo(
    () =>
      notifications.filter((notification) => !isReadNotification(notification))
        .length,
    [notifications],
  );

  const readCount = notifications.length - unreadCount;

  /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (notification) => !isReadNotification(notification),
      );
    }

    if (filter === "read") {
      return notifications.filter((notification) =>
        isReadNotification(notification),
      );
    }

    return notifications;
  }, [notifications, filter]);

  /*
    |--------------------------------------------------------------------------
    | Mark Single Notification Read
    |--------------------------------------------------------------------------
    */

  const handleMarkRead = async (notificationId) => {
    try {
      setActionLoading(true);

      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          getNotificationId(notification) === notificationId
            ? {
                ...notification,
                isRead: true,
                read: true,
                status: "READ",
              }
            : notification,
        ),
      );

      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Mark notification read error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to mark notification as read",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Mark All Read
    |--------------------------------------------------------------------------
    */

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      toast("All notifications are already read.");
      return;
    }

    try {
      setActionLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
          status: "READ",
        })),
      );

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all notifications read error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Delete Notification
    |--------------------------------------------------------------------------
    */

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm("Delete this notification?");

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await deleteAuctionNotification(notificationId);

      setNotifications((current) =>
        current.filter(
          (notification) => getNotificationId(notification) !== notificationId,
        ),
      );

      toast.success("Notification deleted");
    } catch (err) {
      console.error("Delete notification error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to delete notification",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Delete Read
    |--------------------------------------------------------------------------
    */

  const handleDeleteRead = async () => {
    if (readCount === 0) {
      toast("There are no read notifications.");
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${readCount} read notifications?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await deleteReadNotifications();

      setNotifications((current) =>
        current.filter((notification) => !isReadNotification(notification)),
      );

      toast.success("Read notifications deleted");
    } catch (err) {
      console.error("Delete read notifications error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to delete read notifications",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

  if (loading) {
    return <PageLoader />;
  }

  /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

  if (error) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <FiBell size={24} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Notifications unavailable
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadNotifications(false)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
            >
              <FiRefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
                <FiBell size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Stay updated with your AuctionPro activity.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing || actionLoading}
            onClick={() => loadNotifications(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-800 dark:hover:text-cyan-400"
          >
            <FiRefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Unread
            </p>
            <p className="mt-1 text-2xl font-black text-cyan-700 dark:text-cyan-300">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Read
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              {readCount}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["read", "Read"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={[
                  "rounded-lg px-4 py-2 text-xs font-bold transition",
                  filter === value
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-cyan-600 transition hover:bg-cyan-50 disabled:opacity-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30"
              >
                <FiCheckCircle size={14} />
                Mark all read
              </button>
            )}

            {readCount > 0 && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteRead}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
              >
                <FiTrash2 size={14} />
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
            <EmptyState
              icon={FiBell}
              title={
                filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"
              }
              description={
                filter === "all"
                  ? "Auction activity and important updates will appear here."
                  : "There are no notifications matching this filter."
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={
                  getNotificationId(notification) ||
                  `${getNotificationTitle(notification)}-${getNotificationDate(
                    notification,
                  )}`
                }
                notification={notification}
                onRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
