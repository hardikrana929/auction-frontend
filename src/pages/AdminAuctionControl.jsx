import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCopy,
  FiFlag,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSkipForward,
  FiXCircle,
} from "react-icons/fi";

import { useConfirmDialog } from "../context/ConfirmDialogContext";
import useControlDashboard from "../hooks/useControlDashboard";
import {
  completeAuction,
  pauseAuction,
  resumeAuction,
  setSelectionMode,
  startAuction,
  startNextPlayer,
} from "../api/auctionControlApi";
import {
  markPlayerUnsold,
  raiseBid,
  rollbackSale,
  sellPlayer,
  undoRaise,
} from "../api/biddingApi";
import AuctionStatusBadge from "../components/auction/AuctionStatusBadge";
import ErrorState from "../components/ErrorState";
import LoadingScreen from "../components/LoadingScreen";
import {
  BiddingPanel,
  BidHistoryList,
  Money,
  PlayerDetailsCard,
  RecentSales,
  TeamBuyList,
} from "../components/control/ControlParts";
import { copyText } from "../utils/clipboard";

const MODES = [
  { value: "order", label: "By order" },
  { value: "manual", label: "Manual (auction ID)" },
  { value: "random", label: "Random" },
];

/**
 * Admin control dashboard.
 *
 *   Player details | Current bidding  [Bidding]
 *                  | Team list        [Buy player] per team
 *   Bidding history of the current player
 *
 * Teams never bid. The admin presses "Bidding" each time a team raises a hand
 * and "Buy player" on the team that wins. A team whose remaining budget is
 * below the current bid has its Buy button disabled.
 */
