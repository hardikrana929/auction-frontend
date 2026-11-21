import { useEffect, useState } from "react";
import { FiImage, FiSave, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const initial = {
  name: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  auction: "",
  status: "active",
};

export default function TeamForm({
  auctions,
  defaultAuctionId = "",
  team,
  loading,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(initial);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!team) {
      // The auction is already chosen on the page, so it is not asked again.
      setForm({ ...initial, auction: defaultAuctionId || "" });
      setLogo(null);
      setPreview("");
      return;
    }

    setForm({
      name: team.name || "",
      ownerName: team.ownerName || "",
      ownerEmail: team.ownerEmail || team.owner?.email || "",
      ownerPhone: team.ownerPhone || "",
      auction: team.auction?._id || team.auction || "",
      status: team.status || "active",
    });
    setPreview(team.logo?.url || "");
    setLogo(null);
  }, [team, defaultAuctionId]);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const chooseLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Logo must be JPG or PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Logo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.ownerName.trim() ||
      !form.ownerEmail.trim() ||
      !form.auction
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    // Plain object out — CreateTeam.jsx (or EditTeam.jsx) is
    // responsible for turning this into FormData, since it also
    // needs to decide status/logo handling per create vs edit.
    onSubmit({
      name: form.name.trim(),
      ownerName: form.ownerName.trim(),
      ownerEmail: form.ownerEmail.trim(),
      ownerPhone: form.ownerPhone.trim(),
      auctionId: form.auction,
      status: form.status,
      logo,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Team logo
          </p>
          <label className="group block cursor-pointer">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 dark:border-white/10 dark:bg-white/[0.05]">
              {preview ? (
                <img
                  src={preview}
                  alt="Logo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <FiImage className="mx-auto text-3xl" />
                  <span className="mt-2 block text-xs">JPG/PNG · max 2 MB</span>
                </div>
              )}
            </div>
            <span className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <FiUpload /> Choose logo
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={chooseLogo}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Team name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Mumbai Strikers"
          />
          <Field
            label="Owner name"
            required
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            placeholder="e.g. Priya Sharma"
          />
          <Field
            label="Owner email"
            required
            type="email"
            value={form.ownerEmail}
            onChange={(e) => update("ownerEmail", e.target.value)}
            placeholder="e.g. priya@example.com"
          />
          <Field
            label="Owner phone"
            value={form.ownerPhone}
            onChange={(e) => update("ownerPhone", e.target.value)}
            placeholder="Optional"
          />

          <div>
            <label className="label">Auction</label>
            <div className="input flex items-center bg-slate-50 font-semibold text-slate-700 dark:bg-white/[0.04] dark:text-slate-200">
              {auctions.find((a) => String(a._id) === String(form.auction))
                ?.name || "Selected auction"}
            </div>
          </div>

          {team && (
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
        The owner's email is only saved as contact information. It does not
        have to belong to a registered account. Budget fields are intentionally
        not editable here. The backend initializes
        <strong> totalBudget</strong> and <strong>remainingBudget</strong> from
        the selected auction and controls purse changes.
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="secondary-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          disabled={loading}
          className="primary-btn disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave />{" "}
          {loading ? "Saving..." : team ? "Save changes" : "Create team"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, ...props }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input className="input" {...props} />
    </div>
  );
}
