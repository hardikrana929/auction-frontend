import { useEffect, useState } from "react";
import { FiCalendar, FiDollarSign, FiHash, FiImage, FiInfo, FiSave, FiTag, FiUsers } from "react-icons/fi";

const empty = { name:"", description:"", image:"", date:"", startingBudget:"", minimumBid:"", bidIncrement:"", maxTeams:"", maxPlayersPerTeam:"" };
const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function AuctionForm({ initialValues, onSubmit, submitting, submitLabel="Create Auction", readOnly=false }) {
  const [form,setForm] = useState(empty); const [errors,setErrors] = useState({});
  useEffect(()=>setForm({...empty,...initialValues,date:toLocalInput(initialValues?.date)}),[initialValues]);
  const change=e=>setForm(v=>({...v,[e.target.name]:e.target.value}));
  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name="Auction name is required.";
    if(form.name.length>100) e.name="Maximum 100 characters.";
    if(!form.date) e.date="Auction date is required.";
    else if(new Date(form.date)<=new Date()) e.date="Auction date must be in the future.";
    ["startingBudget","minimumBid","bidIncrement","maxTeams","maxPlayersPerTeam"].forEach(k=>{ if(form[k]==="" || Number(form[k])<=0) e[k]="Enter a value greater than 0."; });
    if(Number(form.maxTeams)<2) e.maxTeams="At least 2 teams are required.";
    if(Number(form.maxPlayersPerTeam)<1) e.maxPlayersPerTeam="At least 1 player is required.";
    setErrors(e); return Object.keys(e).length===0;
  };
  const submit=e=>{e.preventDefault();if(!validate())return;onSubmit({...form, date:new Date(form.date).toISOString(), startingBudget:Number(form.startingBudget), minimumBid:Number(form.minimumBid), bidIncrement:Number(form.bidIncrement), maxTeams:Number(form.maxTeams), maxPlayersPerTeam:Number(form.maxPlayersPerTeam)});};
  const Field=({name,label,icon:Icon,type="text",step})=><div><label className="mb-1.5 block text-sm font-bold">{label}</label><div className="relative"><Icon className="pointer-events-none absolute left-3 top-3.5 text-slate-400"/><input disabled={readOnly} type={type} step={step} name={name} value={form[name]} onChange={change} className={`w-full rounded-xl border bg-white py-3 pl-10 pr-3 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800 ${errors[name]?"border-red-400 focus:ring-red-200":"border-slate-200 focus:border-slate-900 focus:ring-slate-200 dark:focus:border-white"}`} />{errors[name]&&<p className="mt-1 text-xs font-semibold text-red-600">{errors[name]}</p>}</div></div>;
  return <form onSubmit={submit} className="space-y-6">
    <div className="grid gap-5 lg:grid-cols-2"><Field name="name" label="Auction name" icon={FiTag}/><Field name="date" label="Auction date & time" icon={FiCalendar} type="datetime-local"/></div>
    <div><label className="mb-1.5 block text-sm font-bold">Description</label><div className="relative"><FiInfo className="absolute left-3 top-3.5 text-slate-400"/><textarea disabled={readOnly} name="description" value={form.description} onChange={change} maxLength={500} rows={4} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-white" /></div><p className="mt-1 text-right text-xs text-slate-400">{form.description.length}/500</p></div>
    <div><label className="mb-1.5 block text-sm font-bold">Image URL <span className="font-normal text-slate-400">(optional)</span></label><div className="relative"><FiImage className="absolute left-3 top-3.5 text-slate-400"/><input disabled={readOnly} name="image" value={form.image} onChange={change} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-white" /></div></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field name="startingBudget" label="Starting budget" icon={FiDollarSign} type="number" step="1"/><Field name="minimumBid" label="Minimum bid" icon={FiDollarSign} type="number" step="1"/><Field name="bidIncrement" label="Bid increment" icon={FiDollarSign} type="number" step="1"/><Field name="maxTeams" label="Maximum teams" icon={FiUsers} type="number" step="1"/><Field name="maxPlayersPerTeam" label="Players per team" icon={FiUsers} type="number" step="1"/></div>
    {!readOnly&&<button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"><FiSave/>{submitting?"Saving...":submitLabel}</button>}
  </form>;
}
