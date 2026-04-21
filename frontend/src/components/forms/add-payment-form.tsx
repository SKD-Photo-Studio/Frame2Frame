"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/modal";

import { api } from "@/lib/api";
const INSTALLMENT_TYPES = ["Booking Amount", "Installment 1", "Installment 2", "Installment 3"];

export default function AddPaymentButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      installment_type: fd.get("installment_type") as string,
      amount: Number(fd.get("amount")) || 0,
      payment_method: fd.get("payment_method") as string,
      transaction_id: fd.get("transaction_id") as string,
      payment_date: fd.get("payment_date") as string,
    };

    if (!data.installment_type || !data.amount) { setError("Type and amount are required."); setLoading(false); return; }

    try {
      await api.events.addPayment(eventId, data);
      router.refresh();
      setOpen(false);
    } catch {
      setError("Failed to add payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:gap-1.5 sm:px-3 sm:text-sm">
        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add Payment
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Installment Type *</label>
            <select name="installment_type" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Select...</option>
              {INSTALLMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Amount (₹) *</label>
              <input name="amount" type="number" min="0" placeholder="e.g. 50000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mode of Payment</label>
              <select 
                name="payment_method" 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {paymentMethod === "Online" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Transaction ID</label>
                <input name="transaction_id" placeholder="Optional" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            )}
            <div className={paymentMethod !== "Online" ? "col-span-2" : ""}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
              <input name="payment_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">{loading ? "Adding..." : "Add Payment"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
