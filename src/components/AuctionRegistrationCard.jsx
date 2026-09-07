import { FiCheckCircle, FiClock, FiInfo, FiShield } from "react-icons/fi";

import RegistrationStatusBadge from "./RegistrationStatusBadge";

export default function AuctionRegistrationCard({
  auction,
  registration,
  onRegister,
  loading = false,
}) {
  const status = String(registration?.status || "").toLowerCase();

  const isApproved = status === "approved";

  const isPending = status === "pending";

  const isRejected = status === "rejected";

  const isCancelled = status === "cancelled";

  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-navy-700
        dark:bg-navy-900
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-cyan-500
            "
          >
            <FiShield size={18} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Auction Registration
            </span>
          </div>

          <h2
            className="
              mt-2
              font-display
              text-xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            {auction?.name || auction?.title || "Join this auction"}
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-gray-500
              dark:text-gray-400
            "
          >
            Register your team to participate in this auction.
          </p>
        </div>

        {registration?.status && (
          <RegistrationStatusBadge status={registration.status} />
        )}
      </div>

      {/* ============================================
          APPROVED
      ============================================ */}

      {isApproved && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-success-500/20
            bg-success-500/5
            p-4
          "
        >
          <div className="flex gap-3">
            <FiCheckCircle
              className="mt-0.5 shrink-0 text-success-500"
              size={19}
            />

            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-success-600
                  dark:text-success-500
                "
              >
                Registration approved
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Your team has been approved to participate in this auction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          PENDING
      ============================================ */}

      {isPending && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-warning-500/20
            bg-warning-500/5
            p-4
          "
        >
          <div className="flex gap-3">
            <FiClock className="mt-0.5 shrink-0 text-warning-500" size={19} />

            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-warning-500
                "
              >
                Waiting for approval
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Your registration has been submitted and is waiting for
                administrator approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          REJECTED
      ============================================ */}

      {isRejected && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-danger-500/20
            bg-danger-500/5
            p-4
          "
        >
          <div className="flex gap-3">
            <FiInfo className="mt-0.5 shrink-0 text-danger-500" size={19} />

            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-danger-500
                "
              >
                Registration rejected
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Your team registration was rejected. You can review the
                registration details before trying again if the backend permits
                it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          CANCELLED
      ============================================ */}

      {isCancelled && (
        <div
          className="
            mt-6
            rounded-xl
            bg-gray-500/5
            p-4
          "
        >
          <p
            className="
              text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            This registration has been cancelled.
          </p>
        </div>
      )}

      {/* ============================================
          REGISTER BUTTON
      ============================================ */}

      {!registration && (
        <button
          type="button"
          onClick={onRegister}
          disabled={loading}
          className="
            mt-6
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-cyan-500
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-cyan-400
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >
          {loading ? (
            <>
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />
              Registering...
            </>
          ) : (
            "Register for Auction"
          )}
        </button>
      )}
    </section>
  );
}
