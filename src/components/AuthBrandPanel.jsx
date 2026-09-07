import { FiCheckCircle } from "react-icons/fi";

export default function AuthBrandPanel({
  title = "The professional way to run",
  highlight = "cricket auctions.",
  description = "Manage teams, players, registrations and real-time bidding from one powerful platform.",
}) {
  return (
    <div
      className="
        relative hidden overflow-hidden
        border-r border-gray-200
        bg-white
        lg:flex lg:w-1/2
        lg:items-center lg:justify-center
        dark:border-navy-800
        dark:bg-navy-950
      "
    >
      {/* Decorative circles */}
      <div
        className="
          absolute -left-32 -top-32
          h-80 w-80 rounded-full
          bg-cyan-400/10 blur-3xl
        "
      />

      <div
        className="
          absolute -bottom-32 -right-32
          h-80 w-80 rounded-full
          bg-cyan-500/10 blur-3xl
        "
      />

      {/* Content */}
      <div className="relative z-10 max-w-xl px-12">
        {/* Brand */}
        <div className="mb-8">
          <p
            className="
              mb-3 text-sm font-bold
              uppercase tracking-[0.35em]
              text-cyan-500
            "
          >
            AuctionPro
          </p>

          <h1
            className="
              font-display text-5xl font-bold
              leading-tight
              text-navy-950
              dark:text-white
            "
          >
            {title} <span className="text-cyan-500">{highlight}</span>
          </h1>

          <p
            className="
              mt-6 max-w-lg
              text-lg leading-8
              text-gray-600
              dark:text-gray-400
            "
          >
            {description}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <Feature text="Real-time player bidding" />

          <Feature text="Professional auction management" />

          <Feature text="Teams, players and auction statistics" />
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-lg
          bg-cyan-500/10
          text-cyan-500
        "
      >
        <FiCheckCircle size={18} />
      </div>

      <span
        className="
          text-sm font-medium
          text-gray-700
          dark:text-gray-300
        "
      >
        {text}
      </span>
    </div>
  );
}
