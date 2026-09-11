import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const name = form.name.trim(), email = form.email.trim().toLowerCase();
    if (!name || !email || !form.password || !form.confirmPassword) return toast.error("All fields are required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Enter a valid email address.");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    setSubmitting(true);
    try { await register({ name, email, password: form.password }); toast.success("Account created successfully"); navigate("/dashboard", { replace: true }); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to create account."); }
    finally { setSubmitting(false); }
  };
  return <AuthShell title="Create your account" subtitle="Join AuctionPro and participate in professional cricket auctions.">
    <form onSubmit={submit} className="space-y-4">
      <Field icon={<FiUser />} label="Full name" name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" />
      <Field icon={<FiMail />} label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
      <PasswordField label="Password" name="password" value={form.password} onChange={update} show={show} setShow={setShow} />
      <PasswordField label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={update} show={show} setShow={setShow} />
      <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white disabled:opacity-60">{submitting ? "Creating account…" : "Create account"} {!submitting && <FiArrowRight />}</button>
      <p className="text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-slate-950 hover:underline">Sign in</Link></p>
    </form>
  </AuthShell>;
}
function Field({ icon, label, ...props }) { return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span><input {...props} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" /></div></div>; }
function PasswordField({ label, name, value, onChange, show, setShow }) { return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input name={name} type={show ? "text" : "password"} value={value} onChange={onChange} className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" autoComplete={name === "password" ? "new-password" : "new-password"} /><button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500">{show ? <FiEyeOff /> : <FiEye />}</button></div></div>; }
