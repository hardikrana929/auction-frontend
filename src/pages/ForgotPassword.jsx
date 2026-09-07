import { useState } from "react";
import { FiArrowRight, FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { forgotPassword } from "../api/passwordApi";
import AuthBrandPanel from "../components/AuthBrandPanel";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await forgotPassword({
        email: email.trim(),
      });

      toast.success("OTP sent to your email.");

      navigate("/verify-otp", {
        state: {
          email: email.trim(),
        },
      });
    } catch (err) {
      toast.error(
        err.normalizedMessage || err.message || "Unable to send OTP.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-pitch-50 dark:bg-navy-950 lg:flex">
      {/* =========================================
          LEFT BRAND PANEL
      ========================================== */}
      <AuthBrandPanel />

      {/* =========================================
          RIGHT FORM
      ========================================== */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="
                font-display text-3xl font-bold
                text-navy-950
                dark:text-white
              "
            >
              Forgot your password?
            </h2>

            <p
              className="
                mt-2
                text-gray-600
                dark:text-gray-400
              "
            >
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="
                  mb-2 block text-sm font-medium
                  text-navy-950
                  dark:text-white
                "
              >
                Email
              </label>

              <div className="relative">
                <FiMail
                  size={18}
                  className="
                    pointer-events-none
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email address"
                  disabled={submitting}
                  className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 outline-none transition focus:ring-2 dark:bg-navy-850 dark:text-white ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-cyan-500 dark:border-navy-700"
                  }`}
                />
              </div>

              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="
                flex w-full
                items-center justify-center gap-2
                rounded-xl
                bg-cyan-500
                px-5 py-3
                font-semibold text-white
                transition
                hover:bg-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting ? "Sending OTP..." : "Send OTP"}

              {!submitting && <FiArrowRight size={18} />}
            </button>
          </form>

          {/* Back to Login */}
          <p
            className="
              mt-8 text-center text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            Remember your password?{" "}
            <Link
              to="/login"
              className="
                font-semibold
                text-cyan-600
                hover:text-cyan-500
                dark:text-cyan-400
              "
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
