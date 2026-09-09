import { useEffect } from "react";

/**
 * useAuctionEvents
 *
 * Centralized Socket.IO event listener for AuctionPro.
 *
 * Supported events:
 * - auction:started
 * - auction:paused
 * - auction:resumed
 * - player:started
 * - bid:new
 * - player:sold
 * - player:unsold
 * - auction:next-player
 * - auction:completed
 *
 * Usage:
 *
 * useAuctionEvents({
 *     socket,
 *     enabled: Boolean(socket),
 *     onAuctionStarted: handleAuctionStarted,
 *     onAuctionPaused: handleAuctionPaused,
 *     onAuctionResumed: handleAuctionResumed,
 *     onPlayerStarted: handlePlayerStarted,
 *     onBidNew: handleBidNew,
 *     onPlayerSold: handlePlayerSold,
 *     onPlayerUnsold: handlePlayerUnsold,
 *     onNextPlayer: handleNextPlayer,
 *     onAuctionCompleted: handleAuctionCompleted,
 * });
 */

const useAuctionEvents = ({
    socket,
    enabled = true,

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
    useEffect(() => {
        if (!socket || !enabled) {
            return;
        }

        /* =====================================================
           EVENT HANDLERS
        ===================================================== */

        const handleAuctionStarted = (data) => {
            console.log(
                "🟢 Auction started:",
                data
            );

            if (onAuctionStarted) {
                onAuctionStarted(data);
            }
        };

        const handleAuctionPaused = (data) => {
            console.log(
                "⏸️ Auction paused:",
                data
            );

            if (onAuctionPaused) {
                onAuctionPaused(data);
            }
        };

        const handleAuctionResumed = (data) => {
            console.log(
                "▶️ Auction resumed:",
                data
            );

            if (onAuctionResumed) {
                onAuctionResumed(data);
            }
        };

        const handlePlayerStarted = (data) => {
            console.log(
                "🏏 Player started:",
                data
            );

            if (onPlayerStarted) {
                onPlayerStarted(data);
            }
        };

        const handleBidNew = (data) => {
            console.log(
                "💰 New bid:",
                data
            );

            if (onBidNew) {
                onBidNew(data);
            }
        };

        const handlePlayerSold = (data) => {
            console.log(
                "🔨 Player sold:",
                data
            );

            if (onPlayerSold) {
                onPlayerSold(data);
            }
        };

        const handlePlayerUnsold = (data) => {
            console.log(
                "❌ Player unsold:",
                data
            );

            if (onPlayerUnsold) {
                onPlayerUnsold(data);
            }
        };

        const handleNextPlayer = (data) => {
            console.log(
                "➡️ Next player:",
                data
            );

            if (onNextPlayer) {
                onNextPlayer(data);
            }
        };

        const handleAuctionCompleted = (data) => {
            console.log(
                "🏆 Auction completed:",
                data
            );

            if (onAuctionCompleted) {
                onAuctionCompleted(data);
            }
        };

        /* =====================================================
           REGISTER SOCKET EVENTS
        ===================================================== */

        socket.on(
            "auction:started",
            handleAuctionStarted
        );

        socket.on(
            "auction:paused",
            handleAuctionPaused
        );

        socket.on(
            "auction:resumed",
            handleAuctionResumed
        );

        socket.on(
            "player:started",
            handlePlayerStarted
        );

        socket.on(
            "bid:new",
            handleBidNew
        );

        socket.on(
            "player:sold",
            handlePlayerSold
        );

        socket.on(
            "player:unsold",
            handlePlayerUnsold
        );

        socket.on(
            "auction:next-player",
            handleNextPlayer
        );

        socket.on(
            "auction:completed",
            handleAuctionCompleted
        );

        /* =====================================================
           CLEANUP
        ===================================================== */

        return () => {
            socket.off(
                "auction:started",
                handleAuctionStarted
            );

            socket.off(
                "auction:paused",
                handleAuctionPaused
            );

            socket.off(
                "auction:resumed",
                handleAuctionResumed
            );

            socket.off(
                "player:started",
                handlePlayerStarted
            );

            socket.off(
                "bid:new",
                handleBidNew
            );

            socket.off(
                "player:sold",
                handlePlayerSold
            );

            socket.off(
                "player:unsold",
                handlePlayerUnsold
            );

            socket.off(
                "auction:next-player",
                handleNextPlayer
            );

            socket.off(
                "auction:completed",
                handleAuctionCompleted
            );
        };
    }, [
        socket,
        enabled,

        onAuctionStarted,
        onAuctionPaused,
        onAuctionResumed,

        onPlayerStarted,

        onBidNew,

        onPlayerSold,
        onPlayerUnsold,

        onNextPlayer,

        onAuctionCompleted,
    ]);
};

export default useAuctionEvents;