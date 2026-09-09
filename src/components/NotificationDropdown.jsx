import React from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const getNotificationId = (notification) =>
  notification?._id || notification?.id || notification?.notificationId || null;

const getTitle = (notification) =>
  notification?.title ||
  notification?.subject ||
  notification?.type ||
  "Auction Notification";

const getMessage = (notification) =>
  notification?.message ||
  notification?.description ||
  notification?.content ||
  "You have a new auction notification.";

const getNotificationDate = (notification) =>
  notification?.createdAt ||
  notification?.created_at ||
  notification?.date ||
  notification?.timestamp ||
  null;

const isRead = (notification) =>
  notification?.read === true ||
  notification?.isRead === true ||
  notification?.status === "read";

const getNotificationType = (notification) =>
  String(
    notification?.type || notification?.notificationType || "",
  ).toLowerCase();

const getTypeIcon = (notification) => {
  const type = getNotificationType(notification);

  if (type.includes("bid") || type.includes("auction")) {
    return <FiBell className="h-4 w-4" />;
  }

  if (
    type.includes("sold") ||
    type.includes("success") ||
    type.includes("complete")
  ) {
    return <FiCheckCircle className="h-4 w-4" />;
  }

  if (type.includes("warning") || type.includes("alert")) {
    return <FiClock className="h-4 w-4" />;
  }

  return <FiInfo className="h-4 w-4" />;
};

const formatRelativeTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const now = Date.now();
  const difference = now - parsedDate.getTime();

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

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const NotificationItem = ({
  notification,
  actionId,
  onRead,
  onDelete,
  onNotificationClick,
}) => {
  const notificationId = getNotificationId(notification);

  const title = getTitle(notification);

  const message = getMessage(notification);

  const date = getNotificationDate(notification);

  const read = isRead(notification);

  const busy = actionId === notificationId;

  const handleClick = async () => {
    if (onNotificationClick) {
      await onNotificationClick(notification);
    }
  };

  const handleMarkRead = async (event) => {
    event.stopPropagation();

    if (!notificationId || read) {
      return;
    }

    if (onRead) {
      await onRead(notificationId);
    }
  };

  const handleDelete = async (event) => {
    event.stopPropagation();

    if (!notificationId) {
      return;
    }

    if (onDelete) {
      await onDelete(notificationId);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      className={`
        group
        relative
        cursor-pointer
        border-b
        border-gray-100
        px-4
        py-3
        transition
        duration-200
        last:border-b-0
        dark:border-gray-800

        ${
          read
            ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/70"
            : "bg-indigo-50/70 hover:bg-indigo-50 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50"
        }
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`
            mt-0.5
            flex
            h-9
            w-9
            flex-shrink-0
            items-center
            justify-center
            rounded-full

            ${
              read
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300"
            }
          `}
        >
          {getTypeIcon(notification)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`
                truncate
                text-sm
                ${
                  read
                    ? "font-medium text-gray-700 dark:text-gray-300"
                    : "font-semibold text-gray-900 dark:text-white"
                }
              `}
              title={title}
            >
              {title}
            </h4>

            {!read && (
              <span
                className="
                  mt-1
                  h-2
                  w-2
                  flex-shrink-0
                  rounded-full
                  bg-indigo-600
                "
              />
            )}
          </div>

          <p
            className="
              mt-1
              line-clamp-2
              text-xs
              leading-5
              text-gray-600
              dark:text-gray-400
            "
          >
            {message}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span
              className="
                text-[11px]
                text-gray-400
                dark:text-gray-500
              "
            >
              {formatRelativeTime(date)}
            </span>

            {/* Actions */}
            <div
              className="
                flex
                items-center
                gap-1
                opacity-100
                transition
                sm:opacity-0
                sm:group-hover:opacity-100
              "
            >
              {!read && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleMarkRead}
                  title="Mark as read"
                  aria-label="Mark as read"
                  className="
                    rounded-lg
                    p-1.5
                    text-gray-500
                    transition
                    hover:bg-gray-200
                    hover:text-indigo-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:text-gray-400
                    dark:hover:bg-gray-700
                    dark:hover:text-indigo-300
                  "
                >
                  <FiCheck className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                title="Delete notification"
                aria-label="Delete notification"
                className="
                  rounded-lg
                  p-1.5
                  text-gray-500
                  transition
                  hover:bg-red-100
                  hover:text-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:text-gray-400
                  dark:hover:bg-red-950/40
                  dark:hover:text-red-400
                "
              >
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationDropdown = ({
  notifications = [],
  loading = false,
  actionId = null,
  hasError = false,

  onClose,
  onRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  onRefresh,
  onViewAll,
}) => {
  const unreadNotifications = notifications.filter(
    (notification) => !isRead(notification),
  );

  const hasUnread = unreadNotifications.length > 0;

  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-2xl
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          px-4
          py-3
          dark:border-gray-700
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <FiBell
              className="
                h-5
                w-5
                text-indigo-600
                dark:text-indigo-400
              "
            />

            <h3
              className="
                text-sm
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Notifications
            </h3>

            {hasUnread && (
              <span
                className="
                  rounded-full
                  bg-red-100
                  px-2
                  py-0.5
                  text-[10px]
                  font-bold
                  text-red-600
                  dark:bg-red-950/50
                  dark:text-red-400
                "
              >
                {unreadNotifications.length}
              </span>
            )}
          </div>

          <p
            className="
              mt-0.5
              text-[11px]
              text-gray-500
              dark:text-gray-400
            "
          >
            Auction updates and alerts
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh notifications"
            aria-label="Refresh notifications"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-indigo-600
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:text-gray-400
              dark:hover:bg-gray-800
              dark:hover:text-indigo-400
            "
          >
            <FiRefreshCw
              className={`
                h-4
                w-4
                ${loading ? "animate-spin" : ""}
              `}
            />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close notifications"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
              dark:text-gray-400
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mark all as read */}
      {hasUnread && (
        <div
          className="
            border-b
            border-gray-100
            px-4
            py-2
            dark:border-gray-800
          "
        >
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={actionId === "all"}
            className="
              flex
              items-center
              gap-1.5
              text-xs
              font-medium
              text-indigo-600
              transition
              hover:text-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:text-indigo-400
              dark:hover:text-indigo-300
            "
          >
            <FiCheckCircle className="h-3.5 w-3.5" />

            {actionId === "all" ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      )}

      {/* Body */}
      <div
        className="
          max-h-[420px]
          overflow-y-auto
          overscroll-contain
        "
      >
        {/* Loading */}
        {loading && notifications.length === 0 && (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex animate-pulse gap-3">
                <div
                  className="
                    h-9
                    w-9
                    flex-shrink-0
                    rounded-full
                    bg-gray-200
                    dark:bg-gray-800
                  "
                />

                <div className="flex-1 space-y-2">
                  <div
                    className="
                      h-3
                      w-2/3
                      rounded
                      bg-gray-200
                      dark:bg-gray-800
                    "
                  />

                  <div
                    className="
                      h-3
                      w-full
                      rounded
                      bg-gray-200
                      dark:bg-gray-800
                    "
                  />

                  <div
                    className="
                      h-2
                      w-1/4
                      rounded
                      bg-gray-200
                      dark:bg-gray-800
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && hasError && notifications.length === 0 && (
          <div className="px-6 py-10 text-center">
            <div
              className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                  text-red-600
                  dark:bg-red-950/40
                  dark:text-red-400
                "
            >
              <FiInfo className="h-5 w-5" />
            </div>

            <h4
              className="
                  mt-3
                  text-sm
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
            >
              Unable to load notifications
            </h4>

            <p
              className="
                  mt-1
                  text-xs
                  text-gray-500
                  dark:text-gray-400
                "
            >
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={onRefresh}
              className="
                  mt-4
                  rounded-lg
                  bg-indigo-600
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-indigo-700
                "
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !hasError && notifications.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div
              className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-gray-400
                  dark:bg-gray-800
                  dark:text-gray-500
                "
            >
              <FiBell className="h-6 w-6" />
            </div>

            <h4
              className="
                  mt-4
                  text-sm
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
            >
              No notifications
            </h4>

            <p
              className="
                  mt-1
                  text-xs
                  text-gray-500
                  dark:text-gray-400
                "
            >
              You're all caught up.
            </p>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <div>
            {notifications.map((notification, index) => {
              const id = getNotificationId(notification);

              /*
               * Fallback key for unusual backend
               * responses without an ID.
               */
              const key = id || `notification-${index}`;

              return (
                <NotificationItem
                  key={key}
                  notification={notification}
                  actionId={actionId}
                  onRead={onRead}
                  onDelete={onDelete}
                  onNotificationClick={onNotificationClick}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="
          border-t
          border-gray-200
          bg-gray-50
          px-4
          py-3
          dark:border-gray-700
          dark:bg-gray-800/50
        "
      >
        <button
          type="button"
          onClick={onViewAll}
          className="
            w-full
            rounded-xl
            py-2
            text-center
            text-xs
            font-semibold
            text-indigo-600
            transition
            hover:bg-indigo-50
            dark:text-indigo-400
            dark:hover:bg-indigo-950/40
          "
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
