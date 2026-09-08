import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiImage,
  FiSave,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiX,
  FiUploadCloud,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { createPlayer } from "../../api/playerApi";
import { getAuctions } from "../../api/auctionApi";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialForm = {
  name: "",
  role: "",
  basePrice: "",
  auctionId: "",
};

const getId = (item) => item?._id || item?.id || "";

const getAuctionName = (auction) =>
  auction?.name || auction?.title || "Unnamed Auction";

const getAuctionStatus = (auction) =>
  String(auction?.status || "").toLowerCase();

export default function CreatePlayer() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [auctions, setAuctions] = useState([]);

  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAuctions();

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const loadAuctions = async () => {
    try {
      setLoadingAuctions(true);

      const response = await getAuctions();

      const data = Array.isArray(response)
        ? response
        : response?.auctions || response?.data || [];

      setAuctions(data);
    } catch (error) {
      console.error("Failed to load auctions:", error);

      toast.error(error?.response?.data?.message || "Unable to load auctions");
    } finally {
      setLoadingAuctions(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 5MB.");

      event.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Player name is required.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Player name must contain at least 2 characters.";
    }

    if (!form.role.trim()) {
      nextErrors.role = "Player role is required.";
    }

    if (!form.basePrice) {
      nextErrors.basePrice = "Base price is required.";
    } else if (Number(form.basePrice) <= 0) {
      nextErrors.basePrice = "Base price must be greater than 0.";
    }

    if (!form.auctionId) {
      nextErrors.auctionId = "Please select an auction.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("role", form.role.trim());
      payload.append("basePrice", Number(form.basePrice));
      payload.append("auctionId", form.auctionId);

      if (image) {
        payload.append("image", image);
      }

      await createPlayer(payload);

      toast.success("Player created successfully.");

      navigate("/admin/players");
    } catch (error) {
      console.error("Create player error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create player.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAuction = auctions.find(
    (auction) => getId(auction) === form.auctionId,
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Link
              to="/admin/players"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Back to players"
            >
              <FiArrowLeft size={19} />
            </Link>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Admin
                </span>

                <span className="text-xs text-slate-500">
                  Player Management
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create Player
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Add a player to an AuctionPro auction.
              </p>
            </div>
          </div>

          <Link
            to="/admin/players"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <FiArrowLeft size={16} />
            Back to Players
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main form */}
            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                      <FiUser size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">
                        Player Information
                      </h2>
                      <p className="text-xs text-slate-500">
                        Basic information about the player
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {/* Player Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Player Name <span className="text-rose-400">*</span>
                    </label>

                    <div className="relative">
                      <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter player name"
                        maxLength={100}
                        className={`w-full rounded-xl border bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                          errors.name
                            ? "border-rose-500/60 focus:border-rose-500"
                            : "border-white/10 focus:border-indigo-500/60"
                        }`}
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Player Role <span className="text-rose-400">*</span>
                    </label>

                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="e.g. Batsman, Bowler, All-Rounder"
                      maxLength={60}
                      className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                        errors.role
                          ? "border-rose-500/60 focus:border-rose-500"
                          : "border-white/10 focus:border-indigo-500/60"
                      }`}
                    />

                    {errors.role && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.role}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label
                      htmlFor="basePrice"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Base Price <span className="text-rose-400">*</span>
                    </label>

                    <div className="relative">
                      <FiDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                      <input
                        id="basePrice"
                        name="basePrice"
                        type="number"
                        min="1"
                        step="1"
                        value={form.basePrice}
                        onChange={handleChange}
                        placeholder="Enter base price"
                        className={`w-full rounded-xl border bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                          errors.basePrice
                            ? "border-rose-500/60 focus:border-rose-500"
                            : "border-white/10 focus:border-indigo-500/60"
                        }`}
                      />
                    </div>

                    {errors.basePrice && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.basePrice}
                      </p>
                    )}
                  </div>

                  {/* Auction */}
                  <div>
                    <label
                      htmlFor="auctionId"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Auction <span className="text-rose-400">*</span>
                    </label>

                    <div className="relative">
                      <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                      <select
                        id="auctionId"
                        name="auctionId"
                        value={form.auctionId}
                        onChange={handleChange}
                        disabled={loadingAuctions}
                        className={`w-full appearance-none rounded-xl border bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition ${
                          errors.auctionId
                            ? "border-rose-500/60"
                            : "border-white/10 focus:border-indigo-500/60"
                        } ${!form.auctionId ? "text-slate-500" : ""}`}
                      >
                        <option value="">
                          {loadingAuctions
                            ? "Loading auctions..."
                            : "Select an auction"}
                        </option>

                        {auctions.map((auction) => (
                          <option key={getId(auction)} value={getId(auction)}>
                            {getAuctionName(auction)}
                            {getAuctionStatus(auction)
                              ? ` — ${getAuctionStatus(auction)}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {errors.auctionId && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.auctionId}
                      </p>
                    )}

                    {selectedAuction && (
                      <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
                        <p className="text-xs font-medium text-indigo-300">
                          Selected Auction
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {getAuctionName(selectedAuction)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Image upload */}
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                      <FiImage size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">Player Image</h2>
                      <p className="text-xs text-slate-500">
                        Optional profile image
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {!preview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40 px-6 py-12 text-center transition hover:border-indigo-400/40 hover:bg-indigo-500/5"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 transition group-hover:scale-105">
                        <FiUploadCloud size={25} />
                      </div>

                      <p className="text-sm font-semibold text-white">
                        Upload player image
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PNG, JPG or WEBP • Maximum 5MB
                      </p>
                    </button>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                      <img
                        src={preview}
                        alt="Player preview"
                        className="h-72 w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:bg-rose-500"
                        title="Remove image"
                      >
                        <FiX size={17} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-4 pt-10">
                        <p className="truncate text-sm font-medium text-white">
                          {image?.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {image
                            ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </section>
            </div>

            {/* Right side */}
            <div className="space-y-6">
              {/* Preview card */}
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">
                    Player Preview
                  </h2>
                </div>

                <div className="p-5">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-500/10 via-slate-900 to-violet-500/10">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Player"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-600">
                          <FiUser size={34} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="truncate text-lg font-bold text-white">
                        {form.name.trim() || "Player Name"}
                      </h3>

                      <p className="mt-1 text-sm text-indigo-400">
                        {form.role.trim() || "Player Role"}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-xs text-slate-500">
                          Base Price
                        </span>

                        <span className="text-sm font-bold text-white">
                          ₹
                          {form.basePrice
                            ? Number(form.basePrice).toLocaleString("en-IN")
                            : "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security notice */}
              <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FiShield size={17} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-emerald-300">
                      Admin Protected
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Player creation is restricted to authorized
                      administrators. The request is sent through the
                      authenticated API client.
                    </p>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <button
                  type="submit"
                  disabled={submitting || loadingAuctions}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSave size={17} />

                  {submitting ? "Creating Player..." : "Create Player"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/players")}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <FiX size={17} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
