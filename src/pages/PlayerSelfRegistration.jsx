import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiImage,
  FiLock,
  FiSend,
  FiUpload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";
import {
  getPublicRegistration,
  submitPublicRegistration,
} from "../api/playerRegistrationApi";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const ROLES = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];
const GENDERS = ["Male", "Female", "Other"];
const BATTING_HANDS = ["Right Hand", "Left Hand", "Not Applicable"];
const BOWLING_STYLES = [
  "Right Arm Fast",
  "Right Arm Medium",
  "Left Arm Fast",
  "Left Arm Medium",
  "Right Arm Off Spin",
  "Right Arm Leg Spin",
  "Left Arm Orthodox",
  "Left Arm Chinaman",
  "Does Not Bowl",
];
const PERSON_NAME = /^[\p{L}][\p{L} .'\u2019-]*$/u;

const emptyForm = {
  fullName: "",
  lastName: "",
  contactNo: "",
  whatsappNo: "",
  villageTown: "",
  age: "",
  gender: "Male",
  role: "",
  battingHand: "Right Hand",
  bowlingStyle: "Does Not Bowl",
  experience: "",
  specialization: "",
  bio: "",
  website: "", // honeypot — real users never see or fill this
};

const closedMessages = {
  disabled: "The organiser has closed player registration for this auction.",
  started: "This auction has already started, so registration is closed.",
  completed: "This auction is over, so registration is closed.",
  cancelled: "This auction was cancelled.",
};

const digitsOnly = (value) => value.replace(/\D/g, "").slice(0, 10);

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/60 bg-white/50 px-4 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/40 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <FiActivity />
          </span>
          <span className="text-lg font-black">AuctionPro</span>
        </Link>
        <ThemeToggle compact />
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}

function Notice({ icon: Icon, tone, title, message }) {
  const tones = {
    error: "text-red-500",
    lock: "text-amber-500",
    ok: "text-emerald-500",
  };
  return (
    <div className="surface-card p-8 text-center sm:p-12">
      <Icon className={`mx-auto text-5xl ${tones[tone]}`} />
      <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-300">
        {message}
      </p>
    </div>
  );
}

