import { useEffect, useState } from "react";

import {
    connectSocket,
    disconnectSocket,
} from "../socket/socket";

export default function useSocket() {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const currentSocket = connectSocket();

        setSocket(currentSocket);
        setConnected(currentSocket.connected);

        const handleConnect = () => {
            console.log("🟢 Socket connected:", currentSocket.id);
            setConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log("🔴 Socket disconnected:", reason);
            setConnected(false);
        };

        currentSocket.on("connect", handleConnect);
        currentSocket.on("disconnect", handleDisconnect);

        return () => {
            currentSocket.off("connect", handleConnect);
            currentSocket.off("disconnect", handleDisconnect);

            disconnectSocket();
            setSocket(null);
            setConnected(false);
        };
    }, []);

    return {
        socket,
        connected,
    };
}