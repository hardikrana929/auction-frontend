import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiDollarSign,
  FiImage,
  FiSave,
  FiShield,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import { getPlayerById, updatePlayer } from "../../api/playerApi";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialForm = {
  name: "",
  role: "",
  basePrice: "",
};

export default function EditPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);

  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPlayer();

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [id, preview]);

  const loadPlayer = async () => {
    try {
      setLoading(true);

      const response = await getPlayerById(id);

      const player = response?.player || response?.data || response;

      if (!player) {
        throw new Error("Player not found");
      }

      setForm({
        name: player.name || "",
        role: player.role || "",
        basePrice:
          player.basePrice !== undefined && player.basePrice !== null
            ? player.basePrice
            : "",
      });

      setCurrentImage(player.image || player.imageUrl || player.photo || "");
    } catch (error) {
      console.error("Failed to load player:", error);

      toast.error(error?.response?.data?.message || "Unable to load player.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
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

    setNewImage(file);
    setPreview(URL.createObjectURL(file));

    setErrors((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const removeNewImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setNewImage(null);
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

      if (newImage) {
        payload.append("image", newImage);
      }

      await updatePlayer(id, payload);

      toast.success("Player updated successfully.");

      navigate("/admin/players");
    } catch (error) {
      console.error("Update player error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update player.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedImage = preview || currentImage;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500" />

          <p className="mt-4 text-sm text-slate-400">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Link
              to="/admin/players"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
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
                Edit Player
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Update player information and profile image.
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
            {/* Main */}
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
                        Update the player's basic information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {/* Name */}
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
                        maxLength={100}
                        placeholder="Enter player name"
                        className={`w-full rounded-xl border bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                          errors.name
                            ? "border-rose-500/60"
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
                      maxLength={60}
                      placeholder="e.g. Batsman, Bowler, All-Rounder"
                      className={`w-full rounded-xl border bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 ${
                        errors.role
                          ? "border-rose-500/60"
                          : "border-white/10 focus:border-indigo-500/60"
                      }`}
                    />

                    {errors.role && (
                      <p className="mt-1.5 text-xs text-rose-400">
                        {errors.role}
                      </p>
                    )}
                  </div>

                  {/* Base price */}
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
                            ? "border-rose-500/60"
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
                </div>
              </section>

              {/* Image */}
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                      <FiImage size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">Player Image</h2>

                      <p className="text-xs text-slate-500">
                        Replace the current player image.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    <div className="flex h-72 items-center justify-center bg-gradient-to-br from-indigo-500/10 via-slate-900 to-violet-500/10">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt={form.name || "Player"}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-600">
                          <FiUser size={34} />
                        </div>
                      )}
                    </div>

                    {preview && (
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:bg-rose-500"
                        title="Remove new image"
                      >
                        <FiX size={17} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-indigo-400/40 hover:bg-indigo-500/5 hover:text-white"
                  >
                    <FiUploadCloud size={17} />

                    {preview ? "Choose Another Image" : "Replace Player Image"}
                  </button>

                  <p className="mt-2 text-center text-xs text-slate-500">
                    JPG, PNG or WEBP • Maximum 5MB
                  </p>

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

            {/* Sidebar */}
            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">
                    Live Preview
                  </h2>
                </div>

                <div className="p-5">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-500/10 via-slate-900 to-violet-500/10">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Player preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <FiUser size={38} className="text-slate-600" />
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
                      Only authorized administrators should be able to modify
                      player information.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSave size={17} />

                  {submitting ? "Saving Changes..." : "Save Changes"}
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
