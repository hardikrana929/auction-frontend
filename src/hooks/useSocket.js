import { useEffect, useState } from "react";
import {
    connectSocket,
    disconnectSocket,
    getSocket,
} from "../socket/socket";

const useSocket = () => {
    const [socket] = useState(() => getSocket());
    const [connected, setConnected] = useState(socket.connected);
    const [connecting, setConnecting] = useState(!socket.connected);

    useEffect(() => {
        const handleConnect = () => {
            setConnected(true);
            setConnecting(false);
        };

        const handleDisconnect = () => {
            setConnected(false);
            setConnecting(true);
        };

        const handleConnectError = () => {
            setConnected(false);
            setConnecting(true);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        if (!socket.connected) {
            connectSocket();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket]);

    return {
        socket,
        connected,
        connecting,
    };
};

export default useSocket;