import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiImage,
  FiMail,
  FiPhone,
  FiShield,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TeamForm = ({
  initialValues = {},
  auctions = [],
  loadingAuctions = false,
  submitting = false,
  submitLabel = "Create Team",
  onSubmit,
  onCancel,
  showAuction = true,
}) => {
  const [form, setForm] = useState({
    name: initialValues?.name || "",
    ownerName: initialValues?.ownerName || "",
    ownerEmail: initialValues?.ownerEmail || "",
    ownerPhone: initialValues?.ownerPhone || "",
    auctionId:
      initialValues?.auctionId?._id ||
      initialValues?.auctionId?.id ||
      initialValues?.auctionId ||
      "",
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialValues?.logo || "");

  const [errors, setErrors] = useState({});

  /*
   * Keep form values synchronized when EditTeam
   * loads the existing team asynchronously.
   */
  useEffect(() => {
    setForm({
      name: initialValues?.name || "",
      ownerName: initialValues?.ownerName || "",
      ownerEmail: initialValues?.ownerEmail || "",
      ownerPhone: initialValues?.ownerPhone || "",
      auctionId:
        initialValues?.auctionId?._id ||
        initialValues?.auctionId?.id ||
        initialValues?.auctionId ||
        "",
    });

    if (initialValues?.logo) {
      setLogoPreview(initialValues.logo);
    }
  }, [initialValues]);

  /*
   * Cleanup generated object URLs.
   */
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        logo: "Only JPG, PNG, and WEBP images are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((previous) => ({
        ...previous,
        logo: "Logo size must be less than 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    /*
     * Revoke the previous blob URL before creating
     * a new preview.
     */
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setLogo(file);
    setLogoPreview(previewUrl);

    setErrors((previous) => ({
      ...previous,
      logo: "",
    }));
  };

  const removeLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogo(null);
    setLogoPreview("");

    const input = document.getElementById("team-logo");

    if (input) {
      input.value = "";
    }

    setErrors((previous) => ({
      ...previous,
      logo: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    const name = form.name.trim();
    const ownerName = form.ownerName.trim();
    const ownerEmail = form.ownerEmail.trim();
    const ownerPhone = form.ownerPhone.trim();

    /*
     * Team name validation
     */
    if (!name) {
      newErrors.name = "Team name is required.";
    } else if (name.length < 2) {
      newErrors.name = "Team name must contain at least 2 characters.";
    } else if (name.length > 100) {
      newErrors.name = "Team name cannot exceed 100 characters.";
    }

    /*
     * Owner name validation
     */
    if (!ownerName) {
      newErrors.ownerName = "Owner name is required.";
    } else if (ownerName.length < 2) {
      newErrors.ownerName = "Owner name must contain at least 2 characters.";
    } else if (ownerName.length > 100) {
      newErrors.ownerName = "Owner name cannot exceed 100 characters.";
    }

    /*
     * Email validation
     */
    if (!ownerEmail) {
      newErrors.ownerEmail = "Owner email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      newErrors.ownerEmail = "Enter a valid email address.";
    }

    /*
     * Phone validation
     */
    if (ownerPhone) {
      const normalizedPhone = ownerPhone.replace(/[\s()-]/g, "");

      if (!/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
        newErrors.ownerPhone = "Enter a valid phone number.";
      }
    }

    /*
     * Auction validation.
     */
    if (showAuction) {
      if (!form.auctionId) {
        newErrors.auctionId = "Please select an auction.";
      } else {
        /*
         * Make sure the selected ID actually exists
         * in the currently loaded auction list.
         */
        const auctionExists = auctions.some((auction) => {
          const auctionId = auction?._id || auction?.id;

          if (!auctionId) {
            return false;
          }

          return String(auctionId) === String(form.auctionId);
        });

        if (!auctionExists) {
          newErrors.auctionId = "The selected auction is no longer available.";
        }
      }
    }

    /*
     * Logo validation
     */
    if (logo) {
      if (!ALLOWED_IMAGE_TYPES.includes(logo.type)) {
        newErrors.logo = "Only JPG, PNG, and WEBP images are allowed.";
      }

      if (logo.size > MAX_FILE_SIZE) {
        newErrors.logo = "Logo size must be less than 5 MB.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    /*
     * Pass sanitized form data back to the parent.
     */
    onSubmit?.({
      name: form.name.trim(),
      ownerName: form.ownerName.trim(),
      ownerEmail: form.ownerEmail.trim(),
      ownerPhone: form.ownerPhone.trim(),
      auctionId: form.auctionId,
      logo,
    });
  };

  /*
   * Only display auctions that have a valid ID.
   */
  const validAuctions = auctions.filter((auction) => {
    const id = auction?._id || auction?.id;

    return Boolean(id);
  });

  /*
   * Find the selected auction safely.
   */
  const selectedAuction = validAuctions.find((auction) => {
    const auctionId = auction?._id || auction?.id;

    if (!auctionId || !form.auctionId) {
      return false;
    }

    return String(auctionId) === String(form.auctionId);
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Team Information */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FiUsers size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Team Information
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter the team's basic information.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* Team Name */}
          <div>
            <label
              htmlFor="team-name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Team Name <span className="text-red-500">*</span>
            </label>

            <input
              id="team-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              placeholder="e.g. Royal Strikers"
              autoComplete="organization"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700"
              }`}
            />

            {errors.name && (
              <p className="mt-2 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Owner Name + Email */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="owner-name"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Owner Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="owner-name"
                  name="ownerName"
                  type="text"
                  value={form.ownerName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter owner name"
                  autoComplete="name"
                  className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${
                    errors.ownerName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700"
                  }`}
                />
              </div>

              {errors.ownerName && (
                <p className="mt-2 text-xs text-red-500">{errors.ownerName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Owner Email <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  id="owner-email"
                  name="ownerEmail"
                  type="email"
                  value={form.ownerEmail}
                  onChange={handleChange}
                  placeholder="owner@example.com"
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${
                    errors.ownerEmail
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700"
                  }`}
                />
              </div>

              {errors.ownerEmail && (
                <p className="mt-2 text-xs text-red-500">{errors.ownerEmail}</p>
              )}
            </div>
          </div>

          {/* Owner Phone */}
          <div>
            <label
              htmlFor="owner-phone"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Owner Phone
              <span className="ml-1 text-xs font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="owner-phone"
                name="ownerPhone"
                type="tel"
                value={form.ownerPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${
                  errors.ownerPhone
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700"
                }`}
              />
            </div>

            {errors.ownerPhone && (
              <p className="mt-2 text-xs text-red-500">{errors.ownerPhone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Auction */}
      {showAuction && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <FiCalendar size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Assign Auction
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select the auction for this team.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loadingAuctions ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Loading auctions...
                  </span>
                </div>
              </div>
            ) : validAuctions.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <FiCalendar
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  />

                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      No valid auctions available
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-400/80">
                      There are currently no auctions with valid IDs available
                      for team assignment.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <label
                  htmlFor="auction-id"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Auction <span className="text-red-500">*</span>
                </label>

                <select
                  id="auction-id"
                  name="auctionId"
                  value={form.auctionId}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 dark:bg-slate-950 dark:text-white ${
                    errors.auctionId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-slate-700"
                  }`}
                >
                  <option value="">Select an auction</option>

                  {validAuctions.map((auction) => {
                    const id = auction?._id || auction?.id;

                    return (
                      <option key={String(id)} value={String(id)}>
                        {auction?.name || "Unnamed Auction"}
                      </option>
                    );
                  })}
                </select>

                {errors.auctionId && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors.auctionId}
                  </p>
                )}

                {selectedAuction && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                      {selectedAuction.name || "Unnamed Auction"}
                    </p>

                    {selectedAuction.date && (
                      <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-400">
                        {new Date(selectedAuction.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Team Logo */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FiImage size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Team Logo
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Optional image
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {logoPreview ? (
            <div className="relative max-w-xs overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <img
                src={logoPreview}
                alt="Team logo preview"
                className="aspect-square w-full object-cover"
              />

              <button
                type="button"
                onClick={removeLogo}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/95 dark:text-slate-200 dark:hover:bg-red-950/80 dark:hover:text-red-400"
                aria-label="Remove team logo"
              >
                <FiX size={17} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="team-logo"
              className="flex max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                <FiUpload size={22} />
              </div>

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Upload team logo
              </p>

              <p className="mt-1 text-xs text-slate-400">PNG, JPG or WEBP</p>

              <p className="mt-1 text-xs text-slate-400">Maximum 5 MB</p>

              <input
                id="team-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          )}

          {errors.logo && (
            <p className="mt-3 text-xs text-red-500">{errors.logo}</p>
          )}
        </div>
      </section>

      {/* Security Notice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex gap-3">
          <FiShield
            size={18}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              Administrator access
            </h3>

            <p className="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-400/80">
              Team creation and modification should only be available to
              authorized administrators. Server-side authorization and
              validation must also be enforced.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || (showAuction && validAuctions.length === 0)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiUsers size={17} />

          {submitting ? "Saving Team..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
