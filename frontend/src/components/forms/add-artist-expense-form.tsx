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
      user_id: fd.get("user_id") as string,
      assignment_role: fd.get("assignment_role") as string,
      pay_type: payType,
      // For backend compatibility, we can send the first and last date as range if needed,
      // or we can extend the schema to support multiple dates. 
      // For now, we'll store the date range and keep the multi-dates in mind for bulk export.
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Pay Type</label>
        <div className="flex p-1 bg-gray-100 rounded-lg w-max">
          <button
            type="button"
            onClick={() => setPayType("Lump Sum")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              payType === "Lump Sum" ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Lump Sum
          </button>
          <button
            type="button"
            onClick={() => setPayType("Per Day")}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              payType === "Per Day" ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Per Day
          </button>
        </div>
      </div>

      {payType === "Per Day" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Artist Dates</label>
            <Popover
              trigger={
                <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-left text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">No. of Days</label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                {noOfDays}
              </div>
              <input type="hidden" name="no_of_days" value={noOfDays} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Per Day Rate (₹)</label>
              <input 
                name="per_day_rate" 
                type="number" 
                min="0" 
                placeholder="0" 
                onChange={(e) => setTotalAmount(Number(e.target.value) * noOfDays)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
              />
            </div>
          </div>
        </div>
      )}

      {payType === "Lump Sum" && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Total Amount (₹)</label>
          <input 
            name="total_amount" 
            type="number" 
            min="0" 
            placeholder="0" 
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Advance Paid (₹)</label>
          <input 
            name="advance_paid" 
            type="number" 
            min="0" 
            defaultValue="0" 
            onChange={(e) => setAdvancePaid(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Payment Status</label>
          <div className={cn(
            "flex h-[38px] items-center rounded-lg border px-3 text-sm font-medium",
            advancePaid > totalAmount ? "border-purple-200 bg-purple-50 text-purple-700" :
            advancePaid === totalAmount && totalAmount > 0 ? "border-green-200 bg-green-50 text-green-700" :
            advancePaid > 0 ? "border-amber-200 bg-amber-50 text-amber-700" :
            "border-gray-200 bg-gray-50 text-gray-500"
          )}>
            {advancePaid > totalAmount ? "Overpaid" :
             advancePaid === totalAmount && totalAmount > 0 ? "Paid" : 
             advancePaid > 0 ? "Partial" : "Unpaid"}
          </div>
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
