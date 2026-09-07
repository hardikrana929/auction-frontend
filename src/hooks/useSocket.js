import { useEffect, useState } from "react";

import {
    connectSocket,
    disconnectSocket,
} from "../socket/socket";

export default function useSocket() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = connectSocket();

        const handleConnect = () => {
            setConnected(true);
        };

        const handleDisconnect = () => {
            setConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        setConnected(socket.connected);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);

            disconnectSocket();
        };
    }, []);

    return {
        connected,
    };
}