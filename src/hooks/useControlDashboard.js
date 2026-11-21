import { useCallback, useEffect, useRef, useState } from "react";
import { getControlDashboard } from "../api/auctionControlApi";
import useSocket from "./useSocket";

/**
 * Loads the admin control dashboard and keeps it fresh: it reloads when the
 * server pushes any auction event (bid, sale, next player, pause...), so two
 * admin screens never drift apart.
 */
const EVENTS = [
  "auction:started",
  "auction:paused",
  "auction:resumed",
  "auction:completed",
  "auction:next-player",
  "bid:new",
  "player:sold",
  "player:unsold",
  "player:rollback",
];

export default function useControlDashboard(auctionId) {
  const { socket, connected } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timer = useRef(null);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!auctionId) return null;
      if (!silent) setLoading(true);
      try {
        const result = await getControlDashboard(auctionId);
        setData(result);
        setError("");
        return result;
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load the auction.");
        return null;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [auctionId],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket || !connected || !auctionId) return undefined;
    socket.emit("auction:join", { auctionId });

    // Several events can arrive together (sold + next player): reload once.
    const refresh = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => load({ silent: true }), 150);
    };
    EVENTS.forEach((name) => socket.on(name, refresh));

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((name) => socket.off(name, refresh));
      socket.emit("auction:leave", { auctionId });
    };
  }, [socket, connected, auctionId, load]);

  return { data, loading, error, reload: load, connected };
}
