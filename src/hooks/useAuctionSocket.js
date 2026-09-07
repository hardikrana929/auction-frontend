import { useEffect } from "react";

import {
    connectSocket,
    getSocket,
    joinAuctionRoom,
    leaveAuctionRoom,
} from "../socket/socket";

export default function useAuctionSocket({
    auctionId,
    onAuctionStarted,
    onAuctionPaused,
    onAuctionResumed,
    onPlayerStarted,
    onBid,
    onPlayerSold,
    onPlayerUnsold,
    onNextPlayer,
    onAuctionCompleted,
    onNotification,
}) {
    useEffect(() => {
        if (!auctionId) {
            return;
        }

        const socket = connectSocket();

        const handleAuctionStarted = (data) => {
            onAuctionStarted?.(data);
        };

        const handleAuctionPaused = (data) => {
            onAuctionPaused?.(data);
        };

        const handleAuctionResumed = (data) => {
            onAuctionResumed?.(data);
        };

        const handlePlayerStarted = (data) => {
            onPlayerStarted?.(data);
        };

        const handleBid = (data) => {
            onBid?.(data);
        };

        const handlePlayerSold = (data) => {
            onPlayerSold?.(data);
        };

        const handlePlayerUnsold = (data) => {
            onPlayerUnsold?.(data);
        };

        const handleNextPlayer = (data) => {
            onNextPlayer?.(data);
        };

        const handleAuctionCompleted = (data) => {
            onAuctionCompleted?.(data);
        };

        const handleNotification = (data) => {
            onNotification?.(data);
        };

        socket.on("auction:started", handleAuctionStarted);
        socket.on("auction:paused", handleAuctionPaused);
        socket.on("auction:resumed", handleAuctionResumed);
        socket.on("auction:player_started", handlePlayerStarted);
        socket.on("auction:bid", handleBid);
        socket.on("auction:sold", handlePlayerSold);
        socket.on("auction:unsold", handlePlayerUnsold);
        socket.on("auction:next_player", handleNextPlayer);
        socket.on("auction:completed", handleAuctionCompleted);
        socket.on("auction:notification", handleNotification);

        const joinRoom = () => {
            joinAuctionRoom(auctionId);
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on("connect", joinRoom);

        return () => {
            socket.off("auction:started", handleAuctionStarted);
            socket.off("auction:paused", handleAuctionPaused);
            socket.off("auction:resumed", handleAuctionResumed);
            socket.off("auction:player_started", handlePlayerStarted);
            socket.off("auction:bid", handleBid);
            socket.off("auction:sold", handlePlayerSold);
            socket.off("auction:unsold", handlePlayerUnsold);
            socket.off("auction:next_player", handleNextPlayer);
            socket.off("auction:completed", handleAuctionCompleted);
            socket.off("auction:notification", handleNotification);

            socket.off("connect", joinRoom);

            leaveAuctionRoom(auctionId);
        };
    }, [
        auctionId,
        onAuctionStarted,
        onAuctionPaused,
        onAuctionResumed,
        onPlayerStarted,
        onBid,
        onPlayerSold,
        onPlayerUnsold,
        onNextPlayer,
        onAuctionCompleted,
        onNotification,
    ]);

    return getSocket();
}