import { useEffect, useState } from "react";

import { FiArrowLeft, FiCheckCircle, FiClock, FiShield } from "react-icons/fi";

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

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const auctionResponse = await getAuctionById(id);

        const auctionData =
          auctionResponse?.data || auctionResponse?.auction || auctionResponse;

        if (!mounted) return;

        setAuction(auctionData);

        /*
         * The backend reference defines the status
         * endpoint as:
         *
         * /api/auction-registration/status/:auctionId/:teamId
         *
         * Therefore status is checked after a team
         * is selected.
         */
      } catch (err) {
        if (!mounted) return;

        const message =
          err.normalizedMessage || err.message || "Unable to load auction.";

        setError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const openRegistration = async () => {
    try {
      setRegistering(true);

      /*
       * Teams are loaded here rather than automatically
       * on every page visit.
       */
      const response = await getTeamsByAuction(id);

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.teams)
            ? response.teams
            : [];

      setTeams(list);

      if (list.length === 0) {
        toast.error("No teams are available for registration.");
        return;
      }

      setModalOpen(true);
    } catch (err) {
      toast.error(
        err.normalizedMessage || err.message || "Unable to load your teams.",
      );
    } finally {
      setRegistering(false);
    }
  };

  const submitRegistration = async () => {
    if (!selectedTeamId) {
      toast.error("Please select a team.");
      return;
    }

    setRegistering(true);

    try {
      /*
       * IMPORTANT:
       *
       * The API reference does not document the exact
       * registration request body.
       *
       * If your backend expects:
       *
       * { auctionId, teamId }
       *
       * this is the correct payload.
       *
       * If your controller expects different fields,
       * change only this payload to match your backend.
       */

      const response = await registerForAuction({
        auctionId: id,
        teamId: selectedTeamId,
      });

      const newRegistration =
        response?.data || response?.registration || response;

      setRegistration(newRegistration);

      setModalOpen(false);
      setSelectedTeamId("");

      toast.success("Registration submitted successfully.");
    } catch (err) {
      toast.error(
        err.normalizedMessage ||
          err.message ||
          "Unable to submit registration.",
      );
    } finally {
      setRegistering(false);
    }
  };

  const checkTeamStatus = async (teamId) => {
    try {
      const response = await getRegistrationStatus(id, teamId);

      const data = response?.data || response?.registration || response;

      setRegistration(data);
    } catch {
      /*
       * A missing registration is not treated as a
       * page-level failure.
       */
    }
  };

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

        {/* Registration status */}

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
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-cyan-500/10
                text-cyan-500
              "
            >
              {registration?.status === "approved" ? (
                <FiCheckCircle size={21} />
              ) : (
                <FiClock size={21} />
              )}
            </div>

            <div className="flex-1">
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

            {registration?.status && (
              <RegistrationStatusBadge status={registration.status} />
            )}
          </div>

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

      {/* Modal */}

      {modalOpen && (
        <AuctionRegistrationModal
          teams={teams}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          onClose={() => {
            if (!registering) {
              setModalOpen(false);
            }
          }}
          onSubmit={submitRegistration}
          loading={registering}
        />
      )}
    </>
  );
}

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
