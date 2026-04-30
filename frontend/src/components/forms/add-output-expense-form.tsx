"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, User, BadgeCheck, Clock, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, TeamListItem } from "@/lib/api";
import { Combobox } from "@/components/ui/combobox";
import { AddTeamMemberForm } from "./add-team-form";
import { cn } from "@/lib/utils";

const DELIVERABLES = [
  "Traditional Video",
  "Highlight",
  "Teaser",
  "Ceremony Long Film",
  "Instagram Reel",
  "Candid Photos",
  "Traditional Photos",
  "Photo Album",
];

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
  const [totalAmount, setTotalAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  
  const [role, setRole] = useState("Editor");
  const [userId, setUserId] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => { 
    api.team.list().then(setMembers).catch(() => {}); 
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      user_id: userId,
      assignment_role: role,
      deliverable: deliverable,
      quantity: Number(fd.get("quantity")) || 1,
      total_amount: Number(fd.get("total_amount")) || 0,
      advance_paid: Number(fd.get("advance_paid")) || 0,
    };

    if (!data.user_id || !data.assignment_role || !data.deliverable) { 
      setError("Member, role, and deliverable are required."); 
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

  if (showAddMember) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-4 text-sm text-gray-500">Creating a new team member/vendor...</div>
        <AddTeamMemberForm 
          onSuccess={(newMember) => {
            if (newMember) {
              setMembers(prev => [...prev, newMember]);
              setUserId(newMember.id);
            }
            setShowAddMember(false);
          }} 
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="form-label !mb-0">Team Member *</label>
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>
          <Combobox
            value={userId}
            onChange={(val) => {
              setUserId(val);
              const member = members.find(m => m.id === val);
              if (member?.usual_role) setRole(member.usual_role);
            }}
            options={members.map((m) => ({ label: m.full_name, value: m.id }))}
            placeholder="Search..."
            onAddNew={() => setShowAddMember(true)}
            addNewLabel="New Member"
          />
        </div>
        <div>
          <label className="form-label">Role *</label>
          <Combobox
            value={role}
            onChange={setRole}
            options={[
              { label: "Editor", value: "Editor" },
              { label: "Vendor", value: "Vendor" },
              { label: "Album Printer", value: "Album Printer" },
              { label: "Logistics", value: "Logistics" },
              { label: "Miscellaneous", value: "Miscellaneous" },
            ]}
            placeholder="Select or type..."
            freeText={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label">Deliverable *</label>
          <Combobox
            value={deliverable}
            onChange={setDeliverable}
            options={DELIVERABLES.map(d => ({ label: d, value: d }))}
            placeholder="Select or type..."
            freeText={true}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label">Quantity</label>
          <input name="quantity" type="number" min="1" defaultValue="1" className="form-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {/* Total */}
        <div>
          <label className="form-label">Total (₹)</label>
          <input 
            name="total_amount" 
            type="number" 
            min="0" 
            placeholder="0" 
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            className="form-input" 
          />
        </div>

        {/* Advance */}
        <div>
          <label className="form-label">Advance (₹)</label>
          <input 
            name="advance_paid" 
            type="number" 
            min="0" 
            defaultValue="0" 
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
            className="form-input" 
          />
        </div>

        {/* Status Toggle (Standalone on mobile or 3rd col on desktop) */}
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label">Payment Status</label>
          <div className={`flex h-[46px] items-center justify-center rounded-xl border px-4 text-[10px] font-bold uppercase tracking-wider transition-all ${
            advancePaid > totalAmount ? "border-purple-200 dark:border-purple-900 bg-purple-600 dark:bg-purple-900 text-white shadow-sm" :
            advancePaid === totalAmount && totalAmount > 0 ? "border-green-200 dark:border-green-900 bg-green-600 dark:bg-green-900 text-white shadow-sm" :
            advancePaid > 0 ? "border-amber-200 dark:border-amber-900 bg-amber-500 dark:bg-amber-600 text-white shadow-sm" :
            "border-gray-200 dark:border-gray-800 bg-gray-600 dark:bg-gray-700 text-white shadow-sm"
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
          className="form-btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all"
        >
          {loading ? "Adding..." : "Add Output Expense"}
        </button>
      </div>
    </form>
  );
}
