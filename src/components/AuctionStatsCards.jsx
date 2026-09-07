import {
  FiActivity,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiUserCheck,
} from "react-icons/fi";

import formatCurrency from "../utils/formatCurrency";

function getValue(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

export default function AuctionStatsCards({ summary = {} }) {
  const totalPlayers = getValue(
    summary.totalPlayers ?? summary.totalPlayersCount ?? summary.players,
  );

  const soldPlayers = getValue(
    summary.soldPlayers ?? summary.totalSold ?? summary.sold,
  );

  const unsoldPlayers = getValue(
    summary.unsoldPlayers ?? summary.totalUnsold ?? summary.unsold,
  );

  const totalBids = getValue(summary.totalBids ?? summary.bids);

  const totalSpent = getValue(
    summary.totalSpent ?? summary.totalSpending ?? summary.totalAmount,
  );

  const averagePrice = getValue(
    summary.averageSellingPrice ?? summary.averagePrice,
  );

  const cards = [
    {
      label: "Total Players",
      value: totalPlayers,
      icon: FiUsers,
    },
    {
      label: "Players Sold",
      value: soldPlayers,
      icon: FiUserCheck,
    },
    {
      label: "Players Unsold",
      value: unsoldPlayers,
      icon: FiShoppingBag,
    },
    {
      label: "Total Bids",
      value: totalBids,
      icon: FiActivity,
    },
    {
      label: "Total Spending",
      value: formatCurrency(totalSpent),
      icon: FiDollarSign,
    },
    {
      label: "Average Sale",
      value: formatCurrency(averagePrice),
      icon: FiTrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="
              rounded-2xl
              border
              border-navy-700
              bg-navy-900
              p-5
              shadow-sm
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  {card.label}
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {card.value}
                </p>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-400
                "
              >
                <Icon size={21} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
