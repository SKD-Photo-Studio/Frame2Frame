"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CreditCard, Banknote } from "lucide-react";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";

const INSTALLMENT_TYPES = ["Booking Amount", "Installment 1", "Installment 2", "Installment 3"];
const MODES = ["Online", "Cash"];

export default function AddPaymentButton({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [installmentType, setInstallmentType] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!installmentType) {
      setError("Please select an installment type.");
      setLoading(false);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const data = {
      installment_type: installmentType,
      amount: Number(fd.get("amount")) || 0,
      payment_method: paymentMethod,
      transaction_id: fd.get("transaction_id") as string,
      payment_date: fd.get("payment_date") as string,
    };

    if (!data.amount) { setError("Amount is required."); setLoading(false); return; }

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
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Installment Type Toggle */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Installment Type *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INSTALLMENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInstallmentType(t)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    installmentType === t
                      ? "bg-brand-600 text-white shadow-md ring-2 ring-brand-600 ring-offset-2"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Amount (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input 
                  name="amount" 
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium" 
                />
              </div>
            </div>

            {/* Mode of Payment Toggle */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Mode</label>
              <div className="flex p-1 bg-gray-100 rounded-xl">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                      paymentMethod === m
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {m === "Online" ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Transaction ID */}
            {paymentMethod === "Online" ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Transaction ID</label>
                <input 
                  name="transaction_id" 
                  placeholder="TXN..." 
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" 
                />
              </div>
            ) : (
                <div className="hidden sm:block" />
            )}

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Date</label>
              <input 
                name="payment_date" 
                type="date" 
                defaultValue={new Date().toISOString().split("T")[0]} 
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all" 
              />
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
              onClick={() => setOpen(false)} 
              className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 transition-all"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
