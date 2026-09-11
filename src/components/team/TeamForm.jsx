import { useEffect, useState } from "react";
import { FiImage, FiSave, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const initial = {
  name: "",
  owner: "",
  ownerName: "",
  auction: "",
  status: "active",
};

export default function TeamForm({ auctions, team, loading, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!team) {
      setForm(initial);
      setLogo(null);
      setPreview("");
      return;
    }

    setForm({
      name: team.name || "",
      owner: team.owner?._id || team.owner || "",
      ownerName: team.ownerName || "",
      auction: team.auction?._id || team.auction || "",
      status: team.status || "active",
    });
    setPreview(team.logo?.url || "");
    setLogo(null);
  }, [team]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

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

    if (!form.name.trim() || !form.owner || !form.ownerName.trim() || !form.auction) {
      toast.error("Please complete all required fields.");
      return;
    }

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("owner", form.owner);
    data.append("ownerName", form.ownerName.trim());
    data.append("auction", form.auction);

    if (!team) {
      data.append("status", "active");
    } else if (form.status) {
      data.append("status", form.status);
    }

    if (logo) data.append("logo", logo);

    await onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Team logo
          </p>
          <label className="group block cursor-pointer">
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              {preview ? (
                <img src={preview} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <FiImage className="mx-auto text-3xl" />
                  <span className="mt-2 block text-xs">JPG/PNG · max 2 MB</span>
                </div>
              )}
            </div>
            <span className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
              <FiUpload /> Choose logo
            </span>
            <input type="file" accept="image/jpeg,image/png" onChange={chooseLogo} className="hidden" />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Team name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          <Field label="Owner name" required value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
          <Field
            label="Owner User ID"
            required
            value={form.owner}
            onChange={(e) => update("owner", e.target.value)}
            placeholder="MongoDB User ObjectId"
          />
          <div>
            <label className="label">Auction <span className="text-red-500">*</span></label>
            <select
              className="input"
              value={form.auction}
              onChange={(e) => update("auction", e.target.value)}
            >
              <option value="">Select auction</option>
              {auctions.map((auction) => (
                <option key={auction._id} value={auction._id}>
                  {auction.name}
                </option>
              ))}
            </select>
          </div>

          {team && (
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
        Budget fields are intentionally not editable. The backend initializes
        <strong> totalBudget</strong> and <strong>remainingBudget</strong> from the selected auction and controls purse changes.
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        <button disabled={loading} className="primary-btn disabled:cursor-not-allowed disabled:opacity-60">
          <FiSave /> {loading ? "Saving..." : team ? "Save changes" : "Create team"}
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
