import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
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
      .catch((e) => setError(e.response?.data?.message || "Unable to load auction."))
      .finally(() => setLoading(false));
  }, [edit, id]);

  if (loading) return <LoadingScreen label="Loading auction..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

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
        nav(created?._id ? `/auctions/${created._id}` : "/admin/auctions");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to save auction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to={edit ? `/auctions/${id}` : "/admin/auctions"}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <FiArrowLeft /> Back
      </Link>
      <div className="surface-card p-6 sm:p-8">
        <div className="mb-7">
          <p className="eyebrow">Admin auction</p>
          <h1 className="page-title">{edit ? "Edit auction" : "Create auction"}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use the exact fields accepted by the AuctionPro backend.</p>
        </div>
        <AuctionForm
          initialValues={initial || undefined}
          onSubmit={submit}
          submitting={saving}
          submitLabel={edit ? "Save changes" : "Create auction"}
        />
      </div>
    </div>
  );
}
