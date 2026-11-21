import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils/formatCurrency";

export default function PublicLiveAuctions() {
  const [auctions, setAuctions] = useState([]);
  useEffect(() => { api.get("/api/public/live-auctions").then(({ data }) => setAuctions(data.auctions || [])).catch(() => setAuctions([])); }, []);
  return <main className="mx-auto max-w-5xl p-6"><h1 className="mb-2 text-3xl font-black">Live Auctions</h1><p className="mb-6 text-slate-500">Watch current player bidding without signing in.</p><div className="grid gap-4 sm:grid-cols-2">{auctions.map(a => <Link key={a._id} to={`/watch/${a._id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs font-bold text-red-600">● LIVE NOW</span><h2 className="mt-2 text-xl font-bold">{a.name}</h2><p className="mt-1 text-sm text-slate-500">{a.description}</p><span className="mt-4 inline-block font-semibold text-indigo-600">Watch auction →</span></Link>)}</div>{!auctions.length && <p className="rounded-xl bg-slate-100 p-6 text-slate-600">There are no live auctions right now.</p>}</main>;
}
