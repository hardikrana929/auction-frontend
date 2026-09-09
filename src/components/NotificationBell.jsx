import React, { useCallback, useEffect, useRef, useState } from "react";

import { FiBell } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import useSocket from "../hooks/useSocket";
import useNotificationSocket from "../hooks/useNotificationSocket";

import NotificationDropdown from "./NotificationDropdown";

import {
  getAuctionNotifications,
  getAuctionNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAuctionNotification,
} from "../api/auctionNotificationApi";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_VISIBLE_NOTIFICATIONS = 10;
const POLLING_INTERVAL = 30000;

/* =========================================================
   HELPERS
========================================================= */

const getNotificationId = (notification) => {
  return (
    notification?._id ||
    notification?.id ||
    notification?.notificationId ||
    null
  );
};

const getAuctionId = (notification) => {
  return (
    notification?.auction?._id ||
    notification?.auction?.id ||
    notification?.auctionId ||
    null
  );
};

const isNotificationRead = (notification) => {
  return (
    notification?.read === true ||
    notification?.isRead === true ||
    notification?.status === "read"
  );
};

const normalizeNotifications = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
};

const getUnreadCountFromResponse = (response) => {
  if (typeof response === "number") {
    return response;
  }

  if (typeof response?.count === "number") {
    return response.count;
  }

  if (typeof response?.unreadCount === "number") {
    return response.unreadCount;
  }

  if (typeof response?.data === "number") {
    return response.data;
  }

  if (typeof response?.data?.count === "number") {
    return response.data.count;
  }

  if (typeof response?.data?.unreadCount === "number") {
    return response.data.unreadCount;
  }

  return null;
};

/* =========================================================
   COMPONENT
========================================================= */

