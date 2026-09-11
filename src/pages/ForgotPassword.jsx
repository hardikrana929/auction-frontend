import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [submitting, setSubmitting] = useState(false); const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return toast.error("Enter a valid email address.");
    setSubmitting(true);
    try { const data = await forgotPassword(normalized); setSent(true); toast.success(data.message || "If an account exists, a reset link has been sent."); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to process request."); }
    finally { setSubmitting(false); }
  };
  return <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send a secure reset link if an account exists.">
    {sent ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="font-bold text-slate-900">Check your inbox</p><p className="mt-2 text-sm leading-6 text-slate-600">If an account exists for this email, a password reset link has been sent. The link expires after 30 minutes.</p><Link to="/login" className="mt-5 inline-flex items-center gap-2 font-bold text-slate-900"><FiArrowLeft /> Back to login</Link></div> : <form onSubmit={submit} className="space-y-5"><div><label className="mb-2 block text-sm font-semibold text-slate-700">Email</label><div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200" /></div></div><button disabled={submitting} className="w-full rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white disabled:opacity-60">{submitting ? "Sending…" : "Send reset link"}</button><Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700"><FiArrowLeft /> Back to login</Link></form>}
  </AuthShell>;
}
