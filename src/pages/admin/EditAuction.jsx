import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiImage,
  FiInfo,
  FiSave,
  FiUpload,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { getAuctionById, updateAuction } from "../../api/auctionApi";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const getAuctionId = (auction) =>
  auction?._id || auction?.id || auction?.auction?._id || auction?.auction?.id;

const unwrapAuction = (response) => {
  if (!response) return null;

  if (response.auction) return response.auction;
  if (response.data?.auction) return response.data.auction;
  if (response.data && !Array.isArray(response.data)) return response.data;

  return response;
};

const formatMoney = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(number);
};

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

function MoneyInput({ label, value, onChange, required, error }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <FiDollarSign
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />

        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pl-10 ${
            error ? "border-red-400 focus:border-red-500" : ""
          }`}
          placeholder="0"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function NumberInput({ label, value, onChange, required, min = 1, error }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type="number"
        min={min}
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${
          error ? "border-red-400 focus:border-red-500" : ""
        }`}
        placeholder={String(min)}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    startingBudget: "",
    minimumBid: "",
    bidIncrement: "",
    maxTeams: "",
    maxPlayersPerTeam: "",
  });

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadAuction = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAuctionById(id);
        const auction = unwrapAuction(response);

        if (!auction) {
          throw new Error("Auction not found.");
        }

        if (!mounted) return;

        setForm({
          name: auction.name || "",
          description: auction.description || "",
          date: auction.date
            ? new Date(auction.date).toISOString().slice(0, 16)
            : "",
          startingBudget:
            auction.startingBudget !== undefined
              ? String(auction.startingBudget)
              : "",
          minimumBid:
            auction.minimumBid !== undefined ? String(auction.minimumBid) : "",
          bidIncrement:
            auction.bidIncrement !== undefined
              ? String(auction.bidIncrement)
              : "",
          maxTeams:
            auction.maxTeams !== undefined ? String(auction.maxTeams) : "",
          maxPlayersPerTeam:
            auction.maxPlayersPerTeam !== undefined
              ? String(auction.maxPlayersPerTeam)
              : "",
        });

        setExistingImage(auction.image || "");
      } catch (err) {
        console.error("Failed to load auction:", err);

        if (!mounted) return;

        const message =
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

    if (id) {
      loadAuction();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");

    const input = document.getElementById("auction-image");

    if (input) {
      input.value = "";
    }
  };

  const validate = () => {
    const nextErrors = {};

    const name = form.name.trim();
    const description = form.description.trim();

    const startingBudget = Number(form.startingBudget);
    const minimumBid = Number(form.minimumBid);
    const bidIncrement = Number(form.bidIncrement);
    const maxTeams = Number(form.maxTeams);
    const maxPlayersPerTeam = Number(form.maxPlayersPerTeam);

    if (!name) {
      nextErrors.name = "Auction name is required.";
    } else if (name.length < 3) {
      nextErrors.name = "Auction name must contain at least 3 characters.";
    } else if (name.length > 100) {
      nextErrors.name = "Auction name cannot exceed 100 characters.";
    }

    if (description.length > 1000) {
      nextErrors.description = "Description cannot exceed 1000 characters.";
    }

    if (!form.date) {
      nextErrors.date = "Auction date is required.";
    } else {
      const selectedDate = new Date(form.date);

      if (Number.isNaN(selectedDate.getTime())) {
        nextErrors.date = "Please enter a valid date.";
      }
    }

    if (!form.startingBudget) {
      nextErrors.startingBudget = "Starting budget is required.";
    } else if (!Number.isFinite(startingBudget) || startingBudget <= 0) {
      nextErrors.startingBudget = "Starting budget must be greater than 0.";
    }

    if (!form.minimumBid) {
      nextErrors.minimumBid = "Minimum bid is required.";
    } else if (!Number.isFinite(minimumBid) || minimumBid <= 0) {
      nextErrors.minimumBid = "Minimum bid must be greater than 0.";
    }

    if (
      Number.isFinite(startingBudget) &&
      Number.isFinite(minimumBid) &&
      minimumBid > startingBudget
    ) {
      nextErrors.minimumBid = "Minimum bid cannot exceed the starting budget.";
    }

    if (!form.bidIncrement) {
      nextErrors.bidIncrement = "Bid increment is required.";
    } else if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
      nextErrors.bidIncrement = "Bid increment must be greater than 0.";
    }

    if (!form.maxTeams) {
      nextErrors.maxTeams = "Maximum teams is required.";
    } else if (!Number.isInteger(maxTeams) || maxTeams < 1) {
      nextErrors.maxTeams = "Maximum teams must be at least 1.";
    }

    if (!form.maxPlayersPerTeam) {
      nextErrors.maxPlayersPerTeam = "Maximum players per team is required.";
    } else if (!Number.isInteger(maxPlayersPerTeam) || maxPlayersPerTeam < 1) {
      nextErrors.maxPlayersPerTeam =
        "Maximum players per team must be at least 1.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("description", form.description.trim());
      payload.append("date", form.date);

      payload.append("startingBudget", String(Number(form.startingBudget)));

      payload.append("minimumBid", String(Number(form.minimumBid)));

      payload.append("bidIncrement", String(Number(form.bidIncrement)));

      payload.append("maxTeams", String(Number(form.maxTeams)));

      payload.append(
        "maxPlayersPerTeam",
        String(Number(form.maxPlayersPerTeam)),
      );

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const response = await updateAuction(id, payload);

      const updatedAuction = unwrapAuction(response);
      const updatedId = getAuctionId(updatedAuction) || id;

      toast.success("Auction updated successfully.");

      navigate(`/auctions/${updatedId}`);
    } catch (err) {
      console.error("Failed to update auction:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to update auction.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-24 rounded-xl bg-slate-100" />
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="h-12 rounded-xl bg-slate-100" />
                  <div className="h-12 rounded-xl bg-slate-100" />
                </div>
                <div className="h-40 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiInfo size={24} />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Unable to load auction
            </h1>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>

              <Link
                to="/admin/auctions"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Auctions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = imagePreview || existingImage;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/auctions"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <FiArrowLeft size={17} />
            Back to Auctions
          </Link>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Edit Auction
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Update auction information, bidding rules, team limits, and
              auction artwork.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Basic Information */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              icon={FiInfo}
              title="Basic Information"
              description="Update the main details of your auction."
            />

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Auction Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`${inputClass} ${
                    errors.name ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  placeholder="e.g. Premier League Mega Auction"
                />

                <div className="mt-1.5 flex items-center justify-between">
                  {errors.name ? (
                    <p className="text-xs font-medium text-red-500">
                      {errors.name}
                    </p>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-slate-400">
                    {form.name.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={5}
                  className={`${inputClass} resize-none ${
                    errors.description
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Describe the auction..."
                />

                <div className="mt-1.5 flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-xs font-medium text-red-500">
                      {errors.description}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">Optional</span>
                  )}

                  <span className="text-xs text-slate-400">
                    {form.description.length}/1000
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Auction Date & Time
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiCalendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />

                  <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className={`${inputClass} pl-11 ${
                      errors.date ? "border-red-400 focus:border-red-500" : ""
                    }`}
                  />
                </div>

                {errors.date && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.date}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Auction Image */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              icon={FiImage}
              title="Auction Image"
              description="Replace the current auction artwork if needed."
            />

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {currentImage ? (
                  <div className="relative aspect-square">
                    <img
                      src={currentImage}
                      alt="Auction preview"
                      className="h-full w-full object-cover"
                    />

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-red-50 hover:text-red-600"
                        title="Remove selected image"
                      >
                        <FiX size={17} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center text-center text-slate-400">
                    <FiImage size={36} />
                    <span className="mt-2 text-xs font-medium">No image</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <label
                  htmlFor="auction-image"
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    <FiUpload size={21} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-800">
                    Choose a new image
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG or WEBP up to 5 MB
                  </p>

                  <span className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                    Browse Files
                  </span>

                  <input
                    id="auction-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imageFile && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {imageFile.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="ml-3 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <FiX size={17} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Budget */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              icon={FiDollarSign}
              title="Bidding Configuration"
              description="Configure the budget and bidding rules."
            />

            <div className="grid gap-5 md:grid-cols-3">
              <MoneyInput
                label="Starting Budget"
                required
                value={form.startingBudget}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    startingBudget: value,
                  }))
                }
                error={errors.startingBudget}
              />

              <MoneyInput
                label="Minimum Bid"
                required
                value={form.minimumBid}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumBid: value,
                  }))
                }
                error={errors.minimumBid}
              />

              <MoneyInput
                label="Bid Increment"
                required
                value={form.bidIncrement}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    bidIncrement: value,
                  }))
                }
                error={errors.bidIncrement}
              />
            </div>

            {(form.startingBudget || form.minimumBid || form.bidIncrement) && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current Configuration
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Starting Budget</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      ₹{formatMoney(form.startingBudget) || "0"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Minimum Bid</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      ₹{formatMoney(form.minimumBid) || "0"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Bid Increment</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      ₹{formatMoney(form.bidIncrement) || "0"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Team Configuration */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <SectionHeader
              icon={FiUsers}
              title="Team Configuration"
              description="Set participation and squad limits."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <NumberInput
                label="Maximum Teams"
                required
                min={1}
                value={form.maxTeams}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    maxTeams: value,
                  }))
                }
                error={errors.maxTeams}
              />

              <NumberInput
                label="Maximum Players Per Team"
                required
                min={1}
                value={form.maxPlayersPerTeam}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    maxPlayersPerTeam: value,
                  }))
                }
                error={errors.maxPlayersPerTeam}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/auctions"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving Changes...
                </>
              ) : (
                <>
                  <FiSave size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
