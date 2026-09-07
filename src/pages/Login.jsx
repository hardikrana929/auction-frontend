import { useState } from "react";
import AuthBrandPanel from "../components/AuthBrandPanel";
import {
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiLock,
  FiMail,
  FiCheckCircle,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await login(form);

      toast.success("Welcome back to AuctionPro!");

      const destination = location.state?.from || "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.normalizedMessage || error.message || "Unable to login.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-pitch-50 dark:bg-navy-950 lg:flex">
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}
      <AuthBrandPanel />

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}
      <div
        className="
          flex flex-1
          items-center justify-center
          px-6 py-12
          sm:px-8
          lg:px-12
        "
      >
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
              Welcome back
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Login to continue to AuctionPro.
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
                  className="
                    pointer-events-none
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                  size={18}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`
                    w-full rounded-xl border
                    bg-white
                    py-3 pl-11 pr-4
                    text-navy-950
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:ring-2
                    dark:bg-navy-850
                    dark:text-white
                    ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-navy-700"
                    }
                  `}
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="
                  mb-2 block text-sm font-medium
                  text-navy-950
                  dark:text-white
                "
              >
                Password
              </label>

              <div className="relative">
                <FiLock
                  className="
                    pointer-events-none
                    absolute left-4 top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                  size={18}
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`
                    w-full rounded-xl border
                    bg-white
                    py-3 pl-11 pr-12
                    text-navy-950
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:ring-2
                    dark:bg-navy-850
                    dark:text-white
                    ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-cyan-500 focus:ring-cyan-500/20 dark:border-navy-700"
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  disabled={submitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="
                    absolute right-4 top-1/2
                    -translate-y-1/2
                    text-gray-400
                    transition
                    hover:text-cyan-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="
                  text-sm font-medium
                  text-cyan-600
                  hover:text-cyan-500
                  dark:text-cyan-400
                "
              >
                Forgot password?
              </Link>
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
              {submitting ? "Signing in..." : "Sign in"}

              {!submitting && <FiArrowRight size={18} />}
            </button>
          </form>

          {/* Register */}
          <p
            className="
              mt-8 text-center text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="
                font-semibold
                text-cyan-600
                hover:text-cyan-500
                dark:text-cyan-400
              "
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
