import { useEffect } from "react";
import { toast } from "react-hot-toast";

const useNotificationSocket = ({
    socket,
    onNotification,
    enabled = true,
}) => {
    useEffect(() => {
        if (!socket || !enabled) {
            return;
        }

        const handleNewNotification = (notification) => {
            console.log(
                "🔔 New notification received:",
                notification
            );

            if (onNotification) {
                onNotification(notification);
            }

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
        };

        socket.on(
            "notification:new",
            handleNewNotification
        );

        return () => {
            socket.off(
                "notification:new",
                handleNewNotification
            );
        };
    }, [socket, enabled, onNotification]);
};

export default useNotificationSocket;