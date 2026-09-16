import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

export default function TeamApprovalModal({
  isOpen,
  registrations = [],
  onClose,
  onApprove,
  onReject,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedId("");
    }
  }, [isOpen]);

  const pendingRegistrations = useMemo(() => {
    return registrations.filter(
      (registration) =>
        String(registration?.status || "pending").toLowerCase() === "pending",
    );
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return pendingRegistrations;
    }

    return pendingRegistrations.filter((registration) => {
      const team = registration?.team || {};

      const name = team?.name || registration?.teamName || "Team";

      const ownerName =
        team?.ownerName || registration?.registeredBy?.name || "";

      return (
        String(name).toLowerCase().includes(query) ||
        String(ownerName).toLowerCase().includes(query)
      );
    });
  }, [pendingRegistrations, search]);

  const selectedRegistration = registrations.find(
    (registration) =>
      String(registration?._id || registration?.id) === String(selectedId),
  );

  const getTeam = (registration) => registration?.team || {};

  const getTeamName = (registration) => {
    const team = getTeam(registration);

    return team?.name || registration?.teamName || "Team";
  };

  const getTeamLogo = (registration) => {
    const team = getTeam(registration);

    return team?.logo || team?.image || registration?.teamLogo || "";
  };

  const getTeamInitials = (registration) => {
    const name = getTeamName(registration);

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  };

  const getRegistrationId = (registration) =>
    registration?._id || registration?.id;

  const handleApprove = async () => {
    if (!selectedRegistration || loading) {
      return;
    }

    await onApprove(getRegistrationId(selectedRegistration));
  };

  const handleReject = async () => {
    if (!selectedRegistration || loading) {
      return;
    }

    await onReject(getRegistrationId(selectedRegistration));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-approval-title"
        className="
          relative
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-700/80
          bg-[#06152b]
          shadow-[0_25px_80px_rgba(0,0,0,0.65)]
        "
      >
        {/* Header glow */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-32 bg-cyan-500/10 blur-3xl" />

        {/* Header */}
        <div
          className="
            relative
            flex
            items-center
            justify-between
            border-b
            border-slate-700/80
            px-6
            py-5
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-cyan-500/15
                text-cyan-400
                ring-1
                ring-cyan-400/20
              "
            >
              <FiUsers size={25} />
            </div>

            <div>
              <h2
                id="team-approval-title"
                className="text-xl font-bold text-white"
              >
                Select Team
              </h2>

              <p className="mt-0.5 text-sm text-slate-400">
                Choose a team to approve for this auction
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
              disabled:opacity-40
            "
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-5">
          <div className="relative">
            <FiSearch
              size={19}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-700
                bg-[#081b34]
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
              "
            />
          </div>
        </div>

        {/* Team list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {loading && registrations.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="
                    h-[66px]
                    animate-pulse
                    rounded-xl
                    border
                    border-slate-700
                    bg-[#081b34]
                  "
                />
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div
              className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-slate-700
              "
            >
              <FiUsers size={38} className="text-slate-600" />

              <p className="mt-4 text-sm font-semibold text-slate-300">
                No pending teams
              </p>

              <p className="mt-1 max-w-sm text-center text-xs text-slate-500">
                Teams with pending auction registrations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRegistrations.map((registration) => {
                const id = getRegistrationId(registration);

                const teamName = getTeamName(registration);

                const logo = getTeamLogo(registration);

                const initials = getTeamInitials(registration);

                const isSelected = String(selectedId) === String(id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedId(id)}
                    disabled={loading}
                    className={`
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-left
                        transition-all
                        duration-200
                        disabled:cursor-not-allowed
                        ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_22px_rgba(34,211,238,0.08)]"
                            : "border-slate-700 bg-[#081b34]/80 hover:border-slate-500 hover:bg-[#0a213d]"
                        }
                      `}
                  >
                    {/* Radio */}
                    <span
                      className={`
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          ${isSelected ? "border-cyan-400" : "border-slate-500"}
                        `}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                      )}
                    </span>

                    {/* Team logo */}
                    <span
                      className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-lg
                          border
                          border-cyan-500/20
                          bg-cyan-500/5
                        "
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-cyan-400">
                          {initials}
                        </span>
                      )}
                    </span>

                    {/* Name */}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">
                        {teamName}
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-500">
                        Awaiting admin approval
                      </span>
                    </span>

                    {/* Status */}
                    <span
                      className="
                          hidden
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-amber-400/20
                          bg-amber-400/10
                          px-2.5
                          py-1
                          text-[11px]
                          font-medium
                          text-amber-300
                          sm:flex
                        "
                    >
                      <FiClock size={12} />
                      Pending
                    </span>

                    {isSelected && (
                      <FiCheck size={19} className="shrink-0 text-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="
            border-t
            border-slate-700/80
            bg-[#06152b]
            px-6
            py-4
          "
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiShield size={17} className="text-cyan-400" />

              <span>Pending Teams:</span>

              <strong className="text-white">
                {pendingRegistrations.length}
              </strong>
            </div>

            {selectedRegistration && (
              <span className="max-w-[200px] truncate text-xs text-cyan-400">
                {getTeamName(selectedRegistration)}
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
                disabled:opacity-40
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={!selectedRegistration || loading}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-red-400/20
                bg-red-500/10
                px-5
                text-sm
                font-semibold
                text-red-300
                transition
                hover:bg-red-500/20
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <FiXCircle size={17} />
              {loading ? "Processing..." : "Reject"}
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={!selectedRegistration || loading}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-cyan-500
                px-6
                text-sm
                font-bold
                text-slate-950
                shadow-lg
                shadow-cyan-500/10
                transition
                hover:bg-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <FiCheckCircle size={17} />
              {loading ? "Processing..." : "Approve Team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
