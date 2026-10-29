import { useCallback, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiXCircle,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getAuctionById } from "../api/auctionApi";
import { getTeamsByAuction } from "../api/teamApi";
import {
  getRegistrationStatus,
  registerForAuction,
} from "../api/auctionRegistrationApi";

import AuctionRegistrationModal from "../components/AuctionRegistrationModal";
import RegistrationStatusBadge from "../components/RegistrationStatusBadge";

export default function AuctionRegistration() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [teams, setTeams] = useState([]);
  const [registration, setRegistration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");

  /*
   * ----------------------------------------------------
   * Normalize API response
   * ----------------------------------------------------
   *
   * Supports:
   *
   * {
   *   success: true,
   *   registration: {...}
   * }
   *
   * OR:
   *
   * {
   *   data: {
   *     registration: {...}
   *   }
   * }
   */
  const extractRegistration = useCallback((response) => {
    if (!response) {
      return null;
    }

    if (response?.registration) {
      return response.registration;
    }

    if (response?.data?.registration) {
      return response.data.registration;
    }

    /*
     * Some API wrappers may return the registration
     * object directly.
     */
    if (response?._id && response?.status) {
      return response;
    }

    if (response?.data?._id && response?.data?.status) {
      return response.data;
    }

    return null;
  }, []);

  /*
   * ----------------------------------------------------
   * Load auction
   * ----------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    const loadAuction = async () => {
      if (!id) {
        setError("Auction ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getAuctionById(id);

        console.log("AUCTION RESPONSE:", response);

        const auctionData =
          response?.data?.auction ||
          response?.auction ||
          response?.data ||
          response;

        if (!mounted) {
          return;
        }

        if (!auctionData || !auctionData?._id) {
          throw new Error("Auction information could not be loaded.");
        }

        setAuction(auctionData);
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error("Load auction error:", err);

        const message =
          err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load auction.";

        setError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAuction();

    return () => {
      mounted = false;
    };
  }, [id]);

  /*
   * ----------------------------------------------------
   * Check registration status
   * ----------------------------------------------------
   */
  const checkRegistrationStatus = useCallback(
    async (auctionId, teamId, showError = false) => {
      if (!auctionId || !teamId) {
        return null;
      }

      try {
        const response = await getRegistrationStatus(auctionId, teamId);

        console.log("REGISTRATION STATUS RESPONSE:", response);

        /*
         * Backend may explicitly say there is no
         * registration.
         */
        if (response?.registered === false) {
          setRegistration(null);
          return null;
        }

        const registrationData = extractRegistration(response);

        if (!registrationData) {
          console.warn("Registration object not found:", response);

          return null;
        }

        /*
         * Normalize status to lowercase.
         */
        const normalizedRegistration = {
          ...registrationData,
          status: registrationData?.status
            ? String(registrationData.status).toLowerCase()
            : "",
        };

        setRegistration(normalizedRegistration);

        return normalizedRegistration;
      } catch (err) {
        console.error("Check registration status error:", err);

        /*
         * Status polling must NEVER crash the page.
         */
        if (showError) {
          toast.error(
            err?.normalizedMessage ||
              err?.response?.data?.message ||
              err?.message ||
              "Unable to check registration status.",
          );
        }

        return null;
      }
    },
    [extractRegistration],
  );

  /*
   * ----------------------------------------------------
   * Load registration after page refresh
   * ----------------------------------------------------
   *
   * We don't know the team ID initially.
   *
   * Therefore we load the user's teams and check each
   * team for an existing registration.
   */
  const loadExistingRegistration = useCallback(
    async (auctionId) => {
      if (!auctionId) {
        return;
      }

      try {
        const response = await getTeamsByAuction(auctionId);

        console.log("TEAMS RESPONSE:", response);

        let teamList = [];

        if (Array.isArray(response)) {
          teamList = response;
        } else if (Array.isArray(response?.data)) {
          teamList = response.data;
        } else if (Array.isArray(response?.teams)) {
          teamList = response.teams;
        } else if (Array.isArray(response?.data?.teams)) {
          teamList = response.data.teams;
        } else if (Array.isArray(response?.data?.data)) {
          teamList = response.data.data;
        }

        /*
         * Keep only valid team records.
         */
        teamList = teamList.filter((team) => team && (team?._id || team?.id));

        setTeams(teamList);

        /*
         * Check existing registration for each team.
         *
         * Stop once a registration is found.
         */
        for (const team of teamList) {
          const teamId = team?._id || team?.id;

          if (!teamId) {
            continue;
          }

          const existingRegistration = await checkRegistrationStatus(
            auctionId,
            teamId,
            false,
          );

          if (existingRegistration) {
            setSelectedTeamId(String(teamId));

            break;
          }
        }
      } catch (err) {
        /*
         * Do NOT make the entire registration page
         * fail just because status/team lookup failed.
         */
        console.warn("Unable to load existing registration:", err);
      }
    },
    [checkRegistrationStatus],
  );

  /*
   * ----------------------------------------------------
   * After auction is loaded, find existing registration
   * ----------------------------------------------------
   */
  useEffect(() => {
    if (!id || !auction) {
      return;
    }

    loadExistingRegistration(id);
  }, [id, auction, loadExistingRegistration]);

  /*
   * ----------------------------------------------------
   * Open team selection modal
   * ----------------------------------------------------
   */
  const openRegistration = async () => {
    if (!id) {
      toast.error("Auction ID is missing.");
      return;
    }

    try {
      setRegistering(true);

      const response = await getTeamsByAuction(id);

      console.log("OPEN REGISTRATION TEAMS:", response);

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.teams)) {
        list = response.teams;
      } else if (Array.isArray(response?.data?.teams)) {
        list = response.data.teams;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      }

      list = list.filter((team) => team && (team?._id || team?.id));

      setTeams(list);

      if (list.length === 0) {
        toast.error("No teams are available for registration.");
        return;
      }

      setSelectedTeamId("");
      setModalOpen(true);
    } catch (err) {
      console.error("Open registration error:", err);

      toast.error(
        err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load your teams.",
      );
    } finally {
      setRegistering(false);
    }
  };

  /*
   * ----------------------------------------------------
   * Submit registration
   * ----------------------------------------------------
   */
  const submitRegistration = async () => {
    if (!id) {
      toast.error("Auction ID is missing.");
      return;
    }

    if (!selectedTeamId) {
      toast.error("Please select a team.");
      return;
    }

    setRegistering(true);

    try {
      console.log("SUBMIT REGISTRATION:", {
        auctionId: id,
        teamId: selectedTeamId,
      });

      const response = await registerForAuction({
        auctionId: id,
        teamId: selectedTeamId,
      });

      console.log("REGISTER RESPONSE:", response);

      const newRegistration = extractRegistration(response);

      /*
       * Registration succeeded but backend did not
       * return the registration object.
       */
      if (!newRegistration) {
        console.warn(
          "Registration response did not contain registration:",
          response,
        );

        /*
         * Don't crash the page.
         *
         * We know the request succeeded, so keep the
         * selected team and check its status.
         */
        setModalOpen(false);

        toast.success(
          response?.message ||
            response?.data?.message ||
            "Registration submitted successfully. Waiting for admin approval.",
        );

        await checkRegistrationStatus(id, selectedTeamId, false);

        return;
      }

      const normalizedRegistration = {
        ...newRegistration,
        status: newRegistration?.status
          ? String(newRegistration.status).toLowerCase()
          : "pending",
      };

      /*
       * IMPORTANT:
       *
       * Keep selectedTeamId.
       *
       * We need it later to check whether the admin
       * has approved the registration.
       */
      setSelectedTeamId(String(selectedTeamId));

      setRegistration(normalizedRegistration);

      setModalOpen(false);

      toast.success(
        response?.message ||
          response?.data?.message ||
          "Registration submitted successfully. Waiting for admin approval.",
      );
    } catch (err) {
      console.error("Submit registration error:", err);

      /*
       * Only show an error toast.
       *
       * Do NOT throw the error.
       *
       * This prevents ErrorBoundary from showing the
       * "Something went wrong" page.
       */
      toast.error(
        err?.normalizedMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to submit registration.",
      );
    } finally {
      setRegistering(false);
    }
  };

  /*
   * ----------------------------------------------------
   * Automatic approval status polling
   * ----------------------------------------------------
   *
   * Once the user has registered:
   *
   * pending
   *    ↓
   * admin approves
   *    ↓
   * approved
   *
   * We check every 10 seconds.
   */
  useEffect(() => {
    if (!id || !selectedTeamId || !registration) {
      return;
    }

    const currentStatus = String(registration?.status || "").toLowerCase();

    /*
     * No need to poll after final status.
     */
    if (
      currentStatus === "approved" ||
      currentStatus === "rejected" ||
      currentStatus === "cancelled"
    ) {
      return;
    }

    let active = true;

    const refreshStatus = async () => {
      if (!active) {
        return;
      }

      const updatedRegistration = await checkRegistrationStatus(
        id,
        selectedTeamId,
        false,
      );

      if (!active || !updatedRegistration) {
        return;
      }

      const newStatus = String(updatedRegistration?.status || "").toLowerCase();

      /*
       * Notify the user when admin approves.
       */
      if (newStatus === "approved" && currentStatus === "pending") {
        toast.success("Your team has been approved for this auction.");
      }

      if (newStatus === "rejected" && currentStatus === "pending") {
        toast.error("Your team registration was rejected.");
      }
    };

    const interval = setInterval(refreshStatus, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id, selectedTeamId, registration?.status, checkRegistrationStatus]);

  /*
   * ----------------------------------------------------
   * Loading state
   * ----------------------------------------------------
   */
  if (loading) {
    return (
      <div
        className="
          mx-auto
          max-w-5xl
          px-6
          py-12
          lg:px-16
        "
      >
        <div className="animate-pulse">
          <div
            className="
              h-5
              w-32
              rounded
              bg-gray-200
              dark:bg-navy-800
            "
          />

          <div
            className="
              mt-8
              h-64
              rounded-2xl
              bg-gray-200
              dark:bg-navy-800
            "
          />
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * Error state
   * ----------------------------------------------------
   */
  if (error || !auction) {
    return (
      <div
        className="
          mx-auto
          max-w-5xl
          px-6
          py-12
          lg:px-16
        "
      >
        <Link
          to="/auctions"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-cyan-500
          "
        >
          <FiArrowLeft size={17} />
          Back to Auctions
        </Link>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-red-200
            bg-white
            p-10
            text-center
            dark:border-red-900/50
            dark:bg-navy-900
          "
        >
          <h1
            className="
              text-2xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Unable to load registration
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {error || "Auction information could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * Normal page
   * ----------------------------------------------------
   */
  const currentStatus = String(registration?.status || "").toLowerCase();

  const isPending = currentStatus === "pending";

  const isApproved = currentStatus === "approved";

  const isRejected = currentStatus === "rejected";

  const isCancelled = currentStatus === "cancelled";

  return (
    <>
      <main
        className="
          mx-auto
          max-w-5xl
          px-6
          py-10
          lg:px-16
        "
      >
        <Link
          to={`/auctions/${id}`}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-gray-600
            transition
            hover:text-cyan-500
            dark:text-gray-400
          "
        >
          <FiArrowLeft size={17} />
          Back to Auction
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div
            className="
              flex
              items-center
              gap-2
              text-cyan-500
            "
          >
            <FiShield size={19} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Auction Participation
            </span>
          </div>

          <h1
            className="
              mt-3
              font-display
              text-3xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            Register for {auction?.name || auction?.title || "Auction"}
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-7
              text-gray-500
              dark:text-gray-400
            "
          >
            Your team must be approved before it can participate in the live
            auction.
          </p>
        </div>

        {/* Registration Status */}
        <div
          className="
            mt-8
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
              gap-4
              sm:flex-row
              sm:items-center
            "
          >
            <div
              className={`
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  isApproved
                    ? "bg-emerald-500/10 text-emerald-500"
                    : isRejected || isCancelled
                      ? "bg-red-500/10 text-red-500"
                      : "bg-cyan-500/10 text-cyan-500"
                }
              `}
            >
              {isApproved ? (
                <FiCheckCircle size={21} />
              ) : isRejected || isCancelled ? (
                <FiXCircle size={21} />
              ) : (
                <FiClock size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className="
                  font-semibold
                  text-navy-950
                  dark:text-white
                "
              >
                Registration status
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Check your team's approval status before entering the auction.
              </p>
            </div>

            {registration?.status ? (
              <div className="shrink-0">
                <RegistrationStatusBadge status={currentStatus} />
              </div>
            ) : null}
          </div>

          {/* Pending */}
          {isPending && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-amber-500/20
                bg-amber-500/10
                px-4
                py-3
                text-sm
                text-amber-600
                dark:text-amber-300
              "
            >
              <strong>Waiting for admin approval.</strong> Your team has been
              registered and is waiting for an administrator to approve it.
            </div>
          )}

          {/* Approved */}
          {isApproved && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-emerald-500/20
                bg-emerald-500/10
                px-4
                py-3
                text-sm
                text-emerald-600
                dark:text-emerald-300
              "
            >
              <strong>Team approved!</strong> Your team has been approved and
              can participate in this auction.
            </div>
          )}

          {/* Rejected */}
          {isRejected && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-600
                dark:text-red-300
              "
            >
              <strong>Registration rejected.</strong> Your team registration was
              rejected by the administrator.
            </div>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-600
                dark:text-red-300
              "
            >
              <strong>Registration cancelled.</strong> This registration is no
              longer active.
            </div>
          )}

          {/* Register button */}
          {!registration && (
            <button
              type="button"
              onClick={openRegistration}
              disabled={registering}
              className="
                mt-6
                w-full
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
              "
            >
              {registering ? "Loading..." : "Register a Team"}
            </button>
          )}

          {/* Approved action */}
          {isApproved && (
            <Link
              to={`/auctions/${id}/access`}
              className="
                mt-6
                flex
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
                text-slate-950
                transition
                hover:bg-cyan-400
              "
            >
              <FiCheckCircle size={18} />
              Enter Live Auction
            </Link>
          )}
        </div>

        {/* Process */}
        <section className="mt-8">
          <h2
            className="
              font-display
              text-xl
              font-bold
              text-navy-950
              dark:text-white
            "
          >
            How registration works
          </h2>

          <div
            className="
              mt-5
              grid
              gap-4
              sm:grid-cols-3
            "
          >
            <ProcessStep
              number="01"
              title="Register"
              description="Choose your team and submit the registration."
            />

            <ProcessStep
              number="02"
              title="Get Approved"
              description="An administrator reviews your registration."
            />

            <ProcessStep
              number="03"
              title="Join Auction"
              description="Approved teams can access the live auction."
            />
          </div>
        </section>
      </main>

      {/* Registration Modal */}
      {modalOpen && (
        <AuctionRegistrationModal
          teams={teams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          onClose={() => {
            if (!registering) {
              setModalOpen(false);
              setSelectedTeamId("");
            }
          }}
          onSubmit={submitRegistration}
          loading={registering}
        />
      )}
    </>
  );
}

/*
 * ----------------------------------------------------
 * Process Step
 * ----------------------------------------------------
 */
function ProcessStep({ number, title, description }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        dark:border-navy-700
        dark:bg-navy-900
      "
    >
      <span
        className="
          text-xs
          font-bold
          tracking-widest
          text-cyan-500
        "
      >
        {number}
      </span>

      <h3
        className="
          mt-3
          font-semibold
          text-navy-950
          dark:text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-gray-500
          dark:text-gray-400
        "
      >
        {description}
      </p>
    </div>
  );
}
