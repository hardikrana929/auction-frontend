import { io } from "socket.io-client";

let socket = null;

const TOKEN_KEY = "auctionpro_token";

const getSocketUrl = () => {
    return (
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"
    ).replace(/\/$/, "");
};

const getAuthToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getSocket = () => {
    if (!socket) {
        socket = io(getSocketUrl(), {
            autoConnect: false,

            /*
             * Backend socketServer.js verifies:
             *
             * socket.handshake.auth?.token
             *
             * Therefore the JWT must be sent here.
             */
            auth: {
                token: getAuthToken(),
            },

            transports: ["websocket", "polling"],

            withCredentials: true,
        });
    }

    return socket;
};

export const connectSocket = () => {
    const currentSocket = getSocket();

    /*
     * Refresh token before every new connection.
     *
     * This is important after login/logout.
     */
    currentSocket.auth = {
        token: getAuthToken(),
    };

    if (!currentSocket.connected) {
        currentSocket.connect();
    }

    return currentSocket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};

export const joinAuctionRoom = (auctionId) => {
    const currentSocket = getSocket();

    if (!auctionId) {
        return;
    }

    if (!currentSocket.connected) {
        return;
    }

    currentSocket.emit("auction:join", {
        auctionId,
    });
};

export const leaveAuctionRoom = (auctionId) => {
    const currentSocket = getSocket();

    if (!auctionId) {
        return;
    }

    if (!currentSocket.connected) {
        return;
    }

    currentSocket.emit("auction:leave", {
        auctionId,
    });
};

export const joinTeamRoom = (teamId) => {
    const currentSocket = getSocket();

    if (!teamId || !currentSocket.connected) {
        return;
    }

    currentSocket.emit("team:join", {
        teamId,
    });
};

export const leaveTeamRoom = (teamId) => {
    const currentSocket = getSocket();

    if (!teamId || !currentSocket.connected) {
        return;
    }

    currentSocket.emit("team:leave", {
        teamId,
    });
};

export const isSocketConnected = () => {
    return Boolean(socket?.connected);
};

export default getSocket;