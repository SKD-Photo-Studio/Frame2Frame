"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, TeamListItem } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const ROLES = ["Traditional Photographer", "Traditional Videographer", "Cinematographer", "Candid Photographer", "Assistant", "Choreographer", "Director"];
const PAY_TYPES = ["Lump Sum", "Per Day"];
const STATUSES = ["Unpaid", "Partial", "Paid"];

export default function AddArtistExpenseButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:gap-1.5 sm:px-3 sm:text-sm">
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add Artist
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Artist Expense">
        <AddArtistExpenseForm eventId={eventId} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function AddArtistExpenseForm({ eventId, onSuccess }: { eventId: string; onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<TeamListItem[]>([]);
  const [payType, setPayType] = useState("Lump Sum");

  useEffect(() => { api.team.list().then(setMembers).catch(() => {}); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const no_of_days = Number(fd.get("no_of_days")) || 0;
    const per_day_rate = Number(fd.get("per_day_rate")) || 0;
    const lumpTotal = Number(fd.get("total_amount")) || 0;

    const data = {
      user_id: fd.get("user_id") as string,
      assignment_role: fd.get("assignment_role") as string,
      pay_type: payType,
      date_start: fd.get("date_start") as string,
      date_end: fd.get("date_end") as string,
      no_of_days,
      per_day_rate,
      total_amount: payType === "Per Day" ? no_of_days * per_day_rate : lumpTotal,
      advance_paid: Number(fd.get("advance_paid")) || 0,
      status: fd.get("status") as string,
    };

    if (!data.user_id || !data.assignment_role) { setError("Member and role are required."); setLoading(false); return; }

    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/artist-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to add expense.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Team Member *</label>
          <select name="user_id" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">Select...</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Role *</label>
          <select name="assignment_role" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">Select...</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Date</label>
          <input name="date_start" type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">End Date</label>
          <input name="date_end" type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Pay Type</label>
        <div className="flex gap-4">
          {PAY_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" name="payTypeRadio" checked={payType === t} onChange={() => setPayType(t)} className="text-brand-600 focus:ring-brand-500" /> {t}
            </label>
          ))}
        </div>
      </div>

      {payType === "Per Day" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">No. of Days</label>
            <input name="no_of_days" type="number" min="0" placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Per Day Rate (₹)</label>
            <input name="per_day_rate" type="number" min="0" placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Total Amount (₹)</label>
          <input name="total_amount" type="number" min="0" placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Advance Paid (₹)</label>
          <input name="advance_paid" type="number" min="0" defaultValue="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
          <select name="status" defaultValue="Unpaid" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onSuccess} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{loading ? "Adding..." : "Add Expense"}</button>
      </div>
    </form>
  );
}
