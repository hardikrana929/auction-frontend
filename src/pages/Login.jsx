import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiHash,
} from "react-icons/fi";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginAuction, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("admin");
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    auctionId: "",
  });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const update = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const identifier = form.identifier.trim().toLowerCase();
    if (!identifier || !form.password)
      return toast.error("Username and password are required.");
    if (mode === "auction" && form.auctionId.trim().length < 8)
      return toast.error("Auction ID must be at least 8 characters.");
    setSubmitting(true);
    try {
      if (mode === "auction")
        await loginAuction({
          username: identifier,
          password: form.password,
          auctionId: form.auctionId.trim(),
        });
      else await login({ identifier, password: form.password });
      toast.success("Login successful");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to AuctionPro."
    >
      <div className="mb-5 grid grid-cols-2 gap-2 glass-tabs !grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("admin")}
          className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "admin" ? "bg-white/85 text-slate-950 shadow-md dark:bg-white/15 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
        >
          Admin / User
        </button>
        <button
          type="button"
          onClick={() => setMode("auction")}
          className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "auction" ? "bg-white/85 text-slate-950 shadow-md dark:bg-white/15 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
        >
          Auction login
        </button>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <Field
          icon={<FiMail />}
          label={mode === "auction" ? "Username" : "Username or e-mail"}
          name="identifier"
          type="text"
          value={form.identifier}
          onChange={update}
          placeholder="Enter your username or e-mail"
          autoComplete="username"
        />
        {mode === "auction" && (
          <Field
            icon={<FiHash />}
            label="Auction ID"
            name="auctionId"
            type="text"
            value={form.auctionId}
            onChange={update}
            placeholder="Enter your auction ID"
            autoComplete="off"
          />
        )}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              name="password"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={update}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="glass-input py-3 pl-11 pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 dark:text-slate-400"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        {mode === "admin" && (
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-bold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Forgot password?
            </Link>
          </div>
        )}
        <button
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 px-5 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-60 glass-primary"
        >
          {submitting ? "Signing in…" : "Sign in"}{" "}
          {!submitting && <FiArrowRight />}
        </button>
        {mode === "admin" && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Create one
            </Link>
          </p>
        )}
      </form>
    </AuthShell>
  );
}
function Field({ icon, label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {icon}
        </span>
        <input
          {...props}
          className="glass-input py-3 pl-11 pr-4"
        />
      </div>
    </div>
  );
}
