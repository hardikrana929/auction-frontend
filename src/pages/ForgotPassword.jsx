import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";
import toast from "react-hot-toast";

import AuthShell from "../components/AuthShell";
import OtpInput from "../components/OtpInput";
import { forgotPassword, resetPassword, verifyResetOtp } from "../api/authApi";

const RESEND_SECONDS = 60;
const emptyDigits = () => Array(6).fill("");

/*
 * Colours: every light style has a `dark:` partner, so the page works in both
 * themes. Light = white surfaces with slate text; dark = slate-800/900
 * surfaces with white text. The theme is switched by the toggle in AuthShell.
 */
const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-950 focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-white dark:focus:ring-slate-600";

const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400";

const primaryButton =
  "w-full rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-slate-900";

const linkButton =
  "rounded font-bold text-slate-900 underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:text-slate-500 disabled:no-underline dark:text-white dark:focus-visible:ring-white dark:disabled:text-slate-400";

const maskEmail = (value) => {
  const [name = "", domain = ""] = String(value).split("@");

  return `${name.slice(0, 2)}${"*".repeat(Math.max(1, name.length - 2))}@${domain}`;
};

const STEPS = ["Email", "Verify code", "New password"];

/**
 * Forgot password with an e-mailed 6-digit code:
 *   1) enter e-mail  ->  2) enter the code  ->  3) choose a new password
 */
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(emptyDigits);
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [devNotice, setDevNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const otp = digits.join("");
  const rules = { length: password.length >= 8, match: Boolean(password) && password === confirm };

  const requestCode = async ({ resend = false } = {}) => {
    const normalized = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await forgotPassword(normalized);

      setEmail(normalized);
      setDigits(emptyDigits());
      setDevNotice(data?.devNotice || "");
      setCooldown(RESEND_SECONDS);
      setStep(2);

      toast.success(resend ? "A new code was requested." : "Check your email for the 6-digit code.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send the code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEmail = (event) => {
    event.preventDefault();
    requestCode();
  };

  const submitOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await verifyResetOtp(email, otp);

      setResetToken(data.resetToken);
      setStep(3);
      toast.success("Code verified. Choose a new password.");
    } catch (verifyError) {
      setError(
        verifyError.response?.data?.message || "Could not verify the code. Please try again.",
      );
      setDigits(emptyDigits());
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();

    if (!rules.length) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!rules.match) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await resetPassword(resetToken, password);

      setDone(true);
      toast.success(data?.message || "Password reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (resetError) {
      setError(
        resetError.response?.data?.message ||
          "Could not reset the password. Start again to get a new code.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle =
    step === 1
      ? "Enter your email and we'll send you a 6-digit verification code."
      : step === 2
        ? `We sent a 6-digit code to ${maskEmail(email)}.`
        : "Choose a new password for your AuctionPro account.";

  return (
    <AuthShell title="Forgot your password?" subtitle={subtitle}>
      {/* progress */}
      <ol className="mb-6 flex items-center gap-2 text-xs font-bold" aria-label="Progress">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = step === number && !done;
          const complete = step > number || done;

          return (
            <li
              key={label}
              className="flex flex-1 items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full ${
                  complete || active
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {complete ? <FiCheck /> : number}
              </span>

              <span
                className={`hidden sm:inline ${
                  active || complete
                    ? "text-slate-950 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200"
        >
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* step 1 - e-mail */}
      {step === 1 && (
        <form onSubmit={submitEmail} className="space-y-5">
          <div>
            <label htmlFor="fp-email" className={labelClass}>
              Email
            </label>

            <div className="relative">
              <FiMail className={iconClass} />

              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass}
              />
            </div>
          </div>

          <button disabled={submitting} className={primaryButton}>
            {submitting ? "Sending code…" : "Send verification code"}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          >
            <FiArrowLeft /> Back to login
          </Link>
        </form>
      )}

      {/* step 2 - code */}
      {step === 2 && (
        <form onSubmit={submitOtp} className="space-y-5">
          {devNotice && (
            <div className="rounded-xl border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
              {devNotice}
            </div>
          )}

          <div>
            <span className={labelClass}>Verification code</span>

            <OtpInput
              digits={digits}
              onChange={(next) => {
                setDigits(next);
                setError("");
              }}
              disabled={submitting}
              invalid={Boolean(error)}
            />

            <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
              The code is valid for 10 minutes. If you don&apos;t see the email, check your spam
              folder. Only registered email addresses receive a code.
            </p>
          </div>

          <button disabled={submitting || otp.length !== 6} className={primaryButton}>
            {submitting ? "Verifying…" : "Verify code"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => requestCode({ resend: true })}
              disabled={submitting || cooldown > 0}
              className={linkButton}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setDevNotice("");
              }}
              className={linkButton}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {/* step 3 - new password */}
      {step === 3 && !done && (
        <form onSubmit={submitPassword} className="space-y-5">
          {[
            ["New password", password, setPassword, "fp-password"],
            ["Confirm password", confirm, setConfirm, "fp-confirm"],
          ].map(([label, value, setter, id]) => (
            <div key={id}>
              <label htmlFor={id} className={labelClass}>
                {label}
              </label>

              <div className="relative">
                <FiLock className={iconClass} />

                <input
                  id={id}
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(event) => {
                    setter(event.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShow((visible) => !visible)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:text-slate-300 dark:hover:text-white dark:focus-visible:ring-white"
                >
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          ))}

          <div className="space-y-2 text-sm">
            <p className={rules.length ? "font-semibold text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400"}>
              {rules.length ? "✓" : "○"} At least 8 characters
            </p>

            <p className={rules.match ? "font-semibold text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400"}>
              {rules.match ? "✓" : "○"} Passwords match
            </p>
          </div>

          <button disabled={submitting} className={primaryButton}>
            {submitting ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      {done && (
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <FiCheck />
          </div>

          <h2 className="mt-4 font-bold text-slate-950 dark:text-white">Password updated</h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Redirecting you to login…</p>
        </div>
      )}
    </AuthShell>
  );
}
