import { io } from "socket.io-client";

let socket = null;

const getSocketUrl = () => {
    return (
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"
    );
};

export const getSocket = () => {
    if (socket) {
        return socket;
    }

    socket = io(getSocketUrl(), {
        // The backend rejects sockets without a valid JWT ("Authentication required").
        // A function is used so the latest token is read on every (re)connect.
        auth: (cb) => cb({ token: localStorage.getItem("auctionpro_token") }),
        autoConnect: false,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    return socket;
};

export const connectSocket = () => {
    const instance = getSocket();

    if (!instance.connected) {
        instance.connect();
    }

    return instance;
};

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

export const resetSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinAuctionRoom = (auctionId) => {
    if (!auctionId) return;
    getSocket().emit("auction:join", { auctionId });
};

export const leaveAuctionRoom = (auctionId) => {
    if (!auctionId) return;
    getSocket().emit("auction:leave", { auctionId });
};

export default getSocket;