const NotificationBell = ({ auctionId = null }) => {
  const navigate = useNavigate();

  /* =====================================================
       SOCKET
    ===================================================== */

  const { socket } = useSocket();

  /* =====================================================
       STATE
    ===================================================== */

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [hasError, setHasError] = useState(false);

  /* =====================================================
       REFS
    ===================================================== */

  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  /* =========================================================
       REAL-TIME NOTIFICATION
    ========================================================= */

  const handleNewNotification = useCallback((notification) => {
    if (!notification) {
      return;
    }

    console.log("🔔 New notification received:", notification);

    const notificationId = getNotificationId(notification);

    /* Prevent duplicate notifications */

    setNotifications((previous) => {
      if (
        notificationId &&
        previous.some((item) => getNotificationId(item) === notificationId)
      ) {
        return previous;
      }

      return [notification, ...previous].slice(0, MAX_VISIBLE_NOTIFICATIONS);
    });

    /* Increase unread count */

    if (!isNotificationRead(notification)) {
      setUnreadCount((previous) => previous + 1);
    }

    /* Toast */

    const message =
      notification?.message ||
      notification?.description ||
      notification?.content ||
      "You have a new notification.";

    toast(message, {
      icon: "🔔",
      duration: 4000,
      position: "top-right",
    });
  }, []);

  /* =========================================================
       CONNECT SOCKET NOTIFICATION EVENT
    ========================================================= */

  useNotificationSocket({
    socket,
    onNotification: handleNewNotification,
    enabled: Boolean(socket),
  });

  /* =========================================================
       LOAD NOTIFICATIONS
    ========================================================= */

  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await getAuctionNotifications({
          auctionId: auctionId || undefined,
          page: 1,
          limit: MAX_VISIBLE_NOTIFICATIONS,
        });

        const list = normalizeNotifications(response);

        setNotifications(list);
        setHasError(false);
      } catch (error) {
        console.error("Failed to load notifications:", error);

        setHasError(true);

        if (!silent) {
          toast.error(
            error?.response?.data?.message || "Failed to load notifications",
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [auctionId],
  );

  /* =========================================================
       LOAD UNREAD COUNT
    ========================================================= */

  const loadUnreadCount = useCallback(
    async ({ silent = true } = {}) => {
      try {
        /*
         * Use dedicated count API
         * when auctionId exists.
         */

        if (auctionId) {
          const response = await getAuctionNotificationCount(auctionId);

          const count = getUnreadCountFromResponse(response);

          if (count !== null) {
            setUnreadCount(Math.max(0, count));

            return;
          }
        }

        /*
         * Fallback:
         * calculate unread notifications.
         */

        const response = await getAuctionNotifications({
          auctionId: auctionId || undefined,
          page: 1,
          limit: MAX_VISIBLE_NOTIFICATIONS,
        });

        const list = normalizeNotifications(response);

        const unread = list.filter(
          (notification) => !isNotificationRead(notification),
        ).length;

        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load notification count:", error);

        if (!silent) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to load notification count",
          );
        }
      }
    },
    [auctionId],
  );

  /* =========================================================
       INITIAL LOAD
    ========================================================= */

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  /* =========================================================
       POLLING FALLBACK
    ========================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications({
        silent: true,
      });

      loadUnreadCount({
        silent: true,
      });
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [loadNotifications, loadUnreadCount]);

  /* =========================================================
       CLOSE ON OUTSIDE CLICK
    ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isOpen) {
        return;
      }

      const clickedBell =
        bellRef.current && bellRef.current.contains(event.target);

      const clickedDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!clickedBell && !clickedDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  /* =========================================================
       ESCAPE KEY
    ========================================================= */

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

  /* =========================================================
       TOGGLE DROPDOWN
    ========================================================= */

  const handleToggle = async () => {
    const nextState = !isOpen;

    setIsOpen(nextState);

    if (nextState) {
      await Promise.all([
        loadNotifications(),
        loadUnreadCount({
          silent: true,
        }),
      ]);
    }
  };

  /* =========================================================
       MARK ONE AS READ
    ========================================================= */

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) {
      return;
    }

    const currentNotification = notifications.find(
      (notification) => getNotificationId(notification) === notificationId,
    );

    /*
     * Already read.
     */

    if (currentNotification && isNotificationRead(currentNotification)) {
      return;
    }

    try {
      setActionId(notificationId);

      await markNotificationAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((notification) => {
          const id = getNotificationId(notification);

          if (id !== notificationId) {
            return notification;
          }

          return {
            ...notification,
            read: true,
            isRead: true,
            status: "read",
          };
        }),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      toast.error(
        error?.response?.data?.message || "Failed to mark notification as read",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
       MARK ALL AS READ
    ========================================================= */

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0) {
      return;
    }

    try {
      setActionId("all");

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
          status: "read",
        })),
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
       DELETE NOTIFICATION
    ========================================================= */

  const handleDelete = async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      setActionId(notificationId);

      const deletedNotification = notifications.find(
        (notification) => getNotificationId(notification) === notificationId,
      );

      await deleteAuctionNotification(notificationId);

      setNotifications((previous) =>
        previous.filter(
          (notification) => getNotificationId(notification) !== notificationId,
        ),
      );

      if (deletedNotification && !isNotificationRead(deletedNotification)) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete notification",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
       NOTIFICATION CLICK
    ========================================================= */

  const handleNotificationClick = async (notification) => {
    if (!notification) {
      return;
    }

    const notificationId = getNotificationId(notification);

    /*
     * Mark unread notification as read.
     */

    if (notificationId && !isNotificationRead(notification)) {
      await handleMarkAsRead(notificationId);
    }

    /*
     * Custom notification URL.
     */

    const targetUrl =
      notification?.url ||
      notification?.link ||
      notification?.actionUrl ||
      notification?.redirectUrl ||
      notification?.route ||
      null;

    if (targetUrl) {
      setIsOpen(false);

      /*
       * Internal React route.
       */

      if (typeof targetUrl === "string" && targetUrl.startsWith("/")) {
        navigate(targetUrl);
        return;
      }

      /*
       * External URL.
       */

      if (typeof targetUrl === "string" && /^https?:\/\//i.test(targetUrl)) {
        window.location.href = targetUrl;

        return;
      }
    }

    /*
     * Fallback:
     * related auction.
     */

    const relatedAuctionId = getAuctionId(notification);

    if (relatedAuctionId) {
      setIsOpen(false);

      navigate(`/auctions/${relatedAuctionId}`);
    }
  };

  /* =========================================================
       REFRESH
    ========================================================= */

  const handleRefresh = async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount({
        silent: false,
      }),
    ]);
  };

  /* =========================================================
       RENDER
    ========================================================= */

  return (
    <div className="relative" ref={bellRef}>
      {/* =================================================
                NOTIFICATION BUTTON
            ================================================= */}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    text-gray-600
                    transition
                    duration-200
                    hover:bg-gray-100
                    hover:text-gray-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                    dark:text-gray-300
                    dark:hover:bg-gray-800
                    dark:hover:text-white
                "
      >
        <FiBell className="h-5 w-5" />

        {/* =================================================
                    UNREAD BADGE
                ================================================= */}

        {unreadCount > 0 && (
          <span
            className="
                            absolute
                            -right-0.5
                            -top-0.5
                            flex
                            min-h-[18px]
                            min-w-[18px]
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500
                            px-1
                            text-[10px]
                            font-bold
                            leading-none
                            text-white
                            ring-2
                            ring-white
                            dark:ring-gray-900
                        "
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* =================================================
                DROPDOWN
            ================================================= */}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="
                        absolute
                        right-0
                        z-50
                        mt-3
                        w-[calc(100vw-2rem)]
                        max-w-[400px]
                    "
        >
          <NotificationDropdown
            notifications={notifications}
            loading={loading}
            actionId={actionId}
            hasError={hasError}
            onClose={() => setIsOpen(false)}
            onRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
            onNotificationClick={handleNotificationClick}
            onRefresh={handleRefresh}
            onViewAll={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
