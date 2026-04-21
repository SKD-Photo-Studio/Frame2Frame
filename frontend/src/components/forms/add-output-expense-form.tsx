"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, User, BadgeCheck, Clock, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, TeamListItem } from "@/lib/api";

const DELIVERABLES = ["Reel", "Highlight", "Teaser", "Traditional Video", "Album", "Food & Travel", "Miscellaneous"];
const ROLES = ["Editor", "Vendor"];

export default function AddOutputExpenseButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:gap-1.5 sm:px-3 sm:text-sm">
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add Output
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Output Expense">
        <AddOutputExpenseForm eventId={eventId} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function AddOutputExpenseForm({ eventId, onSuccess }: { eventId: string; onSuccess: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<TeamListItem[]>([]);
  const [role, setRole] = useState("Editor");
  const [totalAmount, setTotalAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);

  useEffect(() => { 
    api.team.list()
      .then(setMembers)
      .catch(() => {}); 
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      user_id: fd.get("user_id") as string,
      assignment_role: role,
      deliverable: fd.get("deliverable") as string,
      quantity: Number(fd.get("quantity")) || 1,
      total_amount: Number(fd.get("total_amount")) || 0,
      advance_paid: Number(fd.get("advance_paid")) || 0,
    };

    if (!data.user_id || !data.deliverable) { 
        setError("Member and deliverable are required."); 
        setLoading(false); 
        return; 
    }

    try {
      await api.events.addOutputExpense(eventId, data);
      router.refresh();
      onSuccess();
    } catch {
      setError("Failed to add expense.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Team Member */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Team Member *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              name="user_id" 
              className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all appearance-none bg-white"
            >
              <option value="">Select Member</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>
        </div>

        {/* Role Toggle */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Role</label>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                  role === r
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Deliverable */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Deliverable *</label>
          <select 
            name="deliverable" 
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all bg-white"
          >
            <option value="">Select...</option>
            {DELIVERABLES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Quantity</label>
          <input 
            name="quantity" 
            type="number" 
            min="1" 
            defaultValue="1" 
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {/* Total */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Total (₹)</label>
          <input 
            name="total_amount" 
            type="number" 
            min="0" 
            placeholder="0" 
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium" 
          />
        </div>

        {/* Advance */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Advance (₹)</label>
          <input 
            name="advance_paid" 
            type="number" 
            min="0" 
            defaultValue="0" 
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" 
          />
        </div>

        {/* Status Toggle (Standalone on mobile or 3rd col on desktop) */}
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Status</label>
          <div className={`flex h-[46px] items-center justify-center rounded-xl border px-4 text-[10px] font-bold uppercase tracking-wider transition-all ${
            advancePaid > totalAmount ? "border-purple-200 bg-purple-600 text-white shadow-sm" :
            advancePaid === totalAmount && totalAmount > 0 ? "border-green-200 bg-green-600 text-white shadow-sm" :
            advancePaid > 0 ? "border-amber-200 bg-amber-500 text-white shadow-sm" :
            "border-gray-200 bg-gray-600 text-white shadow-sm"
          }`}>
            {advancePaid > totalAmount ? "Overpaid" :
             advancePaid === totalAmount && totalAmount > 0 ? "Paid" : 
             advancePaid > 0 ? "Partial" : "Unpaid"}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onSuccess} 
          className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 transition-all"
        >
          {loading ? "Adding..." : "Add Output Expense"}
        </button>
      </div>
    </form>
  );
}