export default function AdminAuctionControl() {
  const { auctionId } = useParams();
  const { confirm } = useConfirmDialog();
  const { data, loading, error, reload, connected } =
    useControlDashboard(auctionId);

  const [busy, setBusy] = useState(false);
  const [manualId, setManualId] = useState("");

  const auction = data?.auction;
  const status = auction?.status;
  const paused = Boolean(data?.session?.isPaused);
  const onTheBlock = Boolean(data?.onTheBlock);
  const player = data?.currentPlayer;
  const bidding = data?.bidding || { bids: [], currentBid: 0 };
  const mode = auction?.playerSelectionMode || "order";

  const run = async (action, successMessage) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) toast.success(successMessage(result));
      await reload({ silent: true });
      return result;
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
      await reload({ silent: true });
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  const startLabel = useMemo(
    () => (status === "completed" ? "Make live again" : "Start auction"),
    [status],
  );

  if (loading && !data) return <LoadingScreen label="Loading auction control..." />;
  if (error && !data) return <ErrorState title="Unable to load auction" message={error} onRetry={reload} />;
  if (!auction) return null;

  const live = status === "live";
  const canNext = live && !paused && !onTheBlock;
  const manualOptions = data.availablePlayers || [];

  /* ---------------------------------------------------------- handlers */
  const handleStart = () =>
    run(() => startAuction(auctionId), (r) => r.message || "Auction is live");

  const handleComplete = async () => {
    if (onTheBlock) {
      toast.error("Sell the current player or mark them unsold first.");
      return;
    }
    const ok = await confirm({
      title: "Complete this auction?",
      message:
        "Bidding closes for everyone. You can make the auction live again later if needed.",
      confirmText: "Complete auction",
      tone: "primary",
    });
    if (!ok) return;
    setBusy(true);
    try {
      try {
        await completeAuction({ auctionId });
      } catch (e) {
        if (e.response?.data?.code !== "REMAINING_PLAYERS") throw e;
        const force = await confirm({
          title: "Players are still waiting",
          message: `${e.response.data.remainingPlayers} player(s) have not been auctioned. Complete anyway?`,
          confirmText: "Complete anyway",
          tone: "primary",
        });
        if (!force) return;
        await completeAuction({ auctionId, force: true });
      }
      toast.success("Auction completed");
      await reload({ silent: true });
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to complete auction");
    } finally {
      setBusy(false);
    }
  };

  const handleNext = () => {
    const body = { auctionId };
    if (mode === "manual") {
      const typed = manualId.trim();
      if (!typed) {
        toast.error("Enter the auction ID or choose a player from the list.");
        return;
      }
      // A value that is all digits is the auction number, anything else a player id.
      if (/^\d+$/.test(typed)) body.auctionNumber = Number(typed);
      else body.playerId = typed;
    }
    return run(
      () => startNextPlayer(body),
      () => "Player is on the block",
    ).then((ok) => ok && setManualId(""));
  };

  const handleBuy = async (team) => {
    const ok = await confirm({
      title: `Sell to ${team.name}?`,
      message: `${player.fullName} ${player.lastName || ""} will be sold to ${team.name} for ₹${Number(bidding.currentBid).toLocaleString("en-IN")}. The amount is deducted from the team's purse.`,
      confirmText: "Buy player",
      tone: "primary",
    });
    if (!ok) return;
    run(
      () => sellPlayer({ auctionId, playerId: player._id, teamId: team._id }),
      (r) => r.message,
    );
  };

  const handleUnsold = async () => {
    const ok = await confirm({
      title: "Mark player unsold?",
      message: "No team bought the player. You can re-auction an unsold player later from Player Management.",
      confirmText: "Mark unsold",
    });
    if (ok)
      run(() => markPlayerUnsold({ auctionId, playerId: player._id }), () => "Player marked unsold");
  };

  const handleRollback = async (sale) => {
    const ok = await confirm({
      title: "Roll back this sale?",
      message: `${sale.player.fullName} was sold to ${sale.team?.name || "a team"} for ₹${Number(sale.price).toLocaleString("en-IN")}. The money is returned to that team and the player goes back on the block so you can sell him again.`,
      confirmText: "Roll back sale",
    });
    if (ok)
      run(
        () => rollbackSale({ auctionId, playerId: sale.player._id }),
        (r) => r.message,
      );
  };

  const changeMode = (value) =>
    run(
      () => setSelectionMode(auctionId, value),
      () => "Player selection updated",
    );

  const copyPublicLink = async () => {
    const ok = await copyText(`${window.location.origin}/live/${auctionId}`);
    if (ok) toast.success("Public live link copied");
    else toast.error("Could not copy the link");
  };

  /* ------------------------------------------------------------ render */
  return (
    <div className="page-container space-y-5">
      {/* header */}
      <div className="surface-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/auctions" className="icon-btn" aria-label="Back" title="Back">
            <FiArrowLeft />
          </Link>
          <div>
            <p className="eyebrow">Auction control</p>
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
              {auction.name}
              <AuctionStatusBadge status={paused && live ? "paused" : status} />
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sold {data.stats.sold} · Unsold {data.stats.unsold} · Waiting {data.stats.available}
              {" · "}
              <span className={connected ? "text-emerald-600" : "text-red-600"}>
                {connected ? "Live updates on" : "Reconnecting…"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="secondary-btn" onClick={() => reload()} title="Refresh">
            <FiRefreshCw />
          </button>
          <button className="secondary-btn" onClick={copyPublicLink} title="Anyone can watch with this link, no login">
            <FiCopy /> Public live link
          </button>
          {!live && (
            <button className="primary-btn" onClick={handleStart} disabled={busy}>
              <FiPlay /> {startLabel}
            </button>
          )}
          {live && !paused && (
            <button className="secondary-btn" onClick={() => run(() => pauseAuction(auctionId), () => "Auction paused")} disabled={busy}>
              <FiPause /> Pause
            </button>
          )}
          {live && paused && (
            <button className="primary-btn" onClick={() => run(() => resumeAuction(auctionId), () => "Auction resumed")} disabled={busy}>
              <FiPlay /> Resume
            </button>
          )}
          {live && (
            <button className="secondary-btn" onClick={handleComplete} disabled={busy}>
              <FiFlag /> Complete
            </button>
          )}
        </div>
      </div>

      {/* next player: depends on the selection mode */}
      {live && (
        <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
          <div>
            <label className="label" htmlFor="selection-mode">Next player is picked</label>
            <select
              id="selection-mode"
              className="input"
              value={mode}
              onChange={(e) => changeMode(e.target.value)}
              disabled={busy}
            >
              {MODES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          {mode === "manual" && (
            <div className="min-w-0 flex-1">
              <label className="label" htmlFor="manual-player">Auction ID or player</label>
              <div className="flex gap-2">
                <input
                  id="manual-player"
                  className="input w-28"
                  inputMode="numeric"
                  placeholder="e.g. 12"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                />
                <select
                  className="input min-w-0 flex-1"
                  value=""
                  onChange={(e) => setManualId(e.target.value)}
                  aria-label="Choose a waiting player"
                >
                  <option value="">Choose from {manualOptions.length} waiting player(s)…</option>
                  {manualOptions.map((item) => (
                    <option key={item._id} value={item.auctionNumber || item._id}>
                      {item.auctionNumber ? `#${item.auctionNumber} · ` : ""}
                      {item.fullName} {item.lastName} ({item.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 lg:ml-auto">
            <button className="primary-btn disabled:opacity-50" onClick={handleNext} disabled={!canNext || busy}>
              <FiSkipForward /> {mode === "random" ? "Pick random player" : "Next player"}
            </button>
            <button className="secondary-btn disabled:opacity-50" onClick={handleUnsold} disabled={!onTheBlock || paused || busy}>
              <FiXCircle /> Unsold
            </button>
          </div>
        </div>
      )}

      {status === "completed" && (
        <div className="surface-card flex items-center gap-3 p-4 text-sm text-slate-600 dark:text-slate-300">
          <FiCheckCircle className="shrink-0 text-xl text-violet-500" />
          This auction is completed. Use “Make live again” to continue (for
          example after adding players or rolling back a sale).
        </div>
      )}
      {paused && live && (
        <div className="surface-card p-4 text-sm font-semibold text-amber-700 dark:text-amber-300">
          The auction is paused. Resume it to continue bidding.
        </div>
      )}

      {/* main board */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <PlayerDetailsCard player={player} onTheBlock={onTheBlock} />
        <div className="space-y-5">
          <BiddingPanel
            bidding={bidding}
            onTheBlock={onTheBlock}
            paused={paused || !live}
            busy={busy}
            canUndo={bidding.bids.length > 0}
            onRaise={() => run(() => raiseBid({ auctionId, playerId: player._id }))}
            onUndo={() => run(() => undoRaise({ auctionId, playerId: player._id }), () => "Last bid removed")}
          />
          <TeamBuyList
            teams={data.teams}
            onTheBlock={onTheBlock}
            paused={paused || !live}
            busy={busy}
            currentBid={bidding.currentBid}
            onBuy={handleBuy}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BidHistoryList bids={bidding.bids} />
        <RecentSales
          sales={data.recentSales}
          canRollback={live}
          busy={busy}
          onRollback={handleRollback}
        />
      </div>
    </div>
  );
}
