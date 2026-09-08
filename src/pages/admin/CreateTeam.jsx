import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShield, FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";

import { createTeam } from "../../api/teamApi";
import { getAuctions } from "../../api/auctionApi";
import PageLoader from "../../components/PageLoader";
import TeamForm from "./TeamForm";

const CreateTeam = () => {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAuctions = async () => {
      try {
        setLoadingAuctions(true);

        const response = await getAuctions();

        if (!mounted) return;

        /*
         * Support common API response formats:
         *
         * [
         *   {...}
         * ]
         *
         * {
         *   auctions: [...]
         * }
         *
         * {
         *   data: [...]
         * }
         */
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.auctions)
            ? response.auctions
            : Array.isArray(response?.data)
              ? response.data
              : [];

        setAuctions(data);
      } catch (error) {
        console.error("Failed to load auctions:", error);

        if (mounted) {
          setAuctions([]);

          toast.error(
            error?.response?.data?.message || "Unable to load auctions.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingAuctions(false);
        }
      }
    };

    loadAuctions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (teamData) => {
    /*
     * Extra protection before sending data to the API.
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

      if (teamData.logo) {
        formData.append("logo", teamData.logo);
      }

      await createTeam(formData);

      toast.success("Team created successfully.");

      navigate("/admin/teams");
    } catch (error) {
      console.error("Create team error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create team.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;

    navigate("/admin/teams");
  };

  if (loadingAuctions) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Page title */}
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
                  <FiUsers className="text-indigo-600 dark:text-indigo-400" />

                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Team Management
                  </span>
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Team
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add a new team to an AuctionPro auction.
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
          auctions={auctions}
          loadingAuctions={loadingAuctions}
          submitting={submitting}
          submitLabel="Create Team"
          showAuction={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
};

export default CreateTeam;
