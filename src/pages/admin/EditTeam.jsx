import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShield, FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { getTeamById, updateTeam } from "../../api/teamApi";
import { getAuctions } from "../../api/auctionApi";
import PageLoader from "../../components/PageLoader";
import TeamForm from "./TeamForm";

const EditTeam = () => {
  const { id, teamId } = useParams();
  const navigate = useNavigate();

  /*
   * Support either:
   *
   * /admin/teams/edit/:id
   *
   * or
   *
   * /admin/teams/edit/:teamId
   */
  const currentTeamId = teamId || id;

  const [team, setTeam] = useState(null);
  const [auctions, setAuctions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /*
   * Load team + auctions.
   */
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!currentTeamId) {
        toast.error("Missing team ID.");
        navigate("/admin/teams", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setLoadingAuctions(true);

        const [teamResponse, auctionResponse] = await Promise.all([
          getTeamById(currentTeamId),
          getAuctions(),
        ]);

        if (!mounted) return;

        /*
         * Normalize team response.
         */
        const teamData =
          teamResponse?.team || teamResponse?.data || teamResponse;

        /*
         * Normalize auction response.
         */
        const auctionData = Array.isArray(auctionResponse)
          ? auctionResponse
          : Array.isArray(auctionResponse?.auctions)
            ? auctionResponse.auctions
            : Array.isArray(auctionResponse?.data)
              ? auctionResponse.data
              : [];

        if (!teamData || typeof teamData !== "object") {
          throw new Error("Team data was not found.");
        }

        setTeam(teamData);
        setAuctions(auctionData);
      } catch (error) {
        console.error("Failed to load team:", error);

        if (!mounted) return;

        setTeam(null);
        setAuctions([]);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load team details.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingAuctions(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [currentTeamId, navigate]);

  /*
   * Handle TeamForm submission.
   */
  const handleSubmit = async (teamData) => {
    if (!currentTeamId) {
      toast.error("Missing team ID.");
      return;
    }

    /*
     * Validate auction ID again before sending
     * data to the backend.
     */
    if (!teamData?.auctionId) {
      toast.error("Please select a valid auction.");
      return;
    }

    const auctionExists = auctions.some((auction) => {
      const auctionId = auction?._id || auction?.id;

      if (!auctionId) {
        return false;
      }

      return String(auctionId) === String(teamData.auctionId);
    });

    if (!auctionExists) {
      toast.error("The selected auction is no longer available.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("name", teamData.name.trim());

      formData.append("ownerName", teamData.ownerName.trim());

      formData.append("ownerEmail", teamData.ownerEmail.trim());

      if (teamData.ownerPhone?.trim()) {
        formData.append("ownerPhone", teamData.ownerPhone.trim());
      }

      formData.append("auctionId", String(teamData.auctionId));

      /*
       * Only append a logo when the user selected
       * a new file.
       *
       * This prevents accidentally replacing the
       * existing logo with an empty value.
       */
      if (teamData.logo) {
        formData.append("logo", teamData.logo);
      }

      await updateTeam(currentTeamId, formData);

      toast.success("Team updated successfully.");

      navigate("/admin/teams");
    } catch (error) {
      console.error("Update team error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update team.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;

    navigate("/admin/teams");
  };

  /*
   * Initial page loading.
   */
  if (loading) {
    return <PageLoader />;
  }

  /*
   * Team could not be loaded.
   */
  if (!team) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <FiUsers size={24} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
              Team not found
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              The team may have been deleted or the provided team ID is invalid.
            </p>

            <Link
              to="/admin/teams"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FiArrowLeft size={17} />
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}
            <div className="flex items-center gap-4">
              <Link
                to="/admin/teams"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label="Back to teams"
              >
                <FiArrowLeft size={19} />
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <FiEdit3 className="text-indigo-600 dark:text-indigo-400" />

                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Team Management
                  </span>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Edit Team
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update team information and auction assignment.
                </p>
              </div>
            </div>

            {/* Admin badge */}
            <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              <FiShield size={16} />
              <span>Admin action</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <TeamForm
          initialValues={team}
          auctions={auctions}
          loadingAuctions={loadingAuctions}
          submitting={submitting}
          submitLabel="Update Team"
          showAuction={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
};

export default EditTeam;
