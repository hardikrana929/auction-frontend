import { useEffect, useState } from "react";
import { FiImage, FiSave, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const roles = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];
const genders = ["Male", "Female", "Other"];
const battingHands = ["Right Hand", "Left Hand", "Not Applicable"];
const bowlingStyles = [
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

const empty = {
  auctionId: "",
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
  specialization: "",
  experience: 0,
  bio: "",
  basePrice: "",
  auctionOrder: 0,
};

export default function PlayerForm({ auctions, player, loading, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!player) {
      setForm(empty);
      setPhoto(null);
      setPreview("");
      return;
    }

    setForm({
      auctionId: player.auction?._id || player.auction || "",
      fullName: player.fullName || "",
      lastName: player.lastName || "",
      contactNo: player.contactNo || "",
      whatsappNo: player.whatsappNo || "",
      villageTown: player.villageTown || "",
      age: player.age ?? "",
      gender: player.gender || "Male",
      role: player.role || "",
      battingHand: player.battingHand || "Right Hand",
      bowlingStyle: player.bowlingStyle || "Does Not Bowl",
      specialization: Array.isArray(player.specialization)
        ? player.specialization.join(", ")
        : "",
      experience: player.experience ?? 0,
      bio: player.bio || "",
      basePrice: player.basePrice ?? "",
      auctionOrder: player.auctionOrder ?? 0,
    });
    setPhoto(null);
    setPreview(player.photo?.url || "");
  }, [player]);

  const set = (key, value) => setForm((v) => ({ ...v, [key]: value }));

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

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.auctionId ||
      !form.fullName.trim() ||
      !form.lastName.trim() ||
      !form.villageTown.trim() ||
      !form.role ||
      !form.basePrice
    ) {
      toast.error("Please complete all required player fields.");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "specialization") {
        const values = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        values.forEach((item) => data.append("specialization", item));
      } else if (value !== "" && value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    if (photo) data.append("photo", photo);

    await onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Player photo</p>
          <label className="block cursor-pointer">
            <div className="aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              {preview ? (
                <img src={preview} alt="Player preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-400">
                  <FiImage className="text-3xl" />
                  <span className="mt-2 text-xs">JPG/PNG · max 2 MB</span>
                </div>
              )}
            </div>
            <span className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
              <FiUpload /> Choose photo
            </span>
            <input type="file" accept="image/jpeg,image/png" onChange={choosePhoto} className="hidden" />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Auction" required>
            <select className="input" value={form.auctionId} onChange={(e) => set("auctionId", e.target.value)}>
              <option value="">Select auction</option>
              {auctions.map((auction) => (
                <option key={auction._id} value={auction._id}>{auction.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Role" required>
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="">Select role</option>
              {roles.map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>

          <Field label="First name" required><input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
          <Field label="Last name" required><input className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
          <Field label="Contact number"><input className="input" value={form.contactNo} onChange={(e) => set("contactNo", e.target.value)} /></Field>
          <Field label="WhatsApp number"><input className="input" value={form.whatsappNo} onChange={(e) => set("whatsappNo", e.target.value)} /></Field>
          <Field label="Village / Town" required><input className="input" value={form.villageTown} onChange={(e) => set("villageTown", e.target.value)} /></Field>
          <Field label="Age"><input type="number" min="10" max="60" className="input" value={form.age} onChange={(e) => set("age", e.target.value)} /></Field>

          <Field label="Gender">
            <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {genders.map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>

          <Field label="Batting hand">
            <select className="input" value={form.battingHand} onChange={(e) => set("battingHand", e.target.value)}>
              {battingHands.map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>

          <Field label="Bowling style">
            <select className="input" value={form.bowlingStyle} onChange={(e) => set("bowlingStyle", e.target.value)}>
              {bowlingStyles.map((value) => <option key={value}>{value}</option>)}
            </select>
          </Field>

          <Field label="Base price" required><input type="number" min="1" className="input" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} /></Field>
          <Field label="Auction order"><input type="number" min="0" className="input" value={form.auctionOrder} onChange={(e) => set("auctionOrder", e.target.value)} /></Field>
          <Field label="Experience (years)"><input type="number" min="0" className="input" value={form.experience} onChange={(e) => set("experience", e.target.value)} /></Field>
          <Field label="Specialization"><input className="input" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} placeholder="Batting, Fielding, Power hitter" /></Field>
        </div>
      </div>

      <Field label="Bio">
        <textarea className="input min-h-28 resize-y" maxLength={500} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
      </Field>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
        Current bid, bidder, sold team, sold price and player status are auction-controlled fields. They are not editable through the player profile form.
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        <button disabled={loading} className="primary-btn disabled:opacity-60">
          <FiSave /> {loading ? "Saving..." : player ? "Save changes" : "Create player"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}