export default function PlayerSelfRegistration() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading" });
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    getPublicRegistration(token)
      .then((data) => {
        if (!active) return;
        setState({
          status: data.registration.open ? "open" : "closed",
          auction: data.auction,
          closedReason: data.registration.closedReason,
        });
      })
      .catch((err) => {
        if (!active) return;
        setState({
          status: err.response?.status === 404 ? "invalid" : "error",
        });
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Photo must be JPG or PNG.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Photo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (
      !form.fullName.trim() ||
      !form.lastName.trim() ||
      !form.villageTown.trim() ||
      !form.contactNo ||
      !form.role
    ) {
      return "Please fill in all fields marked with *.";
    }
    if (!PERSON_NAME.test(form.fullName.trim()) || !PERSON_NAME.test(form.lastName.trim())) {
      return "Names may contain letters, spaces, apostrophes, periods and hyphens only.";
    }
    if (!/^\d{10}$/.test(form.contactNo)) {
      return "Contact number must be exactly 10 digits.";
    }
    if (form.whatsappNo && !/^\d{10}$/.test(form.whatsappNo)) {
      return "WhatsApp number must be exactly 10 digits.";
    }
    if (
      form.age !== "" &&
      (!Number.isInteger(Number(form.age)) || Number(form.age) < 10 || Number(form.age) > 60)
    ) {
      return "Age must be a whole number between 10 and 60.";
    }
    if (
      form.experience !== "" &&
      (!Number.isInteger(Number(form.experience)) ||
        Number(form.experience) < 0 ||
        Number(form.experience) > 60)
    ) {
      return "Experience must be a whole number of years (0–60).";
    }
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "specialization") {
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => data.append("specialization", item));
      } else if (value !== "") {
        data.append(key, typeof value === "string" ? value.trim() : value);
      }
    });
    if (photo) data.append("photo", photo);

    setSubmitting(true);
    try {
      const result = await submitPublicRegistration(token, data);
      setDone({
        name: `${form.fullName.trim()} ${form.lastName.trim()}`,
        message: result.message,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ||
        (err.code === "ECONNABORTED"
          ? "The request timed out. Check your connection and try again."
          : "Unable to submit your registration. Please try again.");
      if (status === 403 && err.response?.data?.closedReason) {
        setState((s) => ({
          ...s,
          status: "closed",
          closedReason: err.response.data.closedReason,
        }));
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const registerAnother = () => {
    setForm(emptyForm);
    setPhoto(null);
    setPreview("");
    setDone(null);
  };

  if (state.status === "loading") {
    return (
      <Shell>
        <div className="grid place-items-center py-24">
          <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
        </div>
      </Shell>
    );
  }

  if (state.status === "invalid") {
    return (
      <Shell>
        <Notice
          icon={FiAlertCircle}
          tone="error"
          title="Link not valid"
          message="This registration link is incorrect or has been replaced. Please ask the organiser for the latest link."
        />
      </Shell>
    );
  }

  if (state.status === "error") {
    return (
      <Shell>
        <Notice
          icon={FiAlertCircle}
          tone="error"
          title="Something went wrong"
          message="We couldn't load this page. Check your internet connection and refresh."
        />
      </Shell>
    );
  }

  const { auction } = state;

  const banner = (
    <div className="surface-card mb-6 overflow-hidden">
      {auction.image && (
        <img
          src={auction.image}
          alt=""
          className="h-36 w-full object-cover sm:h-48"
        />
      )}
      <div className="p-5 sm:p-6">
        <p className="eyebrow">Player registration</p>
        <h1 className="page-title !mt-1">{auction.name}</h1>
        {auction.date && (
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FiCalendar />
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(new Date(auction.date))}
          </p>
        )}
        {auction.description && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {auction.description}
          </p>
        )}
      </div>
    </div>
  );

  if (state.status === "closed") {
    return (
      <Shell>
        {banner}
        <Notice
          icon={FiLock}
          tone="lock"
          title="Registration closed"
          message={
            closedMessages[state.closedReason] ||
            "Player registration for this auction is not available right now."
          }
        />
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        {banner}
        <div className="surface-card p-8 text-center sm:p-12">
          <FiCheckCircle className="mx-auto text-6xl text-emerald-500" />
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
            You&apos;re registered, {done.name}!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-300">
            {done.message} Team owners will be able to see your profile before the
            auction begins.
          </p>
          <button className="secondary-btn mt-6" onClick={registerAnother}>
            Register another player
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {banner}

      <form onSubmit={submit} className="surface-card space-y-7 p-5 sm:p-7" noValidate>
        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <div className="mx-auto w-40 sm:w-full">
            <p className="label">Your photo</p>
            <label className="block cursor-pointer">
              <div className="aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 dark:border-white/10 dark:bg-white/[0.05]">
                {preview ? (
                  <img src={preview} alt="Your photo preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <FiImage className="text-3xl" />
                    <span className="mt-2 text-xs">JPG/PNG · max 2 MB</span>
                  </div>
                )}
              </div>
              <span className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <FiUpload /> {preview ? "Change photo" : "Add photo"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={choosePhoto}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" required>
              <input
                className="input"
                autoComplete="given-name"
                placeholder="e.g. Rohit"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
            </Field>
            <Field label="Last name" required>
              <input
                className="input"
                autoComplete="family-name"
                placeholder="e.g. Sharma"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </Field>
            <Field label="Mobile number" required>
              <input
                className="input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
                value={form.contactNo}
                onChange={(e) => set("contactNo", digitsOnly(e.target.value))}
              />
            </Field>
            <Field label="WhatsApp number">
              <input
                className="input"
                type="tel"
                inputMode="numeric"
                placeholder="If different"
                value={form.whatsappNo}
                onChange={(e) => set("whatsappNo", digitsOnly(e.target.value))}
              />
            </Field>
            <Field label="Village / Town" required>
              <input
                className="input"
                autoComplete="address-level2"
                placeholder="e.g. Nagpur"
                value={form.villageTown}
                onChange={(e) => set("villageTown", e.target.value)}
              />
            </Field>
            <Field label="Age">
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min="10"
                max="60"
                placeholder="e.g. 24"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Playing role" required>
            <select
              className="input"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="">Select role</option>
              {ROLES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select
              className="input"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              {GENDERS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Batting hand">
            <select
              className="input"
              value={form.battingHand}
              onChange={(e) => set("battingHand", e.target.value)}
            >
              {BATTING_HANDS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Bowling style">
            <select
              className="input"
              value={form.bowlingStyle}
              onChange={(e) => set("bowlingStyle", e.target.value)}
            >
              {BOWLING_STYLES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Experience (years)">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              placeholder="e.g. 3"
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
            />
          </Field>
          <Field label="Specialization" hint="Separate with commas">
            <input
              className="input"
              placeholder="Opener, Power hitter, Fielding"
              value={form.specialization}
              onChange={(e) => set("specialization", e.target.value)}
            />
          </Field>
        </div>

        <Field label="About you" hint={`${form.bio.length}/500`}>
          <textarea
            className="input min-h-28 resize-y"
            maxLength={500}
            placeholder="Tournaments played, achievements, playing style…"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>

        {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </label>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your mobile number is visible only to the auction organisers. Your base
          price is set by the organiser.
        </p>

        <button type="submit" className="primary-btn w-full !py-3 text-base" disabled={submitting}>
          <FiSend /> {submitting ? "Submitting…" : "Register as player"}
        </button>
      </form>
    </Shell>
  );
}
