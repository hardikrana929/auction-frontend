import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const socketUrl =
            import.meta.env.VITE_SOCKET_URL ||
            import.meta.env.VITE_API_URL;

        socket = io(socketUrl, {
            autoConnect: false,
            transports: ["websocket"],
        });
    }

    return socket;
};

export const connectSocket = () => {
    const s = getSocket();

    if (!s.connected) {
        s.connect();
    }

    return s;
};

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

export const joinAuctionRoom = (auctionId) => {
    const s = getSocket();

    if (!auctionId) return;

    s.emit("auction:join", { auctionId });
};

export const leaveAuctionRoom = (auctionId) => {
    const s = getSocket();

    if (!auctionId) return;

    s.emit("auction:leave", { auctionId });
};

export default getSocket;