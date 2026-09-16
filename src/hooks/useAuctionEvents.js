import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import { getSocket } from "../socket/socket";

const useAuctionEvents = ({
    auctionId,
    onAuctionStarted,
    onAuctionPaused,
    onAuctionResumed,
    onPlayerStarted,
    onBidNew,
    onPlayerSold,
    onPlayerUnsold,
    onNextPlayer,
    onAuctionCompleted,
}) => {
    const handleAuctionStarted = useCallback(
        (data) => {
            console.log("📢 auction:started", data);

            onAuctionStarted?.(data);
        },
        [onAuctionStarted],
    );

    const handleAuctionPaused = useCallback(
        (data) => {
            console.log("⏸️ auction:paused", data);

            onAuctionPaused?.(data);
        },
        [onAuctionPaused],
    );

    const handleAuctionResumed = useCallback(
        (data) => {
            console.log("▶️ auction:resumed", data);

            onAuctionResumed?.(data);
        },
        [onAuctionResumed],
    );

    const handlePlayerStarted = useCallback(
        (data) => {
            console.log("🏏 player:started", data);

            onPlayerStarted?.(data);

            toast.success("New player is now up for auction");
        },
        [onPlayerStarted],
    );

    const handleBidNew = useCallback(
        (data) => {
            console.log("💰 bid:new", data);

            onBidNew?.(data);
        },
        [onBidNew],
    );

    const handlePlayerSold = useCallback(
        (data) => {
            console.log("🔨 player:sold", data);

            onPlayerSold?.(data);

            toast.success("Player sold");
        },
        [onPlayerSold],
    );

    const handlePlayerUnsold = useCallback(
        (data) => {
            console.log("❌ player:unsold", data);

            onPlayerUnsold?.(data);

            toast("Player marked unsold", {
                icon: "❌",
            });
        },
        [onPlayerUnsold],
    );

    const handleNextPlayer = useCallback(
        (data) => {
            console.log("➡️ auction:next-player", data);

            onNextPlayer?.(data);
        },
        [onNextPlayer],
    );

    const handleAuctionCompleted = useCallback(
        (data) => {
            console.log("🏆 auction:completed", data);

            onAuctionCompleted?.(data);

            toast.success("Auction completed");
        },
        [onAuctionCompleted],
    );

    useEffect(() => {
        if (!auctionId) {
            return undefined;
        }

        const socket = getSocket();

        if (!socket) {
            return undefined;
        }

        socket.on(
            "auction:started",
            handleAuctionStarted,
        );

        socket.on(
            "auction:paused",
            handleAuctionPaused,
        );

        socket.on(
            "auction:resumed",
            handleAuctionResumed,
        );

        socket.on(
            "player:started",
            handlePlayerStarted,
        );

        socket.on(
            "bid:new",
            handleBidNew,
        );

        socket.on(
            "player:sold",
            handlePlayerSold,
        );

        socket.on(
            "player:unsold",
            handlePlayerUnsold,
        );

        socket.on(
            "auction:next-player",
            handleNextPlayer,
        );

        socket.on(
            "auction:completed",
            handleAuctionCompleted,
        );

        return () => {
            socket.off(
                "auction:started",
                handleAuctionStarted,
            );

            socket.off(
                "auction:paused",
                handleAuctionPaused,
            );

            socket.off(
                "auction:resumed",
                handleAuctionResumed,
            );

            socket.off(
                "player:started",
                handlePlayerStarted,
            );

            socket.off(
                "bid:new",
                handleBidNew,
            );

            socket.off(
                "player:sold",
                handlePlayerSold,
            );

            socket.off(
                "player:unsold",
                handlePlayerUnsold,
            );

            socket.off(
                "auction:next-player",
                handleNextPlayer,
            );

            socket.off(
                "auction:completed",
                handleAuctionCompleted,
            );
        };
    }, [
        auctionId,
        handleAuctionStarted,
        handleAuctionPaused,
        handleAuctionResumed,
        handlePlayerStarted,
        handleBidNew,
        handlePlayerSold,
        handlePlayerUnsold,
        handleNextPlayer,
        handleAuctionCompleted,
    ]);
};

export default useAuctionEvents;