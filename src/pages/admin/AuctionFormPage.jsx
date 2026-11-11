import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi";
import { createAuction, getAuction, updateAuction } from "../../api/auctionApi";
import AuctionForm from "../../components/auction/AuctionForm";
import LoadingScreen from "../../components/LoadingScreen";
import ErrorState from "../../components/ErrorState";

export default function AuctionFormPage({ edit = false }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [managerCredentials, setManagerCredentials] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!edit) return;
    getAuction(id)
      .then((r) => {
        const auction = r?.auction || r?.data || r;
        if (["live", "completed"].includes(auction?.status)) {
          setError(`Cannot edit a ${auction.status} auction.`);
        } else {
          setInitial(auction);
        }
      })
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to load auction."),
      )
      .finally(() => setLoading(false));
  }, [edit, id]);

  if (loading) return <LoadingScreen label="Loading auction..." />;
  if (error)
    return <ErrorState message={error} onRetry={() => location.reload()} />;

  const submit = async (data) => {
    setSaving(true);
    try {
      if (edit) {
        await updateAuction(id, data);
        toast.success("Auction updated successfully");
        nav(`/auctions/${id}`);
      } else {
        const r = await createAuction(data);
        const created = r?.auction || r?.data || r;
        toast.success("Auction created successfully");
        if (r?.managerCredentials)
          setManagerCredentials({
            ...r.managerCredentials,
            auctionMongoId: created?._id,
          });
        else nav(created?._id ? `/auctions/${created._id}` : "/admin/auctions");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to save auction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to={edit ? `/auctions/${id}` : "/admin/auctions"}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <FiArrowLeft /> Back
        </Link>
        <div className="surface-card p-6 sm:p-8">
          <div className="mb-7">
            <p className="eyebrow">Admin auction</p>
            <h1 className="page-title">
              {edit ? "Edit auction" : "Create auction"}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Set the auction schedule, each team’s budget, squad limits, and
              the bid increments. Each field includes a short explanation.
            </p>
          </div>
          <AuctionForm
            initialValues={initial || undefined}
            onSubmit={submit}
            submitting={saving}
            submitLabel={edit ? "Save changes" : "Create auction"}
          />
        </div>
      </div>
      {managerCredentials && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white/55 backdrop-blur-xl p-6 shadow-2xl dark:bg-slate-900/45">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Auction manager credentials
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Save these credentials now. The password cannot be shown again;
              you can reset it later.
            </p>
            {[
              ["Username", managerCredentials.username],
              ["Password", managerCredentials.password],
              ["Auction ID", managerCredentials.auctionId],
            ].map(([label, value]) => (
              <div key={label} className="mt-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={value || ""}
                    className="min-w-0 flex-1 rounded-lg border border-white/70 bg-white/40 px-3 py-2 font-mono text-sm text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(value || "");
                        setCopied(label);
                        toast.success(`${label} copied`);
                      } catch {
                        toast.error("Clipboard access unavailable");
                      }
                    }}
                    className="rounded-lg border border-slate-200 px-3 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    aria-label={`Copy ${label}`}
                  >
                    {copied === label ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                nav(
                  managerCredentials.auctionMongoId
                    ? `/auctions/${managerCredentials.auctionMongoId}`
                    : "/admin/auctions",
                )
              }
              className="mt-6 w-full rounded-xl px-4 py-3 font-bold bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/20 hover:brightness-110"
            >
              I have saved the credentials
            </button>
          </div>
        </div>
      )}
    </>
  );
}
