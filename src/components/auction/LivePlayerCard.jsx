import { useState } from "react";
import { FiUser } from "react-icons/fi";

import RupeeIcon from "../RupeeIcon";
import { formatCurrency } from "../../utils/formatCurrency";
import { toImageUrl } from "../../utils/imageUrl";
import { getEntityId, shortId } from "../../utils/teamInfo";

const getPlayerName = (player) => {
  if (!player) return "Waiting for player";

  return (
    [player.fullName || player.firstName || player.name, player.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unknown Player"
  );
};

const label = (value) => String(value || "").replace(/[_-]/g, " ");

const STATUS = {
  auctioning: { text: "Live", className: "bg-red-500 text-white", pulse: true },
  sold: { text: "Sold", className: "bg-emerald-500 text-slate-950" },
  unsold: { text: "Unsold", className: "bg-slate-500 text-white" },
  available: { text: "Up next", className: "bg-sky-500 text-slate-950" },
};

/** Left-side player card of the live bidding dashboard. */
const LivePlayerCard = ({ player, fallbackBasePrice = 0 }) => {
  const [failedPhoto, setFailedPhoto] = useState("");

  if (!player) {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-800 to-slate-950 p-6 text-center">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500 ring-1 ring-slate-700">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/20" />
            <FiUser className="relative h-8 w-8" />
          </span>

          <div>
            <p className="text-lg font-black text-white">
              Waiting for the next player
            </p>

            <p className="mt-1 text-sm text-slate-400">
              The auctioneer will bring the next player in shortly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const photo =
    toImageUrl(player.photo) ||
    toImageUrl(player.image) ||
    toImageUrl(player.profileImage);

  const name = getPlayerName(player);
  const playerId = getEntityId(player);
  const basePrice = Number(player.basePrice ?? fallbackBasePrice ?? 0);

  const status = STATUS[String(player.status || "").toLowerCase()] || STATUS.auctioning;

  const details = [
    ["Age", player.age ? `${player.age} yrs` : ""],
    ["Batting", label(player.battingHand)],
    ["Bowling", label(player.bowlingStyle)],
    ["Village / Town", player.villageTown],
    ["Experience", player.experience],
  ].filter(([, value]) => value);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-slate-800 to-slate-950">
        {photo && photo !== failedPhoto ? (
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setFailedPhoto(photo)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FiUser className="h-28 w-28 text-slate-600" />
          </div>
        )}

        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${status.className}`}
        >
          {status.pulse && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          )}
          {status.text}
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-5 pt-20">
          {player.role && (
            <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/40">
              {label(player.role)}
            </span>
          )}

          <h2 className="mt-2 text-3xl font-black leading-tight text-white">
            {name}
          </h2>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
            <RupeeIcon className="h-4 w-4" />
            Base price
          </div>

          <p className="text-xl font-black text-amber-300">
            {formatCurrency(basePrice)}
          </p>
        </div>

        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {details.map(([title, value]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {title}
                </p>

                <p className="mt-0.5 truncate text-sm font-bold capitalize text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {playerId && (
          <p className="text-center text-[11px] text-slate-500">
            Player ID{" "}
            <span className="font-mono text-slate-400" title={playerId}>
              …{shortId(playerId, 8)}
            </span>
          </p>
        )}
      </div>
    </section>
  );
};

export default LivePlayerCard;
