"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api, TeamListItem } from "@/lib/api";
import { Calendar } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Popover from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { AddTeamMemberForm } from "./add-team-form";

const ROLES = ["Traditional Photographer", "Traditional Videographer", "Cinematographer", "Candid Photographer", "Assistant", "Choreographer", "Director"];

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
  const [payType, setPayType] = useState<"Lump Sum" | "Per Day">("Lump Sum");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => { 
    api.team.list().then(setMembers).catch(() => {}); 
  }, []);

  const noOfDays = selectedDates.length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const per_day_rate = Number(fd.get("per_day_rate")) || 0;
    const currentTotal = payType === "Per Day" ? noOfDays * per_day_rate : Number(fd.get("total_amount")) || 0;

    const data = {
      user_id: userId,
      assignment_role: role,
      pay_type: payType,
      date_start: selectedDates.length > 0 ? format(selectedDates.sort((a,b) => a.getTime() - b.getTime())[0], "yyyy-MM-dd") : null,
      date_end: selectedDates.length > 0 ? format(selectedDates.sort((a,b) => a.getTime() - b.getTime())[selectedDates.length - 1], "yyyy-MM-dd") : null,
      no_of_days: payType === "Per Day" ? noOfDays : 1,
      per_day_rate,
      total_amount: currentTotal,
      advance_paid: Number(fd.get("advance_paid")) || 0,
    };

    if (!data.user_id || !data.assignment_role) { 
      setError("Member and role are required."); 
      setLoading(false); 
      return; 
    }

    try {
      await api.events.addArtistExpense(eventId, data);
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
        <div className="mb-4 text-sm text-gray-500">Creating a new team member...</div>
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
            placeholder="Search member..."
            onAddNew={() => setShowAddMember(true)}
            addNewLabel="New Member"
          />
        </div>
        <div>
          <label className="form-label">Role *</label>
          <Combobox
            value={role}
            onChange={setRole}
            options={ROLES.map(r => ({ label: r, value: r }))}
            placeholder="Select or type..."
            freeText={true}
          />
        </div>
      </div>

      <div>
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-max">
          <button
            type="button"
            onClick={() => setPayType("Lump Sum")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              payType === "Lump Sum" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            Lump Sum
          </button>
          <button
            type="button"
            onClick={() => setPayType("Per Day")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              payType === "Per Day" ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            Per Day
          </button>
        </div>
      </div>

      {payType === "Per Day" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="form-label">Artist Dates</label>
            <Popover
              trigger={
                <button type="button" className="flex w-full items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-left text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  {selectedDates.length > 0
                    ? `${selectedDates.length} dates selected`
                    : "Select dates..."}
                </button>
              }
            >
              <div className="p-1">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                />
              </div>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">No. of Days</label>
              <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-300">
                {noOfDays}
              </div>
              <input type="hidden" name="no_of_days" value={noOfDays} />
            </div>
            <div>
              <label className="form-label">Per Day Rate (₹)</label>
              <input 
                name="per_day_rate" 
                type="number" 
                min="0" 
                placeholder="0" 
                onChange={(e) => setTotalAmount(Number(e.target.value) * noOfDays)}
                className="form-input" 
              />
            </div>
          </div>
        </div>
      )}

      {payType === "Lump Sum" && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="form-label">Total Amount (₹)</label>
          <input 
            name="total_amount" 
            type="number" 
            min="0" 
            placeholder="0" 
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            className="form-input" 
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Advance Paid (₹)</label>
          <input 
            name="advance_paid" 
            type="number" 
            min="0" 
            defaultValue="0" 
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
            className="form-input" 
          />
        </div>
        <div>
          <label className="form-label">Payment Status</label>
          <div className={cn(
            "flex h-[42px] items-center rounded-xl border px-3 text-sm font-medium",
            advancePaid > totalAmount ? "border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" :
            advancePaid === totalAmount && totalAmount > 0 ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
            advancePaid > 0 ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" :
            "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
          )}>
            {advancePaid > totalAmount ? "Overpaid" :
             advancePaid === totalAmount && totalAmount > 0 ? "Paid" : 
             advancePaid > 0 ? "Partial" : "Unpaid"}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onSuccess} className="form-btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all">{loading ? "Adding..." : "Add Expense"}</button>
      </div>
    </form>
  );
}
