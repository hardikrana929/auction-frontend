import { useEffect, useRef, useState } from "react";
import {
  FiCalendar,
  FiImage,
  FiInfo,
  FiSave,
  FiTag,
  FiUpload,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { BsCurrencyRupee } from "react-icons/bs";
import toast from "react-hot-toast";

const empty = {
  name: "",
  description: "",
  date: "",
  startingBudget: "",
  minimumBid: "",
  bidIncrement: "",
  bidRules: [ { upTo: "1000000", increment: "100000" }, { upTo: "3000000", increment: "200000" }, { upTo: "", increment: "500000" } ],
  maxTeams: "",
  maxPlayersPerTeam: "",
};

// Matches the backend's multer fileFilter exactly (JPEG/PNG only, 2MB) —
// keep these two in sync if the backend limits ever change.
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const placeholders = {
  name: "e.g. AuctionPro Season 5",
  date: "Select date & time",
  startingBudget: "e.g. 10000000",
  minimumBid: "e.g. 100000",
  bidIncrement: "e.g. 50000",
  maxTeams: "e.g. 8",
  maxPlayersPerTeam: "e.g. 15",
};

// ============================================================
// FIELD — kept OUTSIDE AuctionForm. Declaring it inside would make
// React see a brand-new component on every render (every keystroke),
// remounting the <input> and wiping focus after each character.
// ============================================================
function Field({
  name,
  label,
  icon: Icon,
  type = "text",
  step,
  form,
  errors,
  change,
  readOnly,
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
        <input
          disabled={readOnly}
          type={type}
          step={step}
          name={name}
          value={form[name]}
          onChange={change}
          placeholder={placeholders[name] || ""}
          className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 ${errors[name] ? "border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40" : "border-slate-200 focus:border-slate-900 focus:ring-slate-200 dark:border-slate-700 dark:focus:border-white dark:focus:ring-slate-700"}`}
        />
        {errors[name] && (
          <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            {errors[name]}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuctionForm({
  initialValues,
  onSubmit,
  submitting,
  submitLabel = "Create Auction",
  readOnly = false,
}) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({
      ...empty,
      ...initialValues,
      bidRules: Array.isArray(initialValues?.bidRules) && initialValues.bidRules.length
        ? initialValues.bidRules.map((rule) => ({ upTo: rule.upTo ?? "", increment: rule.increment ?? "" }))
        : empty.bidRules,
      date: toLocalInput(initialValues?.date),
    });
    setPreview(initialValues?.image || "");
    setImageFile(null);
    setImageRemoved(false);
  }, [initialValues]);

  const change = (e) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Image must be JPG or PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Auction name is required.";
    if (form.name.length > 100) e.name = "Maximum 100 characters.";
    if (!form.date) e.date = "Auction date is required.";
    else if (new Date(form.date) <= new Date())
      e.date = "Auction date must be in the future.";
    [
      "startingBudget",
      "minimumBid",
      "bidIncrement",
      "maxTeams",
      "maxPlayersPerTeam",
    ].forEach((k) => {
      if (form[k] === "" || Number(form[k]) <= 0)
        e[k] = "Enter a value greater than 0.";
    });
    if (!Array.isArray(form.bidRules) || form.bidRules.some((rule) => Number(rule.increment) <= 0 || (rule.upTo !== "" && Number(rule.upTo) <= 0))) {
      e.bidRules = "Each increment must be positive and thresholds must be positive or blank for no upper limit.";
    }
    if (Array.isArray(form.bidRules)) {
      const finiteLimits = form.bidRules.filter((rule) => rule.upTo !== "").map((rule) => Number(rule.upTo));
      if (finiteLimits.some((limit, index) => index > 0 && limit <= finiteLimits[index - 1])) e.bidRules = "Bid thresholds must be in ascending order.";
    }
    if (Number(form.maxTeams) < 2)
      e.maxTeams = "At least 2 teams are required.";
    if (Number(form.maxPlayersPerTeam) < 1)
      e.maxPlayersPerTeam = "At least 1 player is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("description", form.description.trim());
    data.append("date", new Date(form.date).toISOString());
    data.append("startingBudget", Number(form.startingBudget));
    data.append("minimumBid", Number(form.minimumBid));
    data.append("bidIncrement", Number(form.bidIncrement));
    data.append("bidRules", JSON.stringify(form.bidRules.map((rule) => ({ upTo: rule.upTo === "" ? null : Number(rule.upTo), increment: Number(rule.increment) }))));
    data.append("maxTeams", Number(form.maxTeams));
    data.append("maxPlayersPerTeam", Number(form.maxPlayersPerTeam));

    if (imageFile) data.append("image", imageFile);
    else if (imageRemoved) data.append("removeImage", "true");

    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          name="name"
          label="Auction name"
          icon={FiTag}
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
        <Field
          name="date"
          label="Auction date & time"
          icon={FiCalendar}
          type="datetime-local"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
      </div>

      <div>
        <label className="label">Description</label>
        <div className="relative">
          <FiInfo className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
          <textarea
            disabled={readOnly}
            name="description"
            value={form.description}
            onChange={change}
            maxLength={500}
            rows={4}
            placeholder="Tell participants what to expect from this auction..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-slate-700"
          />
        </div>
        <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
          {form.description.length}/500
        </p>
      </div>

      <div>
        <label className="label">
          Auction banner{" "}
          <span className="font-normal text-slate-400 dark:text-slate-500">
            (optional)
          </span>
        </label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <label
            className={`group block shrink-0 ${readOnly ? "" : "cursor-pointer"}`}
          >
            <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 sm:w-52">
              {preview ? (
                <img
                  src={preview}
                  alt="Auction banner preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <FiImage className="mx-auto text-2xl" />
                  <span className="mt-2 block text-xs">JPG/PNG · max 2 MB</span>
                </div>
              )}
            </div>
            {!readOnly && (
              <span className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <FiUpload /> {preview ? "Change image" : "Choose image"}
              </span>
            )}
            <input
              ref={fileInputRef}
              disabled={readOnly}
              type="file"
              accept="image/jpeg,image/png"
              onChange={chooseImage}
              className="hidden"
            />
          </label>
          {!readOnly && preview && (
            <button
              type="button"
              onClick={removeImage}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiX /> Remove
            </button>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Automatic bidding increments</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">The next increment is selected from the current bid. Leave the last threshold blank for “above”.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {form.bidRules.map((rule, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <label className="label">{index === form.bidRules.length - 1 ? "Up to amount (blank = no limit)" : "Bid amount up to (₹)"}</label>
              <input className="input" type="number" min="1" value={rule.upTo} disabled={readOnly} placeholder="No upper limit" onChange={(e) => setForm((v) => ({ ...v, bidRules: v.bidRules.map((r, i) => i === index ? { ...r, upTo: e.target.value } : r) }))} />
              <label className="label mt-3">Increment (₹)</label>
              <input className="input" type="number" min="1" value={rule.increment} disabled={readOnly} onChange={(e) => setForm((v) => ({ ...v, bidRules: v.bidRules.map((r, i) => i === index ? { ...r, increment: e.target.value } : r) }))} />
            </div>
          ))}
        </div>
        {errors.bidRules && <p className="mt-2 text-sm font-semibold text-red-600">{errors.bidRules}</p>}
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          name="startingBudget"
          label="Starting budget"
          icon={BsCurrencyRupee}
          type="number"
          step="1"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
        <Field
          name="minimumBid"
          label="Minimum bid"
          icon={BsCurrencyRupee}
          type="number"
          step="1"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
        <Field
          name="bidIncrement"
          label="Bid increment"
          icon={BsCurrencyRupee}
          type="number"
          step="1"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
        <Field
          name="maxTeams"
          label="Maximum teams"
          icon={FiUsers}
          type="number"
          step="1"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
        <Field
          name="maxPlayersPerTeam"
          label="Players per team"
          icon={FiUsers}
          type="number"
          step="1"
          form={form}
          errors={errors}
          change={change}
          readOnly={readOnly}
        />
      </div>

      {!readOnly && (
        <button disabled={submitting} className="primary-btn">
          <FiSave /> {submitting ? "Saving..." : submitLabel}
        </button>
      )}
    </form>
  );
}
