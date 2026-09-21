import { formatCurrency } from "../../utils/formatCurrency";

/** Auction facts, including the full Auction ID. */
const AuctionInfoCard = ({ auction, auctionId, status, nextBid = 0 }) => {
  const rows = [
    ["Auction", auction?.name || "—"],
    ["Status", String(status || "waiting").replace(/_/g, " ")],
    ["Minimum bid", formatCurrency(auction?.minimumBid || 0)],
    ["Bid increment", formatCurrency(auction?.bidIncrement || 0)],
    ["Next bid", formatCurrency(nextBid)],
    ["Max players / team", auction?.maxPlayersPerTeam || "—"],
  ];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Auction details
      </p>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Auction ID
        </p>

        <p className="mt-0.5 break-all font-mono text-sm font-bold text-white">
          {auctionId}
        </p>
      </div>

      <dl className="mt-3 divide-y divide-slate-800">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <dt className="text-slate-400">{label}</dt>

            <dd className="text-right font-bold capitalize text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default AuctionInfoCard;
