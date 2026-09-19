import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiSearch, FiUsers, FiX } from "react-icons/fi";

const TeamSelectionModal = ({
  teams = [],
  selectedTeamId = "",
  onSelect,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  /* =========================================================
     RESET SEARCH
  ========================================================= */

  useEffect(() => {
    setSearchTerm("");
  }, []);

  /* =========================================================
     TEAM HELPERS
  ========================================================= */

  const getTeamId = (team) => {
    return team?._id || team?.id || "";
  };

  const getTeamName = (team) => {
    return team?.name || team?.teamName || team?.title || "Unnamed Team";
  };

  const getTeamLogo = (team) => {
    return team?.logo || team?.logoUrl || team?.image || team?.imageUrl || "";
  };

  const getInitials = (name) => {
    if (!name) {
      return "TM";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  /* =========================================================
     FILTER TEAMS
  ========================================================= */

  const filteredTeams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return teams;
    }

    return teams.filter((team) => {
      const name = getTeamName(team);

      return String(name).toLowerCase().includes(query);
    });
  }, [teams, searchTerm]);

  /* =========================================================
     TEAM SELECT
  ========================================================= */

  const handleSelect = (teamId) => {
    if (loading) {
      return;
    }

    onSelect?.(teamId);
  };

  /* =========================================================
     CONFIRM
  ========================================================= */

  const handleConfirm = () => {
    if (!selectedTeamId || loading) {
      return;
    }

    onConfirm?.();
  };

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  /* =========================================================
     PREVENT BODY SCROLL
  ========================================================= */

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /* =========================================================
     MODAL
  ========================================================= */

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        h-[100dvh]
        w-screen
        overflow-hidden
      "
      style={{
        position: "fixed",
        inset: 0,
      }}
    >
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-black/75
          backdrop-blur-md
        "
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loading) {
            onClose?.();
          }
        }}
      />

      {/* =====================================================
          CENTER CONTAINER

          IMPORTANT:
          This container does NOT scroll.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-3
          sm:p-5
        "
      >
        {/* ===================================================
            MODAL

            IMPORTANT:
            h-[90dvh] + max-h prevents entire modal scrolling.
        ==================================================== */}

        <div
          className="
            flex
            h-[calc(100dvh-24px)]
            max-h-[760px]
            w-full
            max-w-[680px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-700
            bg-[#07172c]
            shadow-[0_30px_100px_rgba(0,0,0,0.8)]
            sm:h-[calc(100dvh-40px)]
          "
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {/* =================================================
              HEADER

              NEVER SCROLLS
          ================================================== */}

          <div
            className="
              flex
              min-h-[82px]
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-700
              bg-[#07172c]
              px-5
              py-4
              sm:px-6
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              {/* Icon */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-400
                "
              >
                <FiUsers size={23} />
              </div>

              {/* Text */}

              <div className="min-w-0">
                <h2
                  className="
                    text-lg
                    font-bold
                    text-white
                    sm:text-xl
                  "
                >
                  Select Team
                </h2>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-xs
                    text-slate-400
                    sm:text-sm
                  "
                >
                  Choose a team to join the auction
                </p>
              </div>
            </div>

            {/* Close */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-800
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
          </div>

          {/* =================================================
              SEARCH

              NEVER SCROLLS
          ================================================== */}

          <div
            className="
              shrink-0
              bg-[#07172c]
              px-5
              py-4
              sm:px-6
            "
          >
            <div className="relative">
              <FiSearch
                size={19}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search teams..."
                disabled={loading}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#0a1d36]
                  pl-12
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  transition
                  focus:border-cyan-400
                  focus:ring-2
                  focus:ring-cyan-400/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />
            </div>
          </div>

          {/* =================================================
              TEAM LIST

              THIS IS THE ONLY SCROLLABLE AREA.
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              px-5
              py-1
              sm:px-6
            "
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredTeams.length === 0 ? (
              /* =============================================
                 EMPTY
              ============================================== */

              <div
                className="
                  flex
                  min-h-[250px]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-800
                    text-slate-500
                  "
                >
                  <FiUsers size={30} />
                </div>

                <h3
                  className="
                    mt-4
                    text-base
                    font-semibold
                    text-slate-300
                  "
                >
                  {searchTerm ? "No teams found" : "No teams available"}
                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-500
                  "
                >
                  {searchTerm
                    ? "Try another team name."
                    : "There are no teams available for this auction."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pb-3">
                {filteredTeams.map((team, index) => {
                  const teamId = getTeamId(team);

                  const teamName = getTeamName(team);

                  const teamLogo = getTeamLogo(team);

                  const isSelected = String(selectedTeamId) === String(teamId);

                  return (
                    <button
                      key={teamId || `team-${index}`}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelect(teamId)}
                      className={`
                          flex
                          min-h-[70px]
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          border
                          px-3
                          py-3
                          text-left
                          transition-all

                          ${
                            isSelected
                              ? `
                                border-cyan-400
                                bg-cyan-400/10
                              `
                              : `
                                border-slate-700
                                bg-[#0b1b32]
                                hover:border-slate-500
                                hover:bg-[#0e233f]
                              `
                          }

                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `}
                    >
                      {/* =================================
                            RADIO
                        ================================== */}

                      <span
                        className={`
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border-2

                            ${
                              isSelected
                                ? "border-cyan-400"
                                : "border-slate-500"
                            }
                          `}
                      >
                        {isSelected && (
                          <span
                            className="
                                h-2.5
                                w-2.5
                                rounded-full
                                bg-cyan-400
                              "
                          />
                        )}
                      </span>

                      {/* =================================
                            TEAM LOGO
                        ================================== */}

                      <span
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-xl
                            border
                            border-cyan-500/20
                            bg-[#07152a]
                          "
                      >
                        {teamLogo ? (
                          <img
                            src={teamLogo}
                            alt=""
                            className="
                                h-full
                                w-full
                                object-cover
                              "
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              const parent = event.currentTarget.parentElement;

                              if (parent) {
                                parent.innerHTML = `<span style="color:#22d3ee;font-size:12px;font-weight:700;">${getInitials(teamName)}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="
                                text-xs
                                font-bold
                                text-cyan-400
                              "
                          >
                            {getInitials(teamName)}
                          </span>
                        )}
                      </span>

                      {/* =================================
                            NAME
                        ================================== */}

                      <span
                        className="
                            min-w-0
                            flex-1
                          "
                      >
                        <span
                          className="
                              block
                              truncate
                              text-sm
                              font-semibold
                              text-white
                            "
                        >
                          {teamName}
                        </span>

                        <span
                          className="
                              mt-0.5
                              block
                              text-xs
                              text-slate-500
                            "
                        >
                          Available for registration
                        </span>
                      </span>

                      {/* =================================
                            CHECK
                        ================================== */}

                      {isSelected && (
                        <span
                          className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-cyan-400/10
                            "
                        >
                          <FiCheck size={18} className="text-cyan-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =================================================
              FOOTER

              NEVER SCROLLS
          ================================================== */}

          <div
            className="
              min-h-[90px]
              shrink-0
              border-t
              border-slate-700
              bg-[#07172c]
              px-5
              py-4
              sm:px-6
            "
          >
            <div
              className="
                mb-3
                flex
                items-center
                justify-start
                gap-4
              "
            >
              <span
                className="
                  text-xs
                  text-slate-400
                  sm:text-sm
                "
              >
                Total Teams:
              </span>

              <span
                className="
                  text-sm
                  font-bold
                  text-white
                "
              >
                {teams.length}
              </span>
            </div>

            <div
              className="
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
                sm:justify-end
              "
            >
              {/* Cancel */}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="
                  h-11
                  rounded-xl
                  border
                  border-slate-700
                  px-6
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:bg-slate-800
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Cancel
              </button>

              {/* Confirm */}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedTeamId || loading}
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-cyan-500
                  px-7
                  text-sm
                  font-bold
                  text-slate-950
                  transition
                  hover:bg-cyan-400
                  disabled:cursor-not-allowed
                  disabled:opacity-40
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
                        border-slate-950/30
                        border-t-slate-950
                      "
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    <FiCheck size={17} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =========================================================
     IMPORTANT:
     PORTAL RENDERS OUTSIDE DASHBOARD LAYOUT.

     This prevents parent overflow/transform CSS from
     breaking fixed modal scrolling.
  ========================================================= */

  return createPortal(modal, document.body);
};

export default TeamSelectionModal;
