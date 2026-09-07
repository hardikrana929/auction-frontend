import { FiCheck, FiUsers, FiX } from "react-icons/fi";

export default function AuctionRegistrationModal({
  teams = [],
  selectedTeamId,
  setSelectedTeamId,
  onClose,
  onSubmit,
  loading = false,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          dark:bg-navy-900
        "
      >
        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-200
            px-6
            py-5
            dark:border-navy-700
          "
        >
          <div>
            <h2
              id="registration-modal-title"
              className="
                font-display
                text-xl
                font-bold
                text-navy-950
                dark:text-white
              "
            >
              Register Team
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Select the team you want to register.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close registration dialog"
            className="
              rounded-lg
              p-2
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-navy-950
              dark:hover:bg-navy-800
              dark:hover:text-white
            "
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="p-6">
          {teams.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-pitch-50
                p-6
                text-center
                dark:border-navy-700
                dark:bg-navy-850
              "
            >
              <FiUsers
                size={25}
                className="
                  mx-auto
                  text-gray-400
                "
              />

              <h3
                className="
                  mt-3
                  font-semibold
                  text-navy-950
                  dark:text-white
                "
              >
                No teams available
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                You need an available team before registering for an auction.
              </p>
            </div>
          ) : (
            <fieldset>
              <legend
                className="
                  mb-3
                  text-sm
                  font-semibold
                  text-navy-950
                  dark:text-white
                "
              >
                Select team
              </legend>

              <div className="space-y-3">
                {teams.map((team) => {
                  const teamId = team?._id || team?.id;

                  const teamName = team?.name || team?.teamName || "Team";

                  const selected = selectedTeamId === teamId;

                  return (
                    <label
                      key={teamId}
                      className={`
                        flex
                        cursor-pointer
                        items-center
                        gap-4
                        rounded-xl
                        border
                        p-4
                        transition
                        ${
                          selected
                            ? "border-cyan-500 bg-cyan-500/5"
                            : "border-gray-200 dark:border-navy-700"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="auction-team"
                        value={teamId}
                        checked={selected}
                        onChange={() => setSelectedTeamId(teamId)}
                        className="
                          h-4
                          w-4
                          accent-cyan-500
                        "
                      />

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-navy-900
                          text-sm
                          font-bold
                          text-cyan-400
                        "
                      >
                        {teamName.slice(0, 2).toUpperCase()}
                      </div>

                      <span
                        className="
                          flex-1
                          text-sm
                          font-semibold
                          text-navy-950
                          dark:text-white
                        "
                      >
                        {teamName}
                      </span>

                      {selected && (
                        <FiCheck className="text-cyan-500" size={19} />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>

        {/* Footer */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-gray-200
            p-6
            sm:flex-row
            sm:justify-end
            dark:border-navy-700
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              rounded-xl
              border
              border-gray-200
              px-5
              py-3
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-50
              disabled:opacity-50
              dark:border-navy-700
              dark:text-gray-300
              dark:hover:bg-navy-800
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !selectedTeamId}
            className="
              inline-flex
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
              disabled:opacity-50
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
                Submitting...
              </>
            ) : (
              <>
                <FiCheck size={16} />
                Submit Registration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
