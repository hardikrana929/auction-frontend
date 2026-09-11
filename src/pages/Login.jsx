import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email || !form.password) return toast.error("Email and password are required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email address.");
    setSubmitting(true);
    try {
      await login({ email, password: form.password });
      toast.success("Login successful");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in.");
    } finally { setSubmitting(false); }
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue to AuctionPro.">
    <form onSubmit={submit} className="space-y-5">
      <Field icon={<FiMail />} label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="password" type={show ? "text" : "password"} value={form.password} onChange={update} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500" aria-label={show ? "Hide password" : "Show password"}>{show ? <FiEyeOff /> : <FiEye />}</button>
        </div>
      </div>
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-bold text-slate-700 hover:underline">Forgot password?</Link></div>
      <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"} {!submitting && <FiArrowRight />}</button>
      <p className="text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="font-bold text-slate-950 hover:underline">Create one</Link></p>
    </form>
  </AuthShell>;
}

function Field({ icon, label, ...props }) {
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="relative">{<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input {...props} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200" /></div></div>;
}